const jwt = require('jsonwebtoken');
const UnauthorizedError  = require('../errors/unauthorizedError');
const ForbiddenError  = require('../errors/forbiddenError');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader?.startsWith('Bearer ')) throw new UnauthorizedError("No access token found");// does not include token
    const token = authHeader.split(' ')[1];
    console.log("verifyJWT: ", token);
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) throw new ForbiddenError(err); //invalid token
            console.log(decoded);
            req.userId = decoded.userInfo.userId;
            req.roles = decoded.userInfo.roles;
            next();
        }
    );
};

module.exports = verifyJWT;