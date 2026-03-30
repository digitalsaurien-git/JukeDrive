import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getStreamUrl } from './dropboxService';

export const downloadAlbum = async (albumName, songs, accessToken) => {
    const zip = new JSZip();
    const folder = zip.folder(albumName);

    const downloadPromises = songs.map(async (song) => {
        try {
            // Pour Dropbox, on récupère le lien temporaire puis on fetch le blob
            const url = await getStreamUrl(song.path || song.id);
            const response = await fetch(url);
            const blob = await response.blob();
            
            const fileName = song.metadata ? `${song.metadata.title}.mp3` : song.name;
            folder.file(fileName, blob);
        } catch (err) {
            console.error(`Error downloading ${song.name}:`, err);
        }
    });

    await Promise.all(downloadPromises);

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${albumName}.zip`);
};

export const downloadPlaylist = async (playlistName, songs, accessToken) => {
    await downloadAlbum(playlistName, songs, accessToken);
};
