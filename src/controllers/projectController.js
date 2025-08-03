import projectModel from '../model/projectModel.js';

export const getAllProjects = async (_, res) => {
  try {
    const projects = await projectModel.getAllProjects();
    res.json(projects);
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
    const project = await projectModel.uploadProject(req.body);
    if (!project) return res.status(400).json({ error: "Failed to create item" });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await projectModel.updateProject(req.params.id, req.body);
    if (!project) return res.status(404).json({ error: "Item not Found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const success = await projectModel.removeProject(req.params.id);
    if (!success) return res.status(404).json({ error: "Item not Found" });
    res.json({ msg: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
