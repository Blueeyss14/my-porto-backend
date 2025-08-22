import mysql from 'mysql2/promise';
import { db } from '../config/config.js';

const pool = mysql.createPool({
  host: db.host,
  user: db.user,
  password: db.password,
  database: db.database,
  waitForConnections: true,
  connectionLimit: 1,
  acquireTimeout: 60000,
  timeout: 30000,
  idleTimeout: 300000 
});

const getAllMedia = async () => {
  const [rows] = await pool.query('SELECT id, filename, mimetype FROM media_files');
  return rows;
};

const getMediaById = async (id) => {
  const query = 'SELECT id, filename, mimetype, data FROM media_files WHERE id = ?';
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

const createMedia = async (filename, mimetype, data) => {
  const query = 'INSERT INTO media_files (filename, mimetype, data) VALUES (?, ?, ?)';
  const [result] = await pool.execute(query, [filename, mimetype, data]);
  return result.insertId;
};

const updateMedia = async (id, filename, mimetype, data) => {
  const query = 'UPDATE media_files SET filename = ?, mimetype = ?, data = ? WHERE id = ?';
  const [result] = await pool.execute(query, [filename, mimetype, data, id]);
  return result.affectedRows;
};

const deleteMedia = async (id) => {
  const query = 'DELETE FROM media_files WHERE id = ?';
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows;
};

export default {
  getAllMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
};
