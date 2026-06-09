import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectWithDB from './config/db.js';
import authRoute from './routes/authRoute.js'
import ingestRoute from './routes/ingestRoute.js' 
import handleError from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://thelayerzero.vercel.app"
    ],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoute);
app.use('/api/scrape', ingestRoute);
app.use(handleError);


app.get('/', (req, res) => {
    res.json({
        "message": "hello, this is layerzero's server!"
    });
});

app.listen(PORT, () => {
    console.log(`the server is currently running on: http://localhost:${PORT}`);
    connectWithDB();
});