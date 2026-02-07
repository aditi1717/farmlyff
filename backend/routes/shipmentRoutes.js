import express from 'express';
import { shiprocketWebhook } from '../controllers/shipmentController.js';

const router = express.Router();

router.post('/webhook', shiprocketWebhook);

export default router;
