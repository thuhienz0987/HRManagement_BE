import { isValidObjectId } from "mongoose";
import BadRequestError from "../errors/badRequestError.js";
import NotFoundError from "../errors/notFoundError.js";
import ResetToken from "../models/ResetToken.js";
import User from "../models/User.js";

const isValidResetToken = async (req, res, next) => {
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

export default isValidResetToken;