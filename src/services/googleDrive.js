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

// Lister les fichiers MP3
export const listFiles = async (q = "mimeType = 'audio/mpeg'") => {
    if (!gapiInited) return [];
    try {
        const response = await window.gapi.client.drive.files.list({
            pageSize: 1000,
            fields: 'nextPageToken, files(id, name, mimeType, webContentLink, thumbnailLink, parents)',
            q,
        });
        return response.result.files || [];
    } catch (err) {
        console.error("Error listing files:", err);
        throw err;
    }
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
