import express from 'express';
import { getOrders, getOrderStats } from '../controllers/orderController.js';
import { getTrackingDetails } from '../controllers/shipmentController.js';

const router = express.Router();

router.get('/', getOrders);
router.get('/stats', getOrderStats);
router.get('/:orderId/tracking', getTrackingDetails);

export default router;

