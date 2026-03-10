import express from 'express';
import { createDoctor, getDoctors, updateDoctor, deleteDoctor } from '../controllers/doctorController.js';
import { protect, superAdmin, receptionistOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, superAdmin, createDoctor);
router.get('/', protect, receptionistOrAdmin, getDoctors);
router.put('/:id', protect, superAdmin, updateDoctor);
router.delete('/:id', protect, superAdmin, deleteDoctor);

export default router;
