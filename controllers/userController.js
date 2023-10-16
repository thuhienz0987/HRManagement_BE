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
import Team from '../models/Team.js';
import {parse, format } from 'date-fns';
import Department from '../models/Department.js';
import Position from '../models/Position.js';

// init password validator
let passwordSchema = new PasswordValidator();

// Add properties to it
passwordSchema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().not().spaces();                          // Should not have spaces

const generateUserCode = (positionCode, positionAmount) => {
    positionAmount++;
    let formattedAmount = positionAmount.toString().padStart(3, '0');
    let userCode = positionCode + '_' + formattedAmount;
    
    return userCode;
}
const handleRoles = (positionCode) => {
    let rolesArray = [];
    switch(positionCode)
    {
        case 'CEO':
            rolesArray = [ROLES_LIST.CEO, ROLES_LIST.Employee];
            break;
        case 'HRM':
            rolesArray = [ROLES_LIST.HRManager, ROLES_LIST.DepartmentManager, ROLES_LIST.Employee];
            break;
        case 'DEM':
            rolesArray = [ROLES_LIST.DepartmentManager, ROLES_LIST.Employee];
            break;
        case 'TEM':
            rolesArray = [ROLES_LIST.TeamManager, ROLES_LIST.Employee];
            break;
        default:
            rolesArray = [ROLES_LIST.Employee];
            break;
    }
    return rolesArray;
}
const create_user = async (req, res) => {
    const { email, name, phoneNumber, address, birthday, gender, homeTown, ethnicGroup, level, positionId} = req.body;

    try {
        const birthDay = parse(birthday, 'dd/MM/yyyy', new Date());
        const isoBirthDayStr = format(birthDay, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const position = await Position.findOne({_id: positionId, isDeleted: false});
        if (!position)
            throw new NotFoundError(
            `The position with position _id ${positionId} does not exists`
        );
        else if (position.isDeleted === true) {
            res.status(410).send(`Position with position _id ${positionId} is deleted`);
        }
        const positionAmount = await User.countDocuments({positionId: position._id, isEmployee: true});
                
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
            code: generateUserCode(position.code, positionAmount),
            name, 
            phoneNumber,
            birthday: isoBirthDayStr,
            address,  
            gender, 
            homeTown,
            ethnicGroup, 
            level,
            positionId,
            avatarImage,
            roles: handleRoles(position.code)
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
    try {
        const { name, phoneNumber, address, birthday, gender, level, isEmployee, teamId, positionId} = req.body;
        const birthDay = parse(birthday, 'dd/MM/yyyy', new Date());
        const isoBirthDayStr = format(birthDay, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const team = await Team.findOne({_id: teamId});
        if (!team)
            throw new NotFoundError(
            `The users with team _id ${teamId} does not exists`
        );
        else if (team.isDeleted === true) {
            res.status(410).send("Team is deleted");
        } 
        const newPosition = await Position.findOne({_id: positionId, isDeleted: false});
        if (!newPosition)
            throw new NotFoundError(
            `The position with position _id ${positionId} does not exists`
        );
        else if (newPosition.isDeleted === true) {
            res.status(410).send(`Position with position _id ${positionId} is deleted`);
        }
        const positionAmount = await User.countDocuments({positionId: newPosition._id, isEmployee: true});
        const id = req.params._id;
        // find user by id
        const user = await User.findById(id);

        // check if user found
        if (!user) throw new NotFoundError('User not found!');

        // edit user information
        user.code = generateUserCode(newPosition.code, positionAmount)||user.code,
        user.name = name||user.name;
        user.address = address||user.address;
        user.phoneNumber = phoneNumber||user.phoneNumber;
        user.birthday = isoBirthDayStr||user.birthday;
        user.gender = gender||user.gender;
        user.level = level||user.level;
        user.isEmployee = isEmployee||user.isEmployee;
        user.teamId = teamId||user.teamId;
        user.positionId = positionId||user.positionId;
        user.roles = handleRoles(newPosition.code);

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

    
        // save the user
        await user.save();
        team.employeeCount = await User.countDocuments({ teamId: teamId, isEmployee: true});
        await team.save();
        // delete refresh token and password from user info
        user.refreshToken = undefined;
        user.password = undefined;

        // send success message to front end
        res.status(200).json({Status: 'Success', message: `Update ${user.firstName}'s information successfully`, user: user});
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