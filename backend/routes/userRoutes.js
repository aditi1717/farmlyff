import express from 'express';
import { getUsers, registerUser, loginUser, logoutUser, getUserProfile, updateUserProfile, toggleBanUser, getUserById, updateFcmToken } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/fcm-token', protect, updateFcmToken);
router.get('/', protect, admin, getUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/:id/ban', protect, admin, toggleBanUser);

export default router;
