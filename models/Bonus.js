import mongoose from "mongoose";

const bonusSchema = mongoose.Schema({
    code:{
        type: String,
        required: [true, 'A Bonus must have a code'],
        minLength: [1,'A code of Bonus must have minimum of 1 character'],
        maxLength:[4,'A code of Bonus must have maximum of 4 character'],
        unique: [true,'A code of Bonus with the same name has already exists'],
    },
    level:{
        type: Number,
        required: [true,'A Bonus must have a level'],

    },
    isDeleted:{
        type: Boolean,
        required: true,
        default: false,
    },
})

const Bonus = mongoose.model('Bonus',bonusSchema);

export default Bonus