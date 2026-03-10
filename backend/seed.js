import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB for seeding...');

       
        const adminExists = await User.findOne({ email: 'superadmin@gmail.com' });
        if (adminExists) {
            console.log('Super Admin already exists!');
        } else {
            const adminUser = await User.create({
                name: 'Super Admin User',
                email: 'superadmin@gmail.com',
                password: 'password123',
                role: 'Super Admin'
            });
            console.log('Super Admin Created:', adminUser);
        }

       
        const recExists = await User.findOne({ email: 'reception@emr.com' });
        if (recExists) {
            console.log('Receptionist already exists!');
        } else {
            const receptionistUser = await User.create({
                name: 'Front Desk Lisa',
                email: 'reception@emr.com',
                password: 'password123',
                role: 'Receptionist'
            });
            console.log('Receptionist Created:', receptionistUser);
        }

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedAdmin();
