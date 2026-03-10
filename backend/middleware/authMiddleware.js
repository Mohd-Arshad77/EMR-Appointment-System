import jwt from 'jsonwebtoken';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const protect = expressAsyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

export const superAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Super Admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as a Super Admin');
    }
};

export const receptionistOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'Receptionist' || req.user.role === 'Super Admin')) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as Receptionist');
    }
}
