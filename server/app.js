import 'dotenv/config';
import express from 'express';
import connectWithDB from './config/db.js';
import aiChatRoute from './routes/aiChatRoute.js'
import authRoute from './routes/authRoute.js'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/chat', aiChatRoute);
app.use('/api/auth', authRoute);

app.get('/', (req, res) => {
    res.json({
        "message": "hello, this is layerzero's server!"
    });
});

app.listen(PORT, () => {
    console.log(`the server is currently running on: http://localhost:${PORT}`);
    connectWithDB();
});