import mongoose from 'mongoose';
import pkg from 'validator';
import bcrypt from 'bcrypt';
import validator from 'validator';
import ROLES_LIST from '../config/roles_list.js';
const { isEmail } = pkg;
import { generateRandomPassword } from '../utils/helper.js';
import { mailTransport, UserPassword } from '../utils/mail.js';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true,'A email with the same name has already exists'],
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email');
            }
        }
    },
    password: {
        type: String,
        required: true,
        default: function() {
            const randomPassword = generateRandomPassword(8);
            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);
            const hashedPassword = bcrypt.hashSync(randomPassword, salt);
            mailTransport().sendMail({
                from: 'HRManagement2003@gmail.com',
                to: this.email,
                subject: 'Your Password',
                html: UserPassword(randomPassword),
            });
      
            return hashedPassword;
        },
    },
    name: {
        type: String,
        required: [true, 'Name is missing']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please tell us your phone number'],
        minLength: [9, 'Please check your phone number'],
        maxLength: [11, 'Please check your phone number']
    },
    birthday: {
        type: Date,
        required: [true, 'Birthday is missing']
    },
    address: {
        type: String,
        required: [true, 'Address is missing']
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: [true, 'Gender is missing']
    },
    homeTown: {
        type: String,
        required: [true, 'Home town is missing']
    },
    ethnicGroup: {
        type: String,
        required: [true, 'Ethnic group is missing']
    },
    level: {
        type: String,
        enum: ["college", "university", "master", "doctorate"],
        required: [true, 'Level is missing']
    },
    isEmployee: {
        type: Boolean,
        required: [true, 'Is employee is missing'],
        default: true
    },
    emailVerified: {
        type: Boolean,
        required: [true, 'Your email has not been verified yet, please verify your email to use our app'],
        default: false
    },
    refreshToken: {
        type: String
    },
    avatarImage: {
        type: String,
        default: 'https://res.cloudinary.com/dux8aqzzz/image/upload/v1685547037/xd0gen7b4z5wgwuqfvpz.png',
        required: true
    },
    roles: {
        type: [String],
        required: true,
        default: [ROLES_LIST.User]
    },
},
    { timestamps: true }
);

// static method to login user
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    console.log(user);
    if (user) {
            const auth = await bcrypt.compare(password, user.password);
            if (auth) {
                return user;
            }
            throw Error('incorrect password');
    }
    throw Error('incorrect email');
};

userSchema.methods.comparePassword = async function (password) {
    const result = await bcrypt.compare(password, this.password);
    return result;
};

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
    }
    
    next();
})

const User = mongoose.model('user', userSchema);

export default User;