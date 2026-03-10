import expressAsyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateToken, generateRefreshToken } from '../config/generateToken.js';
import jwt from 'jsonwebtoken';

export const registerUser = expressAsyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        res.status(400);
        throw new Error('Please enter all fields');
    }

    if (['Super Admin', 'Doctor', 'Receptionist'].includes(role)) {
        res.status(403);
        throw new Error('Public registration for staff roles is strictly disabled. Please use the seeded admin account to provision new staff profiles.');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
    });

    if (user) {
        const refreshToken = generateRefreshToken(user._id);
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

export const authUser = expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        const refreshToken = generateRefreshToken(user._id);
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

export const refreshUserToken = expressAsyncHandler(async (req, res) => {
    const refreshToken = req.cookies.jwt;
    if (!refreshToken) {
        res.status(401);
        throw new Error('Not authorized, no refresh token');
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401);
            throw new Error('User not found');
        }
        res.json({
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(401);
        throw new Error('Not authorized, token failed');
    }
});

export const logoutUser = expressAsyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
});
