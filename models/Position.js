import mongoose from "mongoose";

const positionSchema = mongoose.Schema({
    code:{
        type: String,
        required: [true, 'A Position must have a code'],
        minLength: [1,'A code of Position must have minimum of 1 character'],
        maxLength:[4,'A code of Position must have maximum of 4 character'],
        unique: [true,'A code of Position with the same name has already exists'],

    },
    name:{
        type: String,
        required: [true,'A Position must have a name'],
        minLength: [ 1,'A name of Position have minimum of 1 character'],
        maxLength: [100, 'A name of Position must have maximum of 100 character']
    },
    basicSalary:{
        type: Number,
        required: [true,'A Position must have basic salary'],
    },
    isDeleted:{
        type: Boolean,
        required: true,
        default: false,
    },
})

const Position = mongoose.model('Position',positionSchema);

export default Position