export const DROPBOX_CONFIG = {
  APP_KEY: localStorage.getItem('jukedrive_dropbox_app_key') || '',
  ROOT_PATH: localStorage.getItem('jukedrive_dropbox_root') || '', // Ex: /MUSIC
};

export const setDropboxAppKey = (key) => {
  localStorage.setItem('jukedrive_dropbox_app_key', key);
  window.location.reload();
};

export const setDropboxRoot = (path) => {
  localStorage.setItem('jukedrive_dropbox_root', path);
  window.location.reload();
};
