import expressAsyncHandler from 'express-async-handler';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

export const createDoctor = expressAsyncHandler(async (req, res) => {
  const { name, email, password, department, workingHours, slotDuration } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'Doctor'
  });

  if (user) {
    const doctor = await Doctor.create({
      userId: user._id,
      name,
      department,
      workingHours,
      slotDuration
    });

    res.status(201).json(doctor);
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

export const getDoctors = expressAsyncHandler(async (req, res) => {
  const doctors = await Doctor.find({}).populate('userId', 'name email role');
  res.json(doctors);
});

export const updateDoctor = expressAsyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  const { name, department, workingHours, slotDuration } = req.body;

  if (name) doctor.name = name;
  if (department) doctor.department = department;
  if (slotDuration) doctor.slotDuration = slotDuration;

  if (workingHours) {
    doctor.workingHours.start = workingHours.start;
    doctor.workingHours.end = workingHours.end;
  }

  const updatedDoctor = await doctor.save();

  const populatedDoctor = await Doctor.findById(updatedDoctor._id)
    .populate("userId", "name email");

  res.json(populatedDoctor);
});

export const deleteDoctor = expressAsyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (doctor) {
    await User.findByIdAndDelete(doctor.userId);
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor removed' });
  } else {
    res.status(404);
    throw new Error('Doctor not found');
  }
});
