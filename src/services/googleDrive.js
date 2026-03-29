import { GOOGLE_CONFIG } from '../config';

let tokenClient = null;
let gapiInited = false;
let gsiInited = false;

// Initialisation de GAPI
export const initGapiClient = () => {
    return new Promise((resolve, reject) => {
        if (!window.gapi) {
            reject(new Error("GAPI script not loaded"));
            return;
        }
        window.gapi.load('client', async () => {
            try {
                await window.gapi.client.init({
                    apiKey: '', // Pas obligatoire si on utilise seulement OAuth2
                    discoveryDocs: GOOGLE_CONFIG.DISCOVERY_DOCS,
                });
                gapiInited = true;
                resolve();
            } catch (err) {
                console.error("GAPI init error:", err);
                reject(err);
            }
        });
    });
};

// Initialisation de Google Identity Services (GSI)
export const initTokenClient = (onLoginSuccess) => {
    if (!window.google) return;
    
    tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        scope: GOOGLE_CONFIG.SCOPES,
        callback: (resp) => {
            if (resp.error !== undefined) {
                console.error("GSI Error:", resp.error);
                return;
            }
            onLoginSuccess(resp.access_token);
        },
    });
    gsiInited = true;
};

// Demander le jeton
export const login = () => {
    if (tokenClient) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        console.error("Token client not initialized. Check your CLIENT_ID.");
    }
};

// Lister les fichiers audio avec pagination automatique compléte
export const listFiles = async (q = "mimeType contains 'audio/'") => {
    if (!gapiInited) return [];
    let allFiles = [];
    let pageToken = null;
    
    try {
        do {
            const response = await window.gapi.client.drive.files.list({
                pageSize: 1000,
                fields: 'nextPageToken, files(id, name, mimeType, webContentLink, thumbnailLink, parents)',
                q,
                pageToken: pageToken
            });
            
            const currentFiles = response.result.files || [];
            allFiles = [...allFiles, ...currentFiles];
            pageToken = response.result.nextPageToken;
        } while (pageToken);
        
        return allFiles;
    } catch (err) {
        console.error("Error listing files:", err);
        throw err;
    }
};

// Récupérer un lot de dossiers (pour traduire les IDs parents en Noms d'albums/artistes)
export const getFoldersInfo = async (folderIds) => {
    if (!gapiInited || folderIds.length === 0) return {};
    
    let result = {};
    // Google Drive limite les requêtes complex. On découpe en paquets de 50 IDs.
    for (let i = 0; i < folderIds.length; i += 50) {
        const chunk = folderIds.slice(i, i + 50);
        const query = chunk.map(id => `'${id}' = id`).join(' or ');
        try {
            const response = await window.gapi.client.drive.files.list({
                pageSize: 1000,
                fields: 'files(id, name, parents)',
                q: `mimeType = 'application/vnd.google-apps.folder' and (${query})`
            });
            response.result.files.forEach(f => {
                result[f.id] = f;
            });
        } catch (err) {
            console.error("Error fetching folders info:", err);
        }
    }
    return result;
};

// Récupérer le contenu d'un fichier en blob
export const getFileBlob = async (fileId, accessToken) => {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!response.ok) throw new Error("Failed to fetch file content");
    return await response.blob();
};
