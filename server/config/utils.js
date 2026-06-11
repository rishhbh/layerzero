import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });

    res.cookie("jwt", token, {
        maxAge: 7*24*3600*1000,
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });

    return token;
};