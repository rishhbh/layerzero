import cors from "cors";
import https from 'https';
import express from "express";
import connectDatabase from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import ingestRoute from "./routes/ingestRoute.js";
import handleError from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();

app.set("trust proxy", 1);
app.use(
  cors({
    origin: [
      process.env.NODE_ENV === "development"
        ? ["http://localhost:5173"]
        : [process.env.CLIENT_URL],
    ],
    credentials: true,
    exposedHeaders: ["set-cookie"],
  }),
);

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/scrape", ingestRoute);

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "API is running",
  });
});

app.get("/api/health", (req, res) => {
  return res.status(201).json({
    status: "OK",
    message: "API is working properly",
    uptime: Math.floor(process.uptime()),
  });
});

app.use(handleError);

export default app;