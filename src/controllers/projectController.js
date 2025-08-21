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
    const image_url = req.files['image_url']?.map(f => `uploads/${f.filename}`) || [];
    const thumbnail = req.files['thumbnail'] ? `uploads/${req.files['thumbnail'][0].filename}` : null;

    const project = await projectModel.uploadProject({
      title,
      subtitle: subtitle || null,
      description,
      category,
      image_url,
      is_pinned: is_pinned === 'true',
      tags: tags ? JSON.parse(tags) : [],
      thumbnail,
      contributing: contributing || null,
      resources: resources || null
    });

    res.status(201).json(project);
  } catch (err) {
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
    
    const image_url = req.files?.['image_url']?.map(f => `uploads/${f.filename}`) || undefined;
    const image_index = req.body.image_index ? parseInt(req.body.image_index) : undefined;
    const delete_index = req.body.delete_index ? parseInt(req.body.delete_index) : undefined;
    const add_images = req.body.add_images === 'true';
    const thumbnail = req.files?.['thumbnail'] ? `uploads/${req.files['thumbnail'][0].filename}` : undefined;

    const project = await projectModel.patchProject(req.params.id, {
      ...(title !== undefined && { title }),
      ...(subtitle !== undefined && { subtitle }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(is_pinned !== undefined && { is_pinned: is_pinned === 'true' }),
      ...(image_url !== undefined && { image_url }),
      ...(image_index !== undefined && { image_index }),
      ...(delete_index !== undefined && { delete_index }),
      ...(add_images && { add_images }),
      ...(tags !== undefined && { tags: JSON.parse(tags) }),
      ...(thumbnail !== undefined && { thumbnail }),
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
