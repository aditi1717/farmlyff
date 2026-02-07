import express from 'express';
import {
    createReview,
    getProductReviews,
    getAllReviewsAdmin,
    updateReviewStatus,
    deleteReview,
    createAdminReview
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);
router.get('/', protect, admin, getAllReviewsAdmin);
router.get('/admin', protect, admin, getAllReviewsAdmin);
router.post('/admin', protect, admin, createAdminReview);
router.put('/:id/status', protect, admin, updateReviewStatus);
router.delete('/:id', protect, admin, deleteReview);

export default router;
