import express from 'express';
import scrapePage from '../controllers/scrape.js';
import { protectRoute } from '../middlewares/authMiddleware.js';
import summariseDoc from '../controllers/docSummary.js';
import upload from '../services/multer.js';

const router = express.Router();

router.get('/web', protectRoute, scrapePage);
router.post(
    '/doc', 
    protectRoute, 
    upload.single("document"), 
    summariseDoc
);

export default router;