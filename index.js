import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './mongodb/connect.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import dalleRoutes from './routes/dalleRoutes.js';
import auth from './middlewares/auth.js';

dotenv.config();

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL
}));
app.use(express.json({limit: '50mb'}));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/dalle', auth, dalleRoutes);

app.get('/', async(req, res) => {
    res.send('Hello from DALL-E');
})

const startServer = async () => {
    try {
        connectDB(process.env.MONGODB_URL);
        app.listen(process.env.PORTNO, () => console.log(`Server started http://localhost:${process.env.PORTNO}`))
    }catch(error) {
        console.error(error);
    }
}

startServer();
