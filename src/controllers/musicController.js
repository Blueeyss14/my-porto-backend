import music from '../model/musicModel.js';

export const getAllMusic = async (_, res) => {
    try {
        const songs = await music.getAllMusic();
        if (!songs || songs.length === 0) {
            return res.status(200).json({ msg: "No music found", data: [] });
        }

        const result = songs.map(song => ({
            id: song.id,
            song_name: song.song_name,
            song_file: 'available',
            mimetype: song.mimetype
        }));

        res.json({ data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMusicById = async (req, res) => {
    const { id } = req.params;
    try {
        const song = await music.getMusicById(id);
        if (!song) return res.status(404).json({ msg: "Music not found" });

        res.setHeader("Content-Type", song.mimetype);
        res.setHeader("Content-Disposition", "inline");
        res.setHeader("Accept-Ranges", "bytes");
        
        res.send(song.song_file);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createMusic = async (req, res) => {
    const { song_name } = req.body;
    if (!song_name) return res.status(400).json({ msg: "song_name is required" });
    if (!req.file) return res.status(400).json({ msg: "song_file is required" });

    try {
        const song_file = req.file.buffer;
        const mimetype = req.file.mimetype;
        const id = await music.createMusic(song_name, song_file, mimetype);
        res.status(201).json({ msg: "Music created", id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateMusic = async (req, res) => {
    const { id } = req.params;
    const { song_name } = req.body;
    
    if (!song_name && !req.file) return res.status(400).json({ msg: "Nothing to update" });

    try {
        const song_file = req.file ? req.file.buffer : null;
        const mimetype = req.file ? req.file.mimetype : null;
        
        console.log('song_file size:', song_file ? song_file.length : 'null');
        console.log('mimetype:', mimetype);
        
        const affected = await music.updateMusic(id, song_name || null, song_file, mimetype);
        console.log('Affected rows:', affected);
        
        if (affected === 0) return res.status(404).json({ msg: "Music not found" });
        res.json({ msg: "Music updated" });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteMusic = async (req, res) => {
    const { id } = req.params;
    try {
        const affected = await music.deleteMusic(id);
        if (affected === 0) return res.status(404).json({ msg: "Music not found" });
        res.json({ msg: "Music deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
