import mongoose from 'mongoose';

// excellent performance, average performance, under average performance
const RatingBar = [1,2,3];

const commentTeamSchema = new mongoose.Schema({
    rate:{
        type: String,
        required: [true, "Rating must include rating bar"],
        enum: RatingBar,
    },
    comment:{
        type: String,
        required: [true, "Comment is missing"],
    },
    teamId:{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Team'
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    }
},
    { timestamps: true }
);



const CommentTeam = mongoose.model('CommentTeam', commentTeamSchema);

export default CommentTeam;