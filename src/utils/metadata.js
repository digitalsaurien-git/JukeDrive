// import * as musicMetadata from 'music-metadata-browser';

export const parseMetadata = async (blob) => {
    // Désactivé temporairement pour stabiliser le build Vercel
    // Le scanner Dropbox extrait déjà les infos du chemin de fichier.
    return {
        title: 'Unknown Title',
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        cover: null,
    };
};
