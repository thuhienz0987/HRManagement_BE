import mongoose from "mongoose";

const allowanceSchema = mongoose.Schema({
    allowanceLevel:{
        type: Number,
        required: [true,'Allowance must have a level'],
    },
    code:{
        type: String,
        required: [true,'Allowance must have a code'],
        minLength: [ 1,'A code of allowance have minimum of 1 character'],
        maxLength: [10, 'A code of allowance must have maximum of 10 character']
    },
    isDeleted:{
        type: Boolean,
        required: true,
        default: false,
    },
})

const Allowance = mongoose.model('Allowance', allowanceSchema)
export default Allowance