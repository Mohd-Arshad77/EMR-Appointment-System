import express from 'express';
import { authUser, registerUser, refreshUserToken, logoutUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser);
router.get('/refresh', refreshUserToken);
router.post('/logout', logoutUser);

export default router;
