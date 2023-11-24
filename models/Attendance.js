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
        // default: Date.now()
    },
    checkOutTime:{
        type: Date,
        // required: [true,''],
    },
    // updateHistory: [
    //     {
    //         updateDate: {
    //             type: Date,
    //             default: Date.now(),
    //         },
    //         checkInTime: Date,
    //         checkOutTime: Date,
    //         attendanceDate: Date,
    //     },
    // ],
    overTime:{
        type: Number,
        default: 0
    },
    isDeleted:{
        type: Boolean,
        required: true,
        default: false,
    },
})


// attendanceSchema.pre('save', async function (next) {
//     // Kiểm tra nếu checkOutTime thay đổi và tồn tại
//     if (this.isModified('checkOutTime') && this.checkOutTime) {
//         const checkOutTime = this.checkOutTime;
//         const checkOutHour = checkOutTime.getHours();

//         // Giờ giới hạn mềm mại
//         const limitHour = 17;

//         // Kiểm tra nếu checkOutTime sau giờ giới hạn
//         if (checkOutHour >= limitHour) {
//             // Tính toán thời gian làm thêm (overTime) và cập nhật trường overTime
//             this.overTime = (checkOutHour - limitHour); // tính toán theo phút, có thể điều chỉnh theo yêu cầu
//         } else {
//             this.overTime = 0; // Nếu checkOutTime trước giờ giới hạn, không tính làm thêm
//         }
//     }

//     next();
// });


const Attendance = mongoose.model('Attendance', attendanceSchema)
export default Attendance
