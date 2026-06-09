import express from 'express';
import scrapePage from '../controllers/scrape.js';
import summarisePdf from '../controllers/pdfsummary.js';
import { protectRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/web', protectRoute, scrapePage);
router.post('/pdf', protectRoute, summarisePdf);

export default router;