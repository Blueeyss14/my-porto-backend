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

const getAllMusic = async () => {
    const [rows] = await pool.query('SELECT * FROM music');
    return rows;
};

const createMusic = async (song_name, song_file) => {
    const query = 'INSERT INTO music (song_name, song_file) VALUES (?, ?)';
    const [result] = await pool.execute(query, [song_name, song_file]);
    return result.insertId;
};

const updateMusic = async (id, song_name, song_file) => {
    let query = 'UPDATE music SET ';
    const params = [];
    if (song_name !== null && song_name !== undefined) {
        query += 'song_name = ?, ';
        params.push(song_name);
    }
    if (song_file !== null && song_file !== undefined) {
        query += 'song_file = ?, ';
        params.push(song_file);
    }
    query = query.slice(0, -2);
    query += ' WHERE id = ?';
    params.push(id);

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
    createMusic,
    updateMusic,
    deleteMusic
};
