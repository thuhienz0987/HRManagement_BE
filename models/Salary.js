import mongoose from 'mongoose'

const salarySchema = mongoose.Schema({
    userId:{
        type:  mongoose.Types.ObjectId,
        ref:'User',
        required:[true,'A salary must link a id of user']
    },
    idComment:{
        type:  mongoose.Types.ObjectId,
        ref:'Comment',
        // required:[true,'A salary must link a id of comment']
    },
    idPosition:{
        type:  mongoose.Types.ObjectId,
        ref:'Position',
        required:[true,'A salary must link a id of position']
    },
    bonus:[{
        type:  Number,
        default:0,
    },],
    idAllowance:[{
        type:  mongoose.Types.ObjectId,
        ref:'Allowance',
        required:[true,'A salary must link a id of allowance']
    },],
    incomeTax:{
        type: Number,
        required: true,
        default: 5,
        min: 0,
        max: 100,
    },
    payDay:{
        type: Date,
    },
    presentDate:{ //ngay co mat
        type: Number,
        default: 0,
        required: true,
    },
    totalSalary:{ // tong luong sau khi - thue
        type: Number,
        default: 0,
        required: true
    },
    totalIncome:{ // tong luong ban dau 
        type: Number,
        default: 0,
        required: true
    },
    incomeTaxAmount:{ // tien thue
        type: Number,
        default: 0,
        required: true
    },
    overTimeDay:{ // ngay tang ca
        type: Number,
        default: 0,
        required: true
    },
    overTime:{ // gio tang ca
        type: Number,
        default: 0,
        required: true
    },
    paidLeaveDays:{ // ngay nghi co luong
        type: Number,
        default: 0,
        required: true
    },
    totalLeaveRequest:{// tong ngay nghi trong thang
        type: Number,
        default: 0,
        required: true
    },
    overTimeMoney:{ // tien tang ca theo gio
        type: Number,
        default: 0,
        required: true
    },
    overTimeDayMoney:{ // tien tang ca theo ngay
        type: Number,
        default: 0,
        required: true
    },
    dayMoney:{ // tien dua theo ngay di lam
        type: Number,
        default: 0,
        required: true
    },
    bonusMoney:{ // tien thuong
        type: Number,
        default: 0,
        required: true
    },
    allowanceAmount:{ // tong phu cap
        type: Number,
        default: 0,
        required: true
    },
    paidLeaveDaysMoney:{ // tong luong ngay nghi co luong
        type: Number,
        default: 0,
        required: true
    },
},
{ timestamps: true },
)

const Salary = mongoose.model('Salary', salarySchema)
export default Salary