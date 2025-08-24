import mysql from 'mysql2/promise';
import { db } from '../config/config.js';

const pool = mysql.createPool({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: { rejectUnauthorized: false }
});

const getAllMusic = async () => {
    const [rows] = await pool.query('SELECT * FROM music');
    return rows;
};

const getMusicById = async (id) => {
    const [rows] = await pool.query(
        "SELECT song_file, mimetype FROM music WHERE id = ?", 
        [id]
    );
    return rows.length > 0 ? rows[0] : null;
};

const createMusic = async (song_name, song_file, mimetype) => {
    const query = 'INSERT INTO music (song_name, song_file, mimetype) VALUES (?, ?, ?)';
    const [result] = await pool.execute(query, [song_name, song_file, mimetype]);
    return result.insertId;
};

const updateMusic = async (id, song_name, song_file, mimetype) => {
    const updates = [];
    const params = [];

    if (song_name !== null && song_name !== undefined) {
        updates.push('song_name = ?');
        params.push(song_name);
    }
    if (song_file !== null && song_file !== undefined) {
        updates.push('song_file = ?');
        params.push(song_file);
    }
    if (mimetype !== null && mimetype !== undefined) {
        updates.push('mimetype = ?');
        params.push(mimetype);
    }

    if (updates.length === 0) {
        return 0;
    }

    const query = `UPDATE music SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    console.log('Query:', query);
    console.log('Params length:', params.length);

    const [result] = await pool.execute(query, params);
    return result.affectedRows;
};

const deleteMusic = async (id) => {
    const query = 'DELETE FROM music WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows;
};

export default {
    getAllMusic,
    getMusicById,
    createMusic,
    updateMusic,
    deleteMusic
};
