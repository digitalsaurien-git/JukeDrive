// Configuration pour JukeDrive
// L'utilisateur peut fournir son CLIENT_ID ici ou via une interface UI.

export const GOOGLE_CONFIG = {
  CLIENT_ID: localStorage.getItem('jukedrive_client_id') || '',
  MUSIC_FOLDER_ID: localStorage.getItem('jukedrive_music_folder_id') || '',
  SCOPES: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly',
  DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
};

export const setClientId = (id) => {
  localStorage.setItem('jukedrive_client_id', id);
  window.location.reload();
};

export const setMusicFolderId = (id) => {
  localStorage.setItem('jukedrive_music_folder_id', id);
  window.location.reload();
};
