import mongoose from "mongoose";

// excellent performance, average performance, under average performance
const RatingBar = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const commentSchema = new mongoose.Schema(
    {
        reviewerId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "User",
        },
        revieweeId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "User",
        },
        rate: {
            type: Number,
            required: [true, "Rate is missing"],
            enum: RatingBar,
        },
        comment: {
            type: String,
            required: [true, "Comment is missing"],
        },
        isDeleted: {
            type: Boolean,
            required: true,
            default: false,
        },
        commentMonth: {
            type: Date,
            required: true,
        },
        history: [
            {
                rate: {
                    type: Number,
                    required: true,
                },
                comment: {
                    type: String,
                    required: true,
                },
                commentMonth: {
                    type: Date,
                    required: true,
                },
                updatedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

commentSchema.pre("save", function (next) {
    // Before saving, push the current values to the history array
    this.history.push({
        rate: this.rate,
        comment: this.comment,
        commentMonth: this.commentMonth,
    });
    next();
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
