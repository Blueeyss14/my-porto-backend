import mysql from 'mysql2/promise';
import { db } from '../config/config.js';

const pool = mysql.createPool({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database,
    waitForConnections: true,
    connectionLimit: 2,
});

const getAllMessages = async () => {
    const [rows] = await pool.query('SELECT * FROM chat');
    return rows;
};

const createMessage = async (user_name, message) => {
    const query = 'INSERT INTO chat (user_name, message) VALUES (?, ?)';
    const [result] = await pool.execute(query, [user_name, message]);
    return result.insertId;
};

const updateMessage = async (id, user_name, message) => {
    const query = 'UPDATE chat SET user_name = ?, message = ? WHERE id = ?';
    const [result] = await pool.execute(query, [user_name, message, id]);
    return result.affectedRows;
};

const deleteMessage = async (id) => {
    const query = 'DELETE FROM chat WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows;
};

export default {
  getAllMessages,
  createMessage,
  updateMessage,
  deleteMessage
};
