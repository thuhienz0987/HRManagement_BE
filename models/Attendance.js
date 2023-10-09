import mongoose from "mongoose";

const attendanceSchema = mongoose.Schema({
    userId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref:'User',
        required:[true,'Attendance must be associated with a user'],
    },
    attendanceDate:{
        type: Date,
        required: [true,''],
        default: Date.now(),
    },
    checkInTime:{
        type: Date,
        required: [true,''],
        default: Date.now()
    },
    checkOutTime:{
        type: Date,
        // required: [true,''],
    },
    updateHistory: [
        {
            updateDate: {
                type: Date,
                default: Date.now(),
            },
            checkInTime: Date,
            checkOutTime: Date,
            attendanceDate: Date,
        },
    ],
    isDeleted:{
        type: Boolean,
        required: true,
        default: false,
    },
})

const Attendance = mongoose.model('Attendance', attendanceSchema)
export default Attendance
