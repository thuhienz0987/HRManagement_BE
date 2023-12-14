import User from "../models/User.js";
import jwt from "jsonwebtoken";
import BadRequestError from "../errors/badRequestError.js";
import ForbiddenError from "../errors/forbiddenError.js";
import NotFoundError from "../errors/notFoundError.js";
import ResetToken from "../models/ResetToken.js";
import VerificationToken from "../models/VerificationToken.js";

import { createRandomBytes } from "../utils/helper.js";
import {
  mailTransport,
  forgetPasswordTemplate,
  OtpTemplate,
  generateOTP,
  passwordResetTemplate,
} from "../utils/mail.js";
import passwordValidator from "password-validator";

let passwordSchema = new passwordValidator();

// define max age of JWT
const maxAgeAccessToken = 60 * 60;
const maxAgeRefreshToken = 60 * 60 * 24 * 30 * 6;

const login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const validateResult = passwordSchema.validate(password.trim(), {
      details: true,
    });
    if (validateResult.length != 0) {
      throw new BadRequestError(validateResult);
    }
    const user = await User.login(email, password);
    // create JWTs for logged in user.
    const accessToken = jwt.sign(
      {
        userInfo: {
          userId: user._id,
          roles: user.roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: maxAgeAccessToken }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: maxAgeRefreshToken }
    );

    // set new refresh token
    user.refreshToken = refreshToken;
    const result = await user.save();
    console.log("login success: ", result);
    // delete refresh token and password from user info
    user.password = undefined;

    // Send authorization roles and access token to user
    res.json({ accessToken, user });
  } catch (err) {
    throw err;
  }
};

const logout_post = async (req, res) => {
  // check if cookies exist
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //no token == no need handle

  // check if jwt belong to any user
  const refreshToken = cookies.jwt;
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(204);
  }

  // clear refreshToken when logout
  foundUser.refreshToken = "";
  const result = await foundUser.save();

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
};

const forget_password = async (req, res) => {
  const { email } = req.body;
  console.log({ email });

  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError("User not found, invalid request");

  const token = await ResetToken.findOne({ owner: user._id });
  if (token)
    throw new ForbiddenError(
      "Only after one hour you can request for another token!"
    );

  // generate verification otp
  const OTP = generateOTP();

  const resetToken = new ResetToken({
    owner: user.id,
    token: OTP,
  });

  const result = await resetToken.save();

  // send a mail that contain otp to the user's email
  mailTransport().sendMail({
    from: "HRManagement2003@gmail.com",
    to: user.email,
    subject: "Otp to reset your password",
    html: OtpTemplate(OTP),
  });

  res.status(200).json(result);
};

passwordSchema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(16) // Maximum length 16
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .not()
  .spaces();

const reset_password = async (req, res) => {
  try {
    const { password, otp } = req.body;
    if (!password || !otp.trim()) throw new BadRequestError("Invalid request!");

    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError("User not found!");

    const token = await ResetToken.findOne({ owner: user._id });
    if (!token) throw new NotFoundError("OTP is wrong!");
    const isMatched = await token.compareToken(otp);
    if (!isMatched) throw new BadRequestError("Please provide a valid OTP!");

    const isSamePassword = await user.comparePassword(password);
    if (isSamePassword)
      throw new BadRequestError(
        "New password must be different from the old one!"
      );

    // validate password
    const validateResult = passwordSchema.validate(password.trim(), {
      details: true,
    });
    if (validateResult.length != 0) {
      throw new BadRequestError(validateResult);
    }

    user.password = password.trim();
    await user.save();
    await ResetToken.findOneAndDelete({ owner: user._id });

    mailTransport().sendMail({
      from: "HRManagement2003@gmail.com",
      to: user.email,
      subject: "Password Reset Successfully",
      html: passwordResetTemplate(),
    });

    res
      .status(200)
      .json({ Status: "Success", message: "Password Reset Successfully" });
  } catch (err) {
    throw err;
  }
};

export { login_post, logout_post, forget_password, reset_password };
