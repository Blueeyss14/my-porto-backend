import express from 'express';
import { getAllMessages, createMessage, updateMessage, deleteMessage } from '../controllers/messageController.js';

const router = express.Router();

router.get('/', getAllMessages);
router.post('/', createMessage);
router.put('/:id', updateMessage);
router.delete('/:id', deleteMessage);

export default router;
