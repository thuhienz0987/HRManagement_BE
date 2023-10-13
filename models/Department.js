import mongoose from "mongoose";

const departmentSchema = mongoose.Schema({
    code:{
        type: String,
        required: [true, 'A department must have a code'],
        unique: [true,'A code of department with the same name has already exists'],
    },
    name:{
        type: String,
        required: [true,'A department must have a name'],
        minLength: [ 1,'A name of department have minimum of 1 character'],
        maxLength: [100, 'A name of department must have maximum of 100 character']
    },
    managerId:{
        type: mongoose.Types.ObjectId,
        required: [true,'A department must have a manager'],
        unique: [true,'A manager cannot manage more than one department'],
        ref: 'User'
    },
    teamCount:{
        type: Number,
        default: 0,
        required: true,
    },
    isDeleted:{
        type: Boolean,
        required: true,
        default: false,
    },
})

const Department = mongoose.model('Department',departmentSchema);

export default Department