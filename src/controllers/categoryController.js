import category from '../model/categoryModel.js';

export const getAllCategories = async (_, res) => {
    try {
        const categories = await category.getAllCategories();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const newCategory = await category.createCategory(name);
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const removeCategory = async (req, res) => {
    try {
        const success = await category.deleteCategory(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ msg: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
