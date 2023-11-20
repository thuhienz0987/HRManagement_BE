import mongoose from "mongoose";
const salaryGradeSchema = mongoose.Schema({
    code:{
        type: String,
        required: [true, 'A salary grade must have a code'],
        minLength: [1,'A code of salary grade must have minimum of 1 character'],
        maxLength:[5,'A code of salary grade must have maximum of 5 character'],
        unique: [true,'A code of salary grade with the same name has already exists'],
    },
    factor:{
        type: Number,
        required: [true,'A salary grade must have a factor'],
    },
    idPosition:{
        type: mongoose.Types.ObjectId,
        ref:'Position',
        required: [true,'A salary grade must link position'],
    },
    isDeleted:{
        type: Boolean,
        required: true,
        default: false,
    },

})

const SalaryGrade = mongoose.model('SalaryGrade', salaryGradeSchema)
export default SalaryGrade