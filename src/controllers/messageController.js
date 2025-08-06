import message from '../model/messageModel.js'

export const getAllMessages = async (_, res) => {
    try {
        const chats = await message.getAllMessages();
        if (!chats || chats.length === 0) {
            return res.status(200).json({ msg: "No Message found", data: [] });
        }
        res.json({ data: chats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createMessage = async (req, res) => {
    const { user_name, message: msg } = req.body;
    try {
        const id = await message.createMessage(user_name, msg);
        res.status(201).json({ msg: "Message created", id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateMessage = async (req, res) => {
    const { id } = req.params;
    const { user_name, message: msg } = req.body;
    try {
        const affected = await message.updateMessage(id, user_name, msg);
        if (affected === 0) {
            return res.status(404).json({ msg: "Message not found" });
        }
        res.json({ msg: "Message updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteMessage = async (req, res) => {
    const { id } = req.params;
    try {
        const affected = await message.deleteMessage(id);
        if (affected === 0) {
            return res.status(404).json({ msg: "Message not found" });
        }
        res.json({ msg: "Message deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};