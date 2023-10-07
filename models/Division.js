import mongoose from "mongoose";

const divisionSchema = mongoose.Schema({
    code:{
        type: String,
        required: [true, 'A division must have a code'],
        unique: [true,'A code of division with the same name has already exists'],
    },
    name:{
        type: String,
        required: [true,'A Division must have a name'],
        minLength: [ 1,'A name of Division have minimum of 1 character'],
        maxLength: [100, 'A name of Division must have maximum of 100 character']
    },
    managerId:{
        type: mongoose.Types.ObjectId,
        required: [true,'A Division must have a manager'],
        unique: [true,'A Division cannot have more than one manager'],
        ref: 'User'
    },
    departmentCount:{
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

const Division = mongoose.model('Division',divisionSchema);

export default Division