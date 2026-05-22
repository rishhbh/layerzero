import 'dotenv/config';
import express from 'express';
import connectWithDB from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    
    res.json({
        "message": "hello, this is layerzero's server!"
    });
});

app.listen(PORT, () => {
    console.log(`the server is currently running on:\nhttp://localhost:${PORT}`);
    connectWithDB();
});