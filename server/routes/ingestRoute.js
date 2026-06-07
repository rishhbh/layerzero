import express from 'express';
import scrapePage from '../controllers/scrape.js';

const router = express.Router();

router.get('/web', scrapePage);

export default router;