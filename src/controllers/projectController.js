import project from "../model/projectModel.js";

export const getAllProjects = async (_, res) => {
    try {
        const allItems = await project.getAll();
        res.json(allItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getProjectById = async (req, res) => {
    try {
        const item = await project.getItemById(req.params.id);
        if (!item) return res.status(404).send({ err: "Item not Found" });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createProject = async (req, res) => {
    try {
        const item = await project.createItem(req.body);
        if (!item) return res.status(400).send({ err: "Failed to create item" });
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProject = async (req, res) => {
    try {
        const item = await project.updateItemF(req.params.id, req.body);
        if (!item) return res.status(404).send({ err: "Item not Found" });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const success = await project.removeItem(req.params.id);
        if (!success) return res.status(404).send({ err: "Item not Found" });
        res.json({ msg: "Item deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
