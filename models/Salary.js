import mongoose from 'mongoose'

const salarySchema = mongoose.Schema({
    idUser:{
        type:  mongoose.Types.ObjectId,
        ref:'User',
        required:[true,'A salary must link a id of user']
    },
    idPosition:{
        type:  mongoose.Types.ObjectId,
        ref:'Position',
        required:[true,'A salary must link a id of position']
    },
    idSalaryGrade:{
        type:  mongoose.Types.ObjectId,
        ref:'SalaryGrade',
        required:[true,'A salary must link a id of salary grade']
    },
    idBonus:[{
        type:  mongoose.Types.ObjectId,
        ref:'Bonus',
        required:[true,'A salary must link a id of bonus']
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
        default: Date.now(),
        required: true,
    },
    daysOff:{
        type: Number,
        default: 0,
        required: true,
    },
    totalSalary:{
        type: Number,
        default: 0,
        required: true
    },
    totalIncome:{
        type: Number,
        default: 0,
        required: true
    },
    incomeTaxAmount:{
        type: Number,
        default: 0,
        required: true
    }
    
})

const Salary = mongoose.model('Salary', salarySchema)
export default Salary