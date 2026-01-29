import express from 'express';
import { getBanners, createBanner, deleteBanner } from '../controllers/bannerController.js';

const router = express.Router();

router.get('/', getBanners);
router.post('/', createBanner);
router.delete('/:id', deleteBanner);

export default router;
