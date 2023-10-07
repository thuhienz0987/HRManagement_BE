import mongoose from 'mongoose';

// excellent performance, average performance, under average performance
const RatingBar = [1,2,3];

const commentDepartmentSchema = new mongoose.Schema({
    rate:{
        type: String,
        required: [true, "Rating must include rating bar"],
        enum: RatingBar,
    },
    comment:{
        type: String,
        required: [true, "Comment is missing"],
    },
    departmentId:{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Department'
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    }
},
    { timestamps: true }
);



const CommentDepartment = mongoose.model('CommentDepartment', commentDepartmentSchema);

export default CommentDepartment;