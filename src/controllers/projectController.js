import projectModel from '../model/projectModel.js';

export const getAllProjects = async (_, res) => {
  try {
    const projects = await projectModel.getAllProjects();
    if (!projects || projects.length === 0) {
      return res.status(200).json({ msg: "No projects found", data: [] });
    }
    res.json({ data: projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await projectModel.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: "Item not Found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, subtitle, description, category, is_pinned, tags, contributing, resources } = req.body;
    
    const imageFiles = req.files['image_url'] || [];
    const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

    const project = await projectModel.uploadProject({
      title,
      subtitle: subtitle || null,
      description,
      category,
      imageFiles,
      is_pinned: is_pinned === 'true',
      tags: tags ? JSON.parse(tags) : [],
      thumbnailFile,
      contributing: contributing || null,
      resources: resources || null
    });

    res.status(201).json(project);
  } catch (err) {
    console.error('Error in createProject:', err);
    res.status(500).json({ error: err.message });
  }
};

export const patchProject = async (req, res) => {
  try {
    const { 
      title, 
      subtitle, 
      description, 
      category, 
      is_pinned, 
      tags, 
      contributing, 
      resources 
    } = req.body;
    
    const imageFiles = req.files?.['image_url'] || undefined;
    const image_index = req.body.image_index ? parseInt(req.body.image_index) : undefined;
    const delete_index = req.body.delete_index ? parseInt(req.body.delete_index) : undefined;
    const add_images = req.body.add_images === 'true';
    const thumbnailFile = req.files?.['thumbnail']?.[0] || undefined;

    const project = await projectModel.patchProject(req.params.id, {
      ...(title !== undefined && { title }),
      ...(subtitle !== undefined && { subtitle }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(is_pinned !== undefined && { is_pinned: is_pinned === 'true' }),
      ...(imageFiles !== undefined && { imageFiles }),
      ...(image_index !== undefined && { image_index }),
      ...(delete_index !== undefined && { delete_index }),
      ...(add_images && { add_images }),
      ...(tags !== undefined && { tags: JSON.parse(tags) }),
      ...(thumbnailFile !== undefined && { thumbnailFile }),
      ...(contributing !== undefined && { contributing }),
      ...(resources !== undefined && { resources })
    });

    if (!project) return res.status(404).json({ error: "Item not Found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// export const updateProject = async (req, res) => {
//   try {
//     const { title, subtitle, description, category, is_pinned, tags, contributing, resources } = req.body;
//     const image_url = req.files['image_url']?.map(f => `uploads/${f.filename}`) || [];
//     const thumbnail = req.files['thumbnail'] ? `uploads/${req.files['thumbnail'][0].filename}` : null;

//     const project = await projectModel.updateProject(req.params.id, {
//       title,
//       subtitle: subtitle || null,
//       description,
//       category,
//       is_pinned: is_pinned === 'true',
//       image_url,
//       tags: tags ? JSON.parse(tags) : [],
//       thumbnail,
//       contributing: contributing || null,
//       resources: resources || null
//     });

//     if (!project) return res.status(404).json({ error: "Item not Found" });
//     res.json(project);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const deleteProject = async (req, res) => {
  try {
    const success = await projectModel.removeProject(req.params.id);
    if (!success) return res.status(404).json({ error: "Item not Found" });
    res.json({ msg: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getImageById = async (req, res) => {
  try {
    const { projectId, imageIndex } = req.params;
    const image = await projectModel.getImageByProjectIdAndIndex(parseInt(projectId), parseInt(imageIndex));
    if (!image) return res.status(404).json({ error: "Image not found" });

    if (!image.image_data && image.image_url) {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const filePath = path.resolve(image.image_url);
        const fileData = await fs.readFile(filePath);
        
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': fileData.length,
        });
        return res.end(fileData);
      } catch (fsErr) {
        console.error('Error reading file:', fsErr);
        return res.status(404).json({ error: "Image file not found" });
      }
    }
    
    res.writeHead(200, {
      'Content-Type': image.mimetype || 'image/png',
      'Content-Length': image.image_data.length,
    });
    res.end(image.image_data);
  } catch (err) {
    console.error('Error in getImageById:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getThumbnailById = async (req, res) => {
  try {
    const thumbnail = await projectModel.getThumbnailById(req.params.id);
    if (!thumbnail) return res.status(404).json({ error: "Thumbnail not found" });
    
    res.writeHead(200, {
      'Content-Type': thumbnail.thumbnail_mimetype,
      'Content-Length': thumbnail.thumbnail_data.length,
    });
    res.end(thumbnail.thumbnail_data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
