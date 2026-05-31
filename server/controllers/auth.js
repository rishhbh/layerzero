import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            res.status(400).json({
                message: 'Please fill out all the required fields!'
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({
                message: 'This user is already registerd with us!'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashPassword
        });
    } catch {

    }

};