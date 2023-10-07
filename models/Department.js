import mongoose from "mongoose";

const departmentSchema = mongoose.Schema({
    code:{
        type: String,
        required: [true, 'A department must have a code'],
        unique: [true,'A code of department with the same name has already exists'],
    },
    name:{
        type: String,
        required: [true,'A Department must have a name'],
        minLength: [ 1,'A name of Department have minimum of 1 character'],
        maxLength: [100, 'A name of Department must have maximum of 100 character']
    },
    managerId:{
        type: mongoose.Types.ObjectId,
        required: [true,'A Department must have a manager'],
        unique: [true,'A Department cannot have more than one manager'],
        ref: 'User'
    },
    divisionId:{
        type: mongoose.Types.ObjectId,
        required: [true,'A Department must belong to a division'],
        ref: 'Division'
    },
    employeeCount:{
        type: Number,
        default: 1,
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