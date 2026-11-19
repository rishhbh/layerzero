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

    sourceHash: {
        type: String,
        required: true
    },

    client: {
        type: String,
        enum: [
            "groq",
            "gemini",
            "gemma",
            "sarvam",
        ],
        default: "gemini"
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