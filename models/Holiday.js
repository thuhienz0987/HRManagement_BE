import mongoose from "mongoose";

const holidaySchema = mongoose.Schema({
    day:{
        type: Date,
        required: [true],
    },
    name:{
        type: String,
        required: [true, 'A holiday must have a name'],
        minLength: [ 1,'A name of holiday have minimum of 1 character'],
        maxLength: [100, 'A name of holiday must have maximum of 100 character']    
    },
    isDeleted:{
        type: Boolean,
        required: true,
        default: false,
    },
})

// Define the 'some' method to check if a holiday exists


const Holiday = mongoose.model('Holiday',holidaySchema);

export default Holiday