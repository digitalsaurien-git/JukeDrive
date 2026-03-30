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
export const getAuthUrl = async (appKey) => {
    const { DropboxAuth } = await import('dropbox');
    const dbxAuth = new DropboxAuth({ clientId: appKey });
    const authUrl = await dbxAuth.getAuthenticationUrl(
        window.location.origin,
        null,
        'token',
        'offline',
        null,
        'none',
        false
    );
    return authUrl;
};

export const handleAuthCallback = () => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get('access_token');
    if (token) {
        localStorage.setItem('jukedrive_dropbox_token', token);
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return token;
    }
    return localStorage.getItem('jukedrive_dropbox_token');
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

    try {
        while (hasMore) {
            const response = cursor 
                ? await dbx.filesListFolderContinue({ cursor })
                : await dbx.filesListFolder({ 
                    path, 
                    recursive: true,
                    include_media_info: true 
                });

            const entries = response.result.entries;
            // Filtrer pour ne garder que les fichiers audio
            const audioFiles = entries.filter(e => 
                e['.tag'] === 'file' && 
                (e.name.endsWith('.mp3') || e.name.endsWith('.m4a') || e.name.endsWith('.wav'))
            );
            
            allFiles = [...allFiles, ...audioFiles];
            hasMore = response.result.has_more;
            cursor = response.result.cursor;
        }

        return allFiles;
    } catch (error) {
        console.error("Dropbox Scan Error:", error);
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
