import mongoose from "mongoose";

const teamSchema = mongoose.Schema({
    code:{
        type: String,
        required: [true, 'A Team must have a code'],
        unique: [true,'A code of Team with the same name has already exists'],
    },
    name:{
        type: String,
        required: [true,'A Team must have a name'],
        minLength: [ 1,'A name of Team have minimum of 1 character'],
        maxLength: [100, 'A name of Team must have maximum of 100 character']
    },
    managerId:{
        type: mongoose.Types.ObjectId,
        required: [true,'A Team must have a manager'],
        unique: [true,'A manager cannot manage more than one team'],
        ref: 'User'
    },
    departmentId:{
        type: mongoose.Types.ObjectId,
        required: [true,'A Team must belong to a department'],
        ref: 'Department'
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

const Team = mongoose.model('Team',teamSchema);

export default Team