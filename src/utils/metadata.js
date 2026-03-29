import * as musicMetadata from 'music-metadata-browser';

export const parseMetadata = async (blob) => {
    try {
        const metadata = await musicMetadata.parseBlob(blob);
        const { common } = metadata;

        let coverUrl = null;
        if (common.picture && common.picture.length > 0) {
            const pic = common.picture[0];
            const imageBlob = new Blob([pic.data], { type: pic.format });
            coverUrl = URL.createObjectURL(imageBlob);
        }

        return {
            title: common.title || 'Unknown Title',
            artist: common.artist || 'Unknown Artist',
            album: common.album || 'Unknown Album',
            year: common.year || null,
            genre: common.genre ? common.genre[0] : null,
            track: common.track.no || null,
            cover: coverUrl,
        };
    } catch (err) {
        console.error("Metadata parsing error:", err);
        return {
            title: 'Unknown Title',
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            cover: null,
        };
    }
};
