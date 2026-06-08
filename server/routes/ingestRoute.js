import express from 'express';
import scrapePage from '../controllers/scrape.js';
import { protectRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/web', protectRoute, scrapePage);

export default router;