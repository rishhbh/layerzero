import Summary from "../models/Summary.js";

const getUserSummaries = async (req, res, next) => {
    try {
        const summaries = await Summary.find({
            userId: req.user._id
        }).select("-__v").sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: summaries.length,
            summaries
        });

    } catch (err) {
        next(err);
    }
};

export default getUserSummaries;
