import category from '../model/categoryModel.js';

export const getAllCategories = async (_, res) => {
    try {
        const categories = await category.getAllCategories();
        if (!categories || categories.length === 0) {
            return res.status(200).json({ msg: "No categories found", data: [] });
        }
        res.json({ data: categories });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: "Category name is required" });
        }
        const newCategory = await category.createCategory(name);
        res.status(201).json(newCategory);
    } catch (err) {
        if (err.message.includes('Duplicate')) {
            return res.status(409).json({ error: "Category already exists" });
        }
        res.status(500).json({ error: err.message });
    }
};

export const removeCategory = async (req, res) => {
    try {
        const success = await category.deleteCategory(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Category not found or cannot be deleted because it is used in projects' });
        }
        res.json({ msg: 'Category deleted' });
    } catch (err) {
        if (err.message.includes('foreign key constraint')) {
            return res.status(400).json({ error: 'Category cannot be deleted because it is used in projects' });
        }
        res.status(500).json({ error: err.message });
    }
};
