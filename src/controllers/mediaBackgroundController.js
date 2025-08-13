import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';
import os from 'os';
import path from 'path';
import fs from 'fs';
import mediaModel from '../model/mediaBackgroundModel.js';

ffmpeg.setFfmpegPath(ffmpegPath);

const compressVideo = (inputBuffer) => {
  return new Promise((resolve, reject) => {
    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `input-${Date.now()}`);
    const outputPath = path.join(tmpDir, `output-${Date.now()}.mp4`);

    fs.writeFileSync(inputPath, inputBuffer);

    ffmpeg(inputPath)
      .outputOptions([
        '-vf', 'scale=-1:1080', //1080p
        '-b:v', '1M', //bitrate 1Mbps
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-movflags', 'faststart'
      ])
      .format('mp4')
      .on('end', () => {
        const compressedBuffer = fs.readFileSync(outputPath);
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
        resolve(compressedBuffer);
      })
      .on('error', (err) => {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        reject(err);
      })
      .save(outputPath);
  });
};

export const createMedia = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'File not found' });

    let bufferToSave;
    let mimeTypeToSave;

    if (file.mimetype.startsWith('image/')) {
      bufferToSave = await sharp(file.buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .jpeg({ quality: 95 })
        .toBuffer();
      mimeTypeToSave = 'image/jpeg';
    } 
    else if (file.mimetype.startsWith('video/')) {
      bufferToSave = await compressVideo(file.buffer);
      mimeTypeToSave = 'video/mp4';
    } 
    else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const id = await mediaModel.createMedia(file.originalname, mimeTypeToSave, bufferToSave);
    res.status(201).json({ id, message: 'File uploaded & compressed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllMedia = async (_, res) => {
  try {
    const mediaList = await mediaModel.getAllMedia();
    if (!mediaList || mediaList.length === 0) {
      return res.status(200).json({ msg: "No categories found", data: [] });
    }
    res.json({data: mediaList});
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

    let bufferToSave;
    let mimeTypeToSave;

    if (file.mimetype.startsWith('image/')) {
      bufferToSave = await sharp(file.buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .jpeg({ quality: 95 })
        .toBuffer();
      mimeTypeToSave = 'image/jpeg';
    } 
    else if (file.mimetype.startsWith('video/')) {
      bufferToSave = await compressVideo(file.buffer);
      mimeTypeToSave = 'video/mp4';
    } 
    else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const affectedRows = await mediaModel.updateMedia(id, file.originalname, mimeTypeToSave, bufferToSave);
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
