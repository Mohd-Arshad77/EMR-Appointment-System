import expressAsyncHandler from 'express-async-handler';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

const generateTimeSlots = (start, end, duration) => {
    const slots = [];
    let currentTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);

    while (currentTime < endTime) {
        const slotStart = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        currentTime.setMinutes(currentTime.getMinutes() + duration);
        const slotEnd = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        if (currentTime <= endTime) {
            slots.push(`${slotStart}-${slotEnd}`);
        }
    }
    return slots;
};

export const getAvailableSlots = expressAsyncHandler(async (req, res) => {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
        res.status(400);
        throw new Error('Please provide doctorId and date');
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        res.status(404);
        throw new Error('Doctor not found');
    }

    const allSlots = generateTimeSlots(doctor.workingHours.start, doctor.workingHours.end, doctor.slotDuration);

    const searchDate = new Date(date);
    const nextDate = new Date(searchDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const bookedAppointments = await Appointment.find({
        doctorId,
        appointmentDate: {
            $gte: searchDate,
            $lt: nextDate
        },
        status: { $ne: 'Cancelled' }
    });

    const bookedSlotsList = bookedAppointments.map(app => app.timeSlot);

    const slotDetails = allSlots.map(slot => {
        const isToday = searchDate.toDateString() === new Date().toDateString();
        const pastDate = searchDate < new Date(new Date().setHours(0, 0, 0, 0));

        let isPastTime = false;
        if (isToday) {
            const slotStartTimeStr = slot.split('-')[0];
            const [hours, minutes] = slotStartTimeStr.split(':');
            const slotTime = new Date();
            slotTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
            if (slotTime < new Date()) {
                isPastTime = true;
            }
        }

        const isBooked = bookedSlotsList.includes(slot);
        const isUnavailable = pastDate || isPastTime;

        return {
            time: slot,
            available: !isBooked && !isUnavailable,
            reason: isBooked ? 'Booked' : (isUnavailable ? 'Past time' : '')
        };
    });

    res.json(slotDetails);
});

export const bookAppointment = expressAsyncHandler(async (req, res) => {
    const { doctorId, patientName, appointmentDate, timeSlot } = req.body;

    if (!doctorId || !patientName || !appointmentDate || !timeSlot) {
        res.status(400);
        throw new Error('Please provide all necessary fields');
    }

    const searchDate = new Date(appointmentDate);
    const nextDate = new Date(searchDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const existingAppointment = await Appointment.findOne({
        doctorId,
        appointmentDate: {
            $gte: searchDate,
            $lt: nextDate
        },
        timeSlot,
        status: { $ne: 'Cancelled' }
    });

    if (existingAppointment) {
        res.status(400);
        throw new Error('Time slot is already booked');
    }

    const appointment = await Appointment.create({
        doctorId,
        patientName,
        appointmentDate,
        timeSlot,
        status: 'Confirmed'
    });

    res.status(201).json(appointment);
});

export const getDoctorAppointments = expressAsyncHandler(async (req, res) => {
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });

    if (!doctorProfile) {
        res.status(404);
        throw new Error('Doctor profile not found');
    }

    const appointments = await Appointment.find({ doctorId: doctorProfile._id }).sort({ appointmentDate: 1 });
    res.json(appointments);
});

export const getAllAppointments = expressAsyncHandler(async (req, res) => {
    const appointments = await Appointment.find({})
        .populate({
            path: 'doctorId',
            select: 'name department'
        })
        .sort({ appointmentDate: -1 });
    res.json(appointments);
});
