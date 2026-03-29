import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getFileBlob } from './googleDrive';

export const downloadAlbum = async (albumName, songs, accessToken) => {
    const zip = new JSZip();
    const folder = zip.folder(albumName);

    const downloadPromises = songs.map(async (song) => {
        try {
            const blob = await getFileBlob(song.id, accessToken);
            // On utilise le titre de la chanson si dispo, sinon le nom du fichier
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
    // Similaire à l'album
    await downloadAlbum(playlistName, songs, accessToken);
};
