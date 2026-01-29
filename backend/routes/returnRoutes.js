import express from 'express';
import { getReturns, createReturn, updateReturn } from '../controllers/returnController.js';

const router = express.Router();

router.get('/', getReturns);
router.post('/', createReturn);
router.put('/:id', updateReturn);

export default router;
