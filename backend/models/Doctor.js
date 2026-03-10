import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  workingHours: {
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  },
  slotDuration: {
    type: Number,
    required: true,
    default: 30
  }
}, {
  timestamps: true
});

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
