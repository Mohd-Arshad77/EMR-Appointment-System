import expressAsyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const createReceptionist = expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role: 'Receptionist'
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

export const getReceptionists = expressAsyncHandler(async (req, res) => {
    const receptionists = await User.find({ role: 'Receptionist' }).select('-password');
    res.json(receptionists);
});

export const updateReceptionist = expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'Receptionist') {
        res.status(404);
        throw new Error("Receptionist not found");
    }

    const { name, email } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;

    if (req.body.password) {
        user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
    });
});

export const deleteReceptionist = expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user && user.role === 'Receptionist') {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Receptionist removed' });
    } else {
        res.status(404);
        throw new Error('Receptionist not found');
    }
});
