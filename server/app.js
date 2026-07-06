import "dotenv/config";
import fs from 'fs';
import cors from "cors";
import https from 'https';
import express from "express";
import connectDatabase from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import ingestRoute from "./routes/ingestRoute.js";
import handleError from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

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

await connectDatabase();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/scrape", ingestRoute);
app.use(handleError);

app.get("/", (req, res) => {
  res.json({
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

if (process.env.NODE_ENV === 'production') {
  https.createServer({
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
  }, app).listen(process.env.HTTPS_PORT, () => {
    console.log(`API is running on: http://localhost:${process.env.HTTPS_PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Development API is running on: http://localhost:${PORT}`);
  });
}