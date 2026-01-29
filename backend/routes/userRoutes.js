import express from 'express';
import { getUsers, registerUser, loginUser } from '../controllers/userController.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/', getUsers);

export default router;
