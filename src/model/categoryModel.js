import mysql from 'mysql2/promise';
import { db } from '../config/config.js';

const pool = mysql.createPool({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: {
        rejectUnauthorized: false
    }
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
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        //category_id di projects jadi null
        await conn.query('UPDATE projects SET category_id = NULL WHERE category_id = ?', [categoryId]);

        const [result] = await conn.query('DELETE FROM categories WHERE id = ?', [categoryId]);

        await conn.commit();
        return result.affectedRows > 0;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

export default {
    getAllCategories,
    createCategory,
    deleteCategory
};
