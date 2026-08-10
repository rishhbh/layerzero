import "dotenv/config";
import app from "./app.js";
import fs from "fs";
import https from 'https';
import connectDatabase from "./config/db.js";

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  await connectDatabase();
}

if (process.env.NODE_ENV === 'production') {
  const server = https.createServer({
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
  }, app);

  server.listen(process.env.HTTPS_PORT, () => {
    console.log(`API is running on PORT: ${process.env.HTTPS_PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Development API is running on: http://localhost:${PORT}`);
  });
}