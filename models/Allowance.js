import mongoose from "mongoose";

const ALLOWANCE_TYPES = ['travel', 'lunch', 'health', 'social'];

const allowanceSchema = mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Allowance must have a code'],
        minLength: [1, 'A code of allowance have minimum of 1 character'],
        maxLength: [10, 'A code of allowance must have maximum of 10 characters'],
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false,
    },
    // type: {
    //     type: String,
    //     enum: ALLOWANCE_TYPES,
    //     required: [true, 'Allowance must have a type'],
    // },
    name: {
        type: String,
        required: function() {
            return ALLOWANCE_TYPES.includes(this.type);
        },
    },
    amount: {
        type: Number,
        required: [true, 'Allowance must have an amount'],
    },

});

const Allowance = mongoose.model('Allowance', allowanceSchema);
export default Allowance;
