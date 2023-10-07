import mongoose from 'mongoose';


const LeaveRequestSchema = new mongoose.Schema({
    reason:{
        type: String,
        required: [true, "Reason is missing"],
    },
    status:{
        type: String,
        required: [true, "Status is missing"],
        enum: ['pending', 'approved', 'denied'],
        default: 'pending'
    },
    userId:{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    endDate: {
        type: Date,
        required: [true, 'End date is missing']
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    }
},
    { timestamps: true }
);



const LeaveRequest = mongoose.model('LeaveRequest', LeaveRequestSchema);

export default LeaveRequest;