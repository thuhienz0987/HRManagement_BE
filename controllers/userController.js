const User = require('../models/User');
const cloudinary = require('../helper/imageUpload');
const NotFoundError = require('../errors/notFoundError');
const InternalServerError = require('../errors/internalServerError');

module.exports.edit_user_profile = async (req, res) => {
    const { name, phoneNumber, address, birthday, gender, email, level} = req.body;

    const id = req.params._id;
    // find user by id
    const user = await User.findById(id);

    // check if user found
    if (!user) throw new NotFoundError('User not found!');

    // edit user information
    user.name = name;
    user.address = address;
    user.phoneNumber = phoneNumber;
    user.birthday = birthday;
    user.gender = gender;
    user.email = email;
    user.level = level;

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

module.exports.get_all_user = async (req, res) => {
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

module.exports.get_user_by_id = async (req, res) => {
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
