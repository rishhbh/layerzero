import jwt from 'jsonwebtoken';
import User from '../models/User';

export const protectRoute = (req, res, next) => {
    try {
        const token = req.cookie.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided!" });
        }

        const jwtCheck = jwt.verify(token, process.env.JWT_SECRET);
        if (!jwtCheck) {
            return res.status(401).json({ message: "Unauthorized: Invalid token!" });
        }

        const user = await User.findById(jwtCheck.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
    } catch (err) {
        console.log(`Some error occured at route protection endpoint: ${err}`);
    }
}