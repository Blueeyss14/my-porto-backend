import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { port } from './config/config.js';
import categoryRoute from './routes/categoryRoute.js';
import projectRoute from './routes/projectRoute.js';
import messageRoute from './routes/messageRoute.js'
import apiKey from './middleware/apiKey.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(apiKey);

app.use('/uploads', express.static('uploads'));
app.use('/projects', projectRoute);
app.use('/categories', categoryRoute);
app.use('/messages', messageRoute);

app.get('/', (_, res) => {
    res.status(200).send({message : 'My Portfolio'});
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Port: ${port}`);
});