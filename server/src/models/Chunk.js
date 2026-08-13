import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema({
    summaryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Summary",
        required: true,
        index: true
    },

    index: {
        type: Number,
        required: true,
    },

    text: {
        type: String,
        required: true,
    },

    length: {
        type: String,
        required: true,
    },

    status: {
        type: String,
        enum: [
            "pending",
            "processed",
            "completed",
            "failed",
        ],

        default: "pending",
    },

    chunkSummary: {
        type: String,
        default: null
    },
},
    { timestamps: true },
);

export default mongoose.Model("Chunk", chunkSchema);