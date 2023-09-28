import mongoose from 'mongoose';

// excellent performance, average performance, under average performance
const RatingBar = [1,2,3];

const commentSchema = new mongoose.Schema({
    rate:{
        type: String,
        required: [true, "Rating must include rating bar"],
        enum: RatingBar,
    },
    comment:{
        type: String,
        required: [true, "Comment is missing"],
    },
    userId:{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    }
},
    { timestamps: true }
);



const Comment = mongoose.model('Comment', commentSchema);

export default Comment;