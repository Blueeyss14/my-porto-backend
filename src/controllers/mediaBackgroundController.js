import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';
import os from 'os';
import path from 'path';
import fs from 'fs';
import mediaModel from '../model/mediaBackgroundModel.js';

ffmpeg.setFfmpegPath(ffmpegPath);

const detectFileType = (file) => {
  const filename = file.originalname.toLowerCase();
  let detectedType = file.mimetype;

  if (file.mimetype === 'application/octet-stream' || !file.mimetype.includes('/')) {
    if (filename.match(/\.(jpg|jpeg)$/)) {
      detectedType = 'image/jpeg';
    } else if (filename.match(/\.png$/)) {
      detectedType = 'image/png';
    } else if (filename.match(/\.gif$/)) {
      detectedType = 'image/gif';
    } else if (filename.match(/\.webp$/)) {
      detectedType = 'image/webp';
    } else if (filename.match(/\.mp4$/)) {
      detectedType = 'video/mp4';
    } else if (filename.match(/\.(mov|quicktime)$/)) {
      detectedType = 'video/quicktime';
    } else if (filename.match(/\.(avi|x-msvideo)$/)) {
      detectedType = 'video/x-msvideo';
    }
  }

  return detectedType;
};

const isImageFile = (mimetype) => {
  return mimetype.startsWith('image/') || 
         ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(mimetype);
};

const isVideoFile = (mimetype) => {
  return mimetype.startsWith('video/') || 
         ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'].includes(mimetype);
};

const compressVideo = (inputBuffer) => {
  return new Promise((resolve, reject) => {
    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `input-${Date.now()}`);
    const outputPath = path.join(tmpDir, `output-${Date.now()}.mp4`);

    fs.writeFileSync(inputPath, inputBuffer);

    ffmpeg(inputPath)
      .outputOptions([
        '-vf', 'scale=-1:1080',
        '-b:v', '1M',
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
    if (!file) {
      return res.status(400).json({ 
        error: 'File not found',
        debug: {
          hasFile: !!req.file,
          hasFiles: !!req.files,
          bodyKeys: Object.keys(req.body || {}),
          contentType: req.headers['content-type']
        }
      });
    }

    const detectedMimeType = detectFileType(file);
    let bufferToSave;
    let mimeTypeToSave;

    if (isImageFile(detectedMimeType)) {
      try {
        bufferToSave = await sharp(file.buffer)
          .resize({ width: 1920, withoutEnlargement: true })
          .jpeg({ quality: 95 })
          .toBuffer();
        mimeTypeToSave = 'image/jpeg';
      } catch (sharpError) {
        return res.status(400).json({ error: `Image processing failed: ${sharpError.message}` });
      }
    } 
    else if (isVideoFile(detectedMimeType)) {
      try {
        bufferToSave = await compressVideo(file.buffer);
        mimeTypeToSave = 'video/mp4';
      } catch (videoError) {
        return res.status(400).json({ error: `Video processing failed: ${videoError.message}` });
      }
    } 
    else {
      return res.status(400).json({ 
        error: `Unsupported file type: ${detectedMimeType}`,
        supportedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime']
      });
    }

    const id = await mediaModel.createMedia(file.originalname, mimeTypeToSave, bufferToSave);
    res.status(201).json({ 
      id, 
      message: 'File uploaded & compressed',
      filename: file.originalname,
      mimetype: mimeTypeToSave,
      originalMimetype: file.mimetype,
      detectedMimetype: detectedMimeType
    });
  } catch (err) {
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
};

export const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'File not found' });
    }

    const detectedMimeType = detectFileType(file);
    let bufferToSave;
    let mimeTypeToSave;

    if (isImageFile(detectedMimeType)) {
      try {
        bufferToSave = await sharp(file.buffer)
          .resize({ width: 1920, withoutEnlargement: true })
          .jpeg({ quality: 95 })
          .toBuffer();
        mimeTypeToSave = 'image/jpeg';
      } catch (sharpError) {
        return res.status(400).json({ error: `Image processing failed: ${sharpError.message}` });
      }
    } 
    else if (isVideoFile(detectedMimeType)) {
      try {
        bufferToSave = await compressVideo(file.buffer);
        mimeTypeToSave = 'video/mp4';
      } catch (videoError) {
        return res.status(400).json({ error: `Video processing failed: ${videoError.message}` });
      }
    } 
    else {
      return res.status(400).json({ 
        error: `Unsupported file type: ${detectedMimeType}`,
        supportedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime']
      });
    }

    const affectedRows = await mediaModel.updateMedia(id, file.originalname, mimeTypeToSave, bufferToSave);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ 
      message: 'File successfully updated & compressed',
      filename: file.originalname,
      mimetype: mimeTypeToSave,
      originalMimetype: file.mimetype,
      detectedMimetype: detectedMimeType
    });
  } catch (err) {
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
};

export const getAllMedia = async (_, res) => {
  try {
    const mediaList = await mediaModel.getAllMedia();
    if (!mediaList || mediaList.length === 0) {
      return res.status(200).json({ msg: "No media found", data: [] });
    }
    res.json({ data: mediaList });
  } catch (err) {
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
};

export const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await mediaModel.getMediaById(id);
    if (!media) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.writeHead(200, {
      'Content-Type': media.mimetype,
      'Content-Length': media.data.length,
    });
    res.end(media.data);
  } catch (err) {
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await mediaModel.deleteMedia(id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ message: 'File successfully deleted' });
  } catch (err) {
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
};
