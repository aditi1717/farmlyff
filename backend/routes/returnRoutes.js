import express from 'express';
import { getReturns, createReturn } from '../controllers/returnController.js';

const router = express.Router();

router.get('/', getReturns);
router.post('/', createReturn);

export default router;
