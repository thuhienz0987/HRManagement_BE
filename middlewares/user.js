const { isValidObjectId } = require("mongoose");
const BadRequestError = require("../errors/badRequestError");
const NotFoundError = require("../errors/notFoundError");
const ResetToken = require("../models/ResetToken");
const User = require("../models/User");

exports.isValidResetToken = async (req, res, next) => {
    const { token, id} = req.query;
    if (!token || !id) throw new BadRequestError("Invalid request!");
    
    if (!isValidObjectId(id)) throw new BadRequestError("Invalid user!");

    const user = await User.findById(id);
    if (!user) throw new NotFoundError("User not found!");

    const resetToken = await ResetToken.findOne({owner: user._id});
    if (!resetToken) throw new NotFoundError("Reset token not found!");

    const isValid = await resetToken.compareToken(token);
    if(!isValid) throw new BadRequestError("Reset token is not valid!");

    req.user = user;
    console.log(req.user)
    next();
};
