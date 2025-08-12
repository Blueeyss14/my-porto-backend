import sharp from 'sharp';
import mediaModel from '../model/mediaBackgroundModel.js';

export const createMedia = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'File not found' });

    const compressedBuffer = await sharp(file.buffer)
      .resize({ width: 1024, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const id = await mediaModel.createMedia(file.originalname, 'image/jpeg', compressedBuffer);
    res.status(201).json({ id, message: 'File successfully uploaded & compressed' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllMedia = async (_, res) => {
  try {
    const mediaList = await mediaModel.getAllMedia();
    res.json(mediaList);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await mediaModel.getMediaById(id);
    if (!media) return res.status(404).json({ error: 'File not found' });

 res.writeHead(200, {
  'Content-Type': media.mimetype,
  'Content-Length': media.data.length,
});
res.end(media.data);

  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'File not found' });

    const compressedBuffer = await sharp(file.buffer)
      .resize({ width: 1024, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const affectedRows = await mediaModel.updateMedia(id, file.originalname, 'image/jpeg', compressedBuffer);
    if (affectedRows === 0) return res.status(404).json({ error: 'File not found' });

    res.json({ message: 'File successfully updated & compressed' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await mediaModel.deleteMedia(id);
    if (affectedRows === 0) return res.status(404).json({ error: 'File not found' });

    res.json({ message: 'File successfully deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};
