import express from 'express';
import { getReturns, createReturn, updateReturn, approveReturn } from '../controllers/returnController.js';

const router = express.Router();

router.get('/', getReturns);
router.post('/', createReturn);
router.put('/:id', updateReturn);
router.put('/:id/approve', approveReturn);

export default router;
