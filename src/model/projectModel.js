import mysql from 'mysql2/promise';
import { db } from '../config/config.js';

const pool = mysql.createPool({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database,
    waitForConnections: true,
    connectionLimit: 10,
});

const getAllProjects = async () => {
    const [rows] = await pool.query(`
        SELECT 
            p.id AS project_id, p.title, p.description,
            c.name AS category, pi.image_url, p.pinned_at
        FROM projects p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN project_images pi ON pi.project_id = p.id
        ORDER BY 
            p.pinned_at IS NOT NULL DESC,
            p.pinned_at DESC,
            p.id DESC
    `);

    if (rows.length === 0) return { msg: "No Item Here" };

    const map = {};
    rows.forEach(row => {
        const id = row.project_id;
        if (!map[id]) {
            map[id] = {
                id,
                title: row.title,
                description: row.description,
                category: row.category || "",
                is_pinned: !!row.pinned_at,
                image_url: []
            };
        }
        if (row.image_url) {
            map[id].image_url.push({ url: row.image_url });
        }
    });

    return Object.values(map);
};

const getProjectById = async (id) => {
    const [rows] = await pool.query(`
        SELECT 
            p.id AS project_id, p.title, p.description,
            c.name AS category, pi.image_url, p.pinned_at
        FROM projects p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN project_images pi ON pi.project_id = p.id
        WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) return null;

    const project = {
        id: rows[0].project_id,
        title: rows[0].title,
        description: rows[0].description,
        category: rows[0].category || "",
        is_pinned: !!rows[0].pinned_at,
        image_url: []
    };

    rows.forEach(row => {
        if (row.image_url) {
            project.image_url.push({ url: row.image_url });
        }
    });

    return project;
};

const uploadProject = async (body) => {
    const { title, description, category, image_urls, is_pinned } = body;

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [catRows] = await conn.query(
            'SELECT id FROM categories WHERE name = ?',
            [category]
        );

        if (catRows.length === 0) {
            throw new Error('Category not found.');
        }

        const categoryId = catRows[0].id;
        const pinnedAt = is_pinned ? new Date() : null;

        const [result] = await conn.query(
            'INSERT INTO projects (title, description, category_id, pinned_at) VALUES (?, ?, ?, ?)',
            [title, description, categoryId, pinnedAt]
        );
        const projectId = result.insertId;

        if (Array.isArray(image_urls) && image_urls.length > 0) {
            const imgValues = image_urls.map(url => [projectId, url]);
            await conn.query(
                'INSERT INTO project_images (project_id, image_url) VALUES ?',
                [imgValues]
            );
        }

        await conn.commit();
        return { id: projectId, title, description, category, is_pinned, image_urls };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

const updateProject = async (id, body) => {
    const { title, description, category_id, is_pinned } = body;
    const pinnedAt = is_pinned ? new Date() : null;

    const [result] = await pool.query(
        'UPDATE projects SET title = ?, description = ?, category_id = ?, pinned_at = ? WHERE id = ?',
        [title, description, category_id, pinnedAt, id]
    );
    if (result.affectedRows === 0) return null;
    return { id, title, description, category_id, is_pinned };
};

const removeProject = async (id) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        await conn.query('DELETE FROM project_images WHERE project_id = ?', [id]);
        const [result] = await conn.query('DELETE FROM projects WHERE id = ?', [id]);

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
  getAllProjects,
  getProjectById,
  uploadProject,
  updateProject,
  removeProject
};
