import 'dotenv/config';
import express from 'express';
import connectWithDB from './config/db.js';
import aiChatRoute from './routes/aiChatRoute.js'
import authRoute from './routes/authRoute.js'
import ingestRoute from './routes/ingestRoute.js' 
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use('/api/chat', aiChatRoute);
app.use('/api/auth', authRoute);
app.use('/api/scrape', ingestRoute);


app.get('/', (req, res) => {
    res.json({
        "message": "hello, this is layerzero's server!"
    });
});

app.listen(PORT, () => {
    console.log(`the server is currently running on: http://localhost:${PORT}`);
    connectWithDB();
});