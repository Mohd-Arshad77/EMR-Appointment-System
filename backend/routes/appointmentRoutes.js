import express from 'express';
import { getAvailableSlots, bookAppointment, getDoctorAppointments, getAllAppointments } from '../controllers/appointmentController.js';
import { protect, receptionistOrAdmin, superAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/slots', protect, receptionistOrAdmin, getAvailableSlots);
router.post('/book', protect, receptionistOrAdmin, bookAppointment);

router.get('/doctor', protect, (req, res, next) => {
    if (req.user && req.user.role === 'Doctor') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as a Doctor');
    }
}, getDoctorAppointments);

router.get('/', protect, superAdmin, getAllAppointments);

export default router;
