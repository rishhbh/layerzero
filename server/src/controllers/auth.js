import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateToken } from "../config/generateJWT.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import hashContent from "../utils/hashContent.js";
import crypto from 'crypto';
import { sendVerificationEmail } from "../services/nodemailer.js";

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
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      verificationToken: hashContent(verificationToken),
      verificationTokenExpires: Date.now() + 15 * 60 * 1000
    });

    if (process.env.NODE_ENV !== 'test') {
      await sendVerificationEmail(newUser.email, verificationToken);
    }

    return res.status(201).json({
      success: true,
      message: "You're registered, now verify email"
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

    if (!user.isVerified) {
      return res.status(403).json({
        success: true,
        message: "Verify your email first",
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

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const hashedToken = hashContent(token);

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() }
    }).select('+verificationToken +verificationTokenExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token"
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (err) {
    next(err);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email })
      .select('+verificationToken +verificationTokenExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified"
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    user.verificationToken = hashContent(verificationToken);
    user.verificationTokenExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    await sendVerificationEmail(user.email, verificationToken);

    return res.status(200).json({
      success: true,
      message: "Verification sent to your email successfully"
    });

  } catch (err) {
    next(err);
  }
}

export const checkUser = async (req, res, next) => {
  try {
    return res.status(200).json(req.user);
  } catch (err) {
    err.customMessage = "Unable to check current user";
    next(err);
  }
};
