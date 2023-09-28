import User from '../models/User.js';
import cloudinary from '../helper/imageUpload.js';
import bcrypt from 'bcrypt';
import { isValidObjectId } from 'mongoose';
import BadRequestError from '../errors/badRequestError.js';
import NotFoundError from '../errors/notFoundError.js';
import InternalServerError from '../errors/internalServerError.js';
import PasswordValidator from 'password-validator';
import ROLES_LIST from '../config/roles_list.js';
import { mailTransport, OtpTemplate,verifiedTemplate, generateOTP } from '../utils/mail.js';
import VerificationToken from '../models/VerificationToken.js';

// init password validator
let passwordSchema = new PasswordValidator();

// Add properties to it
passwordSchema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().not().spaces();                          // Should not have spaces


const create_user = async (req, res) => {
    const { email, name, phoneNumber, address, birthday, gender, homeTown, ethnicGroup, level, isEmployee} = req.body;

    try {
        // upload result init
        let result;
        if (req.file) {
            try {
                result = await cloudinary.uploader.upload(req.file.path, {
                    public_id: `${user._id}_profile`,
                    width: 500,
                    height: 500,
                    crop: 'fill',
                });
            }
            catch (err) {throw new InternalServerError('Unable to upload avatar, please try again');}
        }
        let avatarImage;
        // check if image upload or not
        if (result) {
            avatarImage = result.url;
        }

        // new user create
        const newUser = new User({
            email, 
            name, 
            phoneNumber,
            birthday,
            address,  
            gender, 
            homeTown,
            ethnicGroup, 
            level,
            isEmployee,
            avatarImage,
            roles: [ROLES_LIST.User]
        })

        // generate verification otp
        const OTP = generateOTP();
        const newVerificationToken = new VerificationToken({
            owner: newUser._id,
            token: OTP
        });
        // save the otp and user to db
        const verificationToken = await newVerificationToken.save();
        const user = await newUser.save();
        
        // send a mail that contain otp to the user's email
        mailTransport().sendMail({
            from: 'HRManagement2003@gmail.com',
            to: newUser.email,
            subject: 'Verify your email account',
            html: OtpTemplate(OTP),
        });

        res.status(201).json({ 'success': true,'message': `New user ${user} created!` });
    }
    catch (err) {
        if (err.code === 11000) throw new BadRequestError({"message": "This email has already been registered"})
        throw err;
    }
};
const verifyEmailUser = async (req, res) => {
    const { userId, otp } = req.body;
    console.log(otp);
    if (!userId || !otp.trim()) throw new BadRequestError('opt and userId required!');

    if( !isValidObjectId(userId) ) throw new BadRequestError('invalid userId!');

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found!');

    if (user.emailVerified) throw new BadRequestError('This email is already verified!');

    const token = await VerificationToken.findOne({owner: user._id});

    if (!token) throw new NotFoundError('User not found!');

    const isMatched = await token.compareToken(otp);
    if(!isMatched) throw new BadRequestError('Please provide a valid OTP!');

    user.emailVerified = true;

    await VerificationToken.findByIdAndDelete(token._id);
    await user.save();

    mailTransport().sendMail({
        from: 'HRManagement2003@gmail.com',
        to: user.email,
        subject: 'Verify your email account success',
        html: verifiedTemplate(),
    });

    res.status(200).json({"Status": "Success"});
};
const edit_user_profile = async (req, res) => {
    const { name, phoneNumber, address, birthday, gender, level, isEmployee} = req.body;

    const id = req.params._id;
    // find user by id
    const user = await User.findById(id);

    // check if user found
    if (!user) throw new NotFoundError('User not found!');

    // edit user information
    user.name = name||user.name;
    user.address = address||user.address;
    user.phoneNumber = phoneNumber||user.phoneNumber;
    user.birthday = birthday||user.birthday;
    user.gender = gender||user.gender;
    user.level = level||user.level;
    user.isEmployee = isEmployee||user.isEmployee;

    // upload result init
    let result;
    if (req.file) {
        try {
            result = await cloudinary.uploader.upload(req.file.path, {
                public_id: `${user._id}_profile`,
                width: 500,
                height: 500,
                crop: 'fill',
            });
        }
        catch (err) {throw new InternalServerError('Unable to upload avatar, please try again');}
    }

    // check if image upload or not
    if (result) {
        user.avatarImage = result.url;
    }

    try {
        // save the user
        await user.save();

        // delete refresh token and password from user info
        user.refreshToken = undefined;
        user.password = undefined;

        // send success message to front end
        res.status(200).json({Status: 'Success', message: `Update ${user.firstName}'s information successfully`, user: user})
    }
    catch (err) {throw err;}
};

const get_all_user = async (req, res) => {
    User.find()
    .then((result)=>{
        let handledResult = result.map(item => {
            item.password = undefined;
            return item
        })
        res.send(handledResult);
    })
    .catch((err)=>{
        throw err;
    })
}

const get_user_by_id = async (req, res) => {
    try {
        const id = req.params._id;
        const user = await User.findById(id);
        if ( !user ) throw new NotFoundError('User not found');
        user.password = undefined;
        res.status(200).json({status: 'Success', user: user})
    }
    catch (err) {
        throw err
    }
}

export {create_user, verifyEmailUser, edit_user_profile, get_all_user, get_user_by_id};