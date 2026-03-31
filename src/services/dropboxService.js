import { Dropbox } from 'dropbox';

let dbx = null;

export const initDropbox = (accessToken) => {
    if (accessToken) {
        dbx = new Dropbox({ accessToken });
        return true;
    }
    return false;
};

// --- AUTHENTIFICATION ---
const DBX_SCOPES = ['files.content.read', 'files.metadata.read', 'account_info.read'];

export const getAuthUrl = async (appKey) => {
    const { DropboxAuth } = await import('dropbox');
    const dbxAuth = new DropboxAuth({ clientId: appKey });
    
    // Le mode PKCE est obligatoire pour les nouvelles apps (Code Flow)
    const authUrl = await dbxAuth.getAuthenticationUrl(
        window.location.origin,
        null,
        'code',
        'offline',
        DBX_SCOPES, // Ajout explicite des scopes
        'none',
        true // PKCE activé
    );
    
    // Sauvegarder le code_verifier généré par le SDK pour l'échange final
    sessionStorage.setItem('jukedrive_dbx_verifier', dbxAuth.getCodeVerifier());
    return authUrl;
};

// Mode Implicite : Le token est renvoyé directement dans l'URL (#access_token=...)
export const getImplicitAuthUrl = async (appKey) => {
    const { DropboxAuth } = await import('dropbox');
    const dbxAuth = new DropboxAuth({ clientId: appKey });
    const authUrl = await dbxAuth.getAuthenticationUrl(
        window.location.origin,
        null,
        'token', // Mode Implicit
        null,
        DBX_SCOPES, // Ajout explicite des scopes
        'none',
        false
    );
    return authUrl;
};

export const handleAuthCallback = async () => {
    // 1. Vérifier si on a un token dans le fragment (#access_token=...) - Priorité Proxy
    const fullUrl = window.location.href;
    const hasHash = !!window.location.hash;
    const hasSearch = !!window.location.search;

    if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const token = hashParams.get('access_token');
        if (token) {
            localStorage.setItem('jukedrive_dropbox_token', token);
            // Nettoyer l'URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return token;
        }
    }

    // 2. Vérifier si on a un code (Code Flow / PKCE standard)
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
    const verifier = sessionStorage.getItem('jukedrive_dbx_verifier');

    if (code && verifier) {
        const { DropboxAuth } = await import('dropbox');
        const dbxAuth = new DropboxAuth({ 
            clientId: localStorage.getItem('jukedrive_dropbox_app_key') || 'wck8ktmlfsowpmq'
        });
        dbxAuth.setCodeVerifier(verifier);

        try {
            // Ajout d'un timeout manuel car le SDK peut "pendre" sur certains proxys
            const tokenPromise = dbxAuth.getAccessTokenFromCode(window.location.origin, code);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Timeout: Dropbox ne répond pas après 15s. Vérifiez votre proxy.")), 15000)
            );

            const response = await Promise.race([tokenPromise, timeoutPromise]);
            const token = response.result.access_token;
            if (token) {
                localStorage.setItem('jukedrive_dropbox_token', token);
                window.history.replaceState({}, document.title, window.location.pathname);
                return token;
            }
        } catch (error) {
            console.error("Erreur lors de l'échange du code PKCE:", error);
            throw error;
        }
    }
    return localStorage.getItem('jukedrive_dropbox_token');
};

export const validateToken = async (token) => {
    try {
        const tempDbx = new Dropbox({ accessToken: token });
        await tempDbx.usersGetCurrentAccount();
        localStorage.setItem('jukedrive_dropbox_token', token);
        return true;
    } catch (error) {
        console.error("Token invalide ou bloqué par le réseau:", error);
        return false;
    }
};

export const logout = () => {
    localStorage.removeItem('jukedrive_dropbox_token');
    dbx = null;
    window.location.reload();
};

// --- SCANNER ---
export const scanDropboxMusic = async (path = '') => {
    if (!dbx) throw new Error("Dropbox not initialized");
    
    let allFiles = [];
    let hasMore = true;
    let cursor = null;

    // Normalisation du chemin : Dropbox veut "" ou "/" pour la racine, ou "/nom_dossier"
    let cleanPath = path;
    if (cleanPath === '/' || cleanPath === '.') cleanPath = '';
    if (cleanPath && !cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;

    try {
        while (hasMore) {
            const response = cursor 
                ? await dbx.filesListFolderContinue({ cursor })
                : await dbx.filesListFolder({ 
                    path: cleanPath, 
                    recursive: true,
                    include_media_info: false // Plus robuste si désactivé par défaut
                });

            const entries = response.result.entries;
            const audioFiles = entries.filter(e => 
                e['.tag'] === 'file' && 
                (e.name.toLowerCase().endsWith('.mp3') || 
                 e.name.toLowerCase().endsWith('.m4a') || 
                 e.name.toLowerCase().endsWith('.wav'))
            );
            
            allFiles = [...allFiles, ...audioFiles];
            hasMore = response.result.has_more;
            cursor = response.result.cursor;
        }
        return allFiles;
    } catch (error) {
        console.error("Dropbox Detailed Scan Error:", error);
        // On renvoie un objet d'erreur structuré pour l'UI
        if (error.error?.error_summary) {
            throw new Error(`Dropbox: ${error.error.error_summary}`);
        }
        throw error;
    }
};

// --- STREAMING ---
export const getStreamUrl = async (path) => {
    if (!dbx) throw new Error("Dropbox not initialized");
    try {
        const response = await dbx.filesGetTemporaryLink({ path });
        return response.result.link;
    } catch (error) {
        console.error("Dropbox Stream Link Error:", error);
        throw error;
    }
};
