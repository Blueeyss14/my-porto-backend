import mysql from 'mysql2/promise';
import db from '../config/config.js';

const pool = mysql.createPool({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database,
    waitForConnections: true,
    connectionLimit: 10,
});

const getAllCategories = async () => {
    const [rows] = await pool.query('SELECT * FROM categories');
    return rows;
};

const createCategory = async (name) => {
    const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
    return { id: result.insertId, name };
};

const deleteCategory = async (categoryId) => {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [categoryId]);
    return result.affectedRows > 0;
};


export {
    getAllCategories,
    createCategory,
    deleteCategory
};