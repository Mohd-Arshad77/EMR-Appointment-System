import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Doctor'
    },
    patientName: {
        type: String,
        required: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
        default: 'Confirmed'
    }
}, {
    timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
