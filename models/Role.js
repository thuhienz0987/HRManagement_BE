const mongoose = require("mongoose");

const roleSchema = mongoose.Schema({
    code:{
        type: String,
        required: [true, 'A role must have a code'],
        minLength: [1,'A code of role must have minimum of 1 character'],
        maxLength:[4,'A code of role must have maximum of 4 character'],
        unique: [true,'A code of role with the same name has already exists'],

    },
    name:{
        type: String,
        required: [true,'A role must have a name'],
        minLength: [ 1,'A name of role have minimum of 1 character'],
        maxLength: [100, 'A name of role must have maximum of 100 character']
    },
    isDeleted:{
        type: Boolean,
        required: true,
        default: false,
    },
})

const Role = mongoose.model('Role',roleSchema);

module.exports = Role