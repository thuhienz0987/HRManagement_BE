const { isValidObjectId } = require('mongoose');
const nodemailer = require('nodemailer');
const BadRequestError = require('../errors/badRequestError');
const NotFoundError = require('../errors/notFoundError');
const User = require('../models/User');
const VerificationToken = require('../models/VerificationToken');

exports.generateOTP = () => {
    let otp = '';
    for(let i = 0; i <=3; i++) {
        const randVal = Math.round(Math.random() * 9);
        otp = otp + randVal;
    }
    return otp;
};

exports.mailTransport = () => nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAILTRAP_USERNAME,
            pass: process.env.MAILTRAP_PASSWORD
        }
    });

exports.OtpTemplate = (OTP) => {
    return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        
        <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Please activate your account</title>
        <!--[if mso]><style type="text/css">body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }</style><![endif]-->
        </head>
        
        <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
        <table role="presentation"
            style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
            <tbody>
            <tr>
                <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
                <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                    <tbody>
                    <tr>
                        <td style="padding: 40px 0px 0px;">
                        <div style="text-align: left;">
                            <div style="padding-bottom: 20px;"><img
                                src="https://firebasestorage.googleapis.com/v0/b/fooddeliveryapp-ef427.appspot.com/o/logo.png?alt=media&amp;token=b8aacd2d-977c-4cf0-8f75-413e1e92dd94"
                                alt="FashionApp5" style="width: 114px;"></div>
                        </div>
                        <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                            <div style="color: rgb(0, 0, 0); text-align: center;">
                            <h1 style="margin: 1rem 0">Email verification</h1>
                            <p style="padding-bottom: 16px">Thank you for choosing FashionApp5. Use this OTP to complete your Sign-Up procedures and
                                verify your account on FashionApp5.</p>
                            <h2>OTP: ${OTP}</h2>
        
                            <p style="padding-bottom: 16px">If you didn’t ask to verify this address, you can ignore this email.</p>
                            <p style="padding-bottom: 16px">Thanks,<br>The FashionApp team</p>
                            </div>
                        </div>
                        <div style="padding-top: 20px; color: rgb(153, 153, 153); text-align: center;">
                            <p style="padding-bottom: 16px">Made with ♥ in UIT</p>
                        </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
                </td>
            </tr>
            </tbody>
        </table>
        </body>
        
        </html>
    `
};

exports.verifiedTemplate= () => {
    return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">

    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Please activate your account</title>
    <!--[if mso]><style type="text/css">body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }</style><![endif]-->
    </head>

    <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
    <table role="presentation"
        style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
        <tbody>
        <tr>
            <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
            <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                <tbody>
                <tr>
                    <td style="padding: 40px 0px 0px;">
                    <div style="text-align: right;">
                        <div style="padding-bottom: 20px;"><img
                            src="https://firebasestorage.googleapis.com/v0/b/fooddeliveryapp-ef427.appspot.com/o/logo.png?alt=media&amp;token=b8aacd2d-977c-4cf0-8f75-413e1e92dd94"
                            alt="FashionApp5" style="width: 141px;"></div>
                    </div>
                    <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                        <div style="color: rgb(0, 0, 0); text-align: center;">
                        <h1 style="margin: 1rem 0">Verified Successfully</h1>
                        <p style="padding-bottom: 16px">Congratulation for verify your FashionApp account successfully. Welcome to our team.</p>
                        <p style="padding-bottom: 16px">We look forward to seeing you,<br>The FashionApp5 team</p>
                        </div>
                    </div>
                    <div style="padding-top: 20px; color: rgb(153, 153, 153); text-align: center;">
                        <p style="padding-bottom: 16px">Made with ♥ in UIT</p>
                    </div>
                    </td>
                </tr>
                </tbody>
            </table>
            </td>
        </tr>
        </tbody>
    </table>
    </body>

    </html>
    `
};

exports.forgetPasswordTemplate = (url) => {
    return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">

    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your password</title>
    <!--[if mso]><style type="text/css">body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }</style><![endif]-->
    </head>

    <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
    <table role="presentation"
        style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
        <tbody>
        <tr>
            <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
            <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                <tbody>
                <tr>
                    <td style="padding: 40px 0px 0px;">
                    <div style="text-align: left;">
                        <div style="padding-bottom: 20px;"><img
                            src="https://firebasestorage.googleapis.com/v0/b/fooddeliveryapp-ef427.appspot.com/o/logo.png?alt=media&amp;token=b8aacd2d-977c-4cf0-8f75-413e1e92dd94"
                            alt="FashionApp5" style="width: 56px;"></div>
                    </div>
                    <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                        <div style="color: rgb(0, 0, 0); text-align: center;">
                        <h1 style="margin: 1rem 0">Trouble signing in?</h1>
                        <p style="padding-bottom: 16px">We've received a request to reset the password for this user account.</p>
                        <p style="padding-bottom: 16px"><a href="${url}" target="_blank"
                            style="padding: 12px 24px; border-radius: 4px; color: #FFF; background: #000;display: inline-block;margin: 0.5rem 0;">Reset
                            your password</a></p>
                        <p style="padding-bottom: 16px">If you didn't ask to reset your password, you can ignore this email.</p>
                        <p style="padding-bottom: 16px">Thanks,<br>The FashionApp team</p>
                        </div>
                    </div>
                    <div style="padding-top: 20px; color: rgb(153, 153, 153); text-align: center;">
                        <p style="padding-bottom: 16px">Made with ♥ in UIT</p>
                    </div>
                    </td>
                </tr>
                </tbody>
            </table>
            </td>
        </tr>
        </tbody>
    </table>
    </body>

    </html>
    `
};

exports.passwordResetTemplate= () => {
    return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">

    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Please activate your account</title>
    <!--[if mso]><style type="text/css">body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }</style><![endif]-->
    </head>

    <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
    <table role="presentation"
        style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
        <tbody>
        <tr>
            <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
            <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                <tbody>
                <tr>
                    <td style="padding: 40px 0px 0px;">
                    <div style="text-align: right;">
                        <div style="padding-bottom: 20px;"><img
                            src="https://firebasestorage.googleapis.com/v0/b/fooddeliveryapp-ef427.appspot.com/o/logo.png?alt=media&amp;token=b8aacd2d-977c-4cf0-8f75-413e1e92dd94"
                            alt="FashionApp5" style="width: 141px;"></div>
                    </div>
                    <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                        <div style="color: rgb(0, 0, 0); text-align: center;">
                        <h1 style="margin: 1rem 0">Reset Password Successfully</h1>
                        <p style="padding-bottom: 16px">Congratulation for reset your FashionApp account's password successfully. Welcome back to our team.</p>
                        <p style="padding-bottom: 16px">We look forward to seeing you,<br>The FashionApp5 team</p>
                        </div>
                    </div>
                    <div style="padding-top: 20px; color: rgb(153, 153, 153); text-align: center;">
                        <p style="padding-bottom: 16px">Made with ♥ in UIT</p>
                    </div>
                    </td>
                </tr>
                </tbody>
            </table>
            </td>
        </tr>
        </tbody>
    </table>
    </body>

    </html>
    `
};