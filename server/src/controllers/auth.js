import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateToken } from "../config/generateJWT.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

export const registerUser = async (req, res, next) => {
  try {
    const registerFields = registerSchema.safeParse(req.body);

    if (!registerFields.success) {
      return res.status(400).json({
        errors: registerFields.error.flatten().fieldErrors
      });
    }

    const { name, email, password } = registerFields.data;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "This user is already registerd with us!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
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
  try {
    const loginFields = loginSchema.safeParse(req.body);

    if (!loginFields.success) {
      return res.status(400).json({
        errors: loginFields.error.flatten().fieldErrors
      });
    }

    const { email, password } = loginFields.data;

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        message: "Invalid username or password",
      });
    }

    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });

  } catch (err) {
    err.customMessage = "Some error occurred while logging in the user";
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({
      message: "The user has been logged out successfully",
    });
  } catch (err) {
    err.customMessage = "Unable to logout the user!";
    next(err);
  }
};

export const checkUser = async (req, res, next) => {
  try {
    return res.status(200).json(req.user);
  } catch (err) {
    err.customMessage = "Unable to check current user";
    next(err);
  }
};
