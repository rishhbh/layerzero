import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateToken } from '../config/utils.js';

export const registerUser = async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Please fill out all the required fields!'
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
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

        generateToken(newUser._id, res);
        res.status(200).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
        });
    } catch (err) {
        err.customMessage = "Some error occured while registering the user!";
        next(err);
    }

};

export const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({
                message: "Please fill out the required fields!"
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "The user doesn't exist!"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid Credentials!"
            });
        }

        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
        });
    } catch (err) {
        err.customMessage = "Some error occurred while logging in the user!";
        next(err);
    }
};

export const logout = async (req, res, next) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({
            message: "The user has been logged out successfully!"
        })
    } catch (err) {
        err.customMessage = "Unable to logout the user!";
        next(err);
    }
};

export const checkUser = async (req, res, next) => {
    try {
        return res.status(200).json(req.user);
    } catch (err) {
        err.customMessage = "Unable to check current user!";
        next(err);
    }
};