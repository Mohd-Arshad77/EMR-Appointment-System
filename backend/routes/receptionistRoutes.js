import express from 'express';
import { createReceptionist, getReceptionists, updateReceptionist, deleteReceptionist } from '../controllers/receptionistController.js';
import { protect, superAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, superAdmin, createReceptionist)
    .get(protect, superAdmin, getReceptionists);

router.route('/:id')
    .put(protect, superAdmin, updateReceptionist)
    .delete(protect, superAdmin, deleteReceptionist);

export default router;
