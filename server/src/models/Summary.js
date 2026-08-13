import mongoose from "mongoose";

const SummarySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    title: {
        type: String,
        required: true,
    },

    sourceType: {
        type: String,
        enum: ["pdf", "docx", "url"],
        required: true,
    },

    status: {
        type: String,
        enum: [
            "pending", 
            "processing", 
            "completed", 
            "failed"
        ],
        default: ["pending"]
    },

    totalChunks: {
        type: Number,
        default: 0
    },

    completedChunks: {
        type: Number,
        default: 0
    },

    finalSummary: {
        type: String,
        default: null
    },

    error: {
        type: String,
        default: null
    },

},
    { timestamps: true }
);

export default mongoose.model("Summary", SummarySchema);