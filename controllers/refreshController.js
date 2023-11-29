import User from "../models/User.js";
import jwt from "jsonwebtoken";
import ForbiddenError from "../errors/forbiddenError.js";

const maxAgeAccessToken = 60 * 15;

const handleRefreshToken = async (req, res) => {
  // console.log(req.cookies);
  // const cookies = req.cookies;
  const { refreshToken } = req.body;

  // check if there are cookies --> if yes then check if jwt exists
  // if(!cookies?.jwt) throw new UnauthorizedError("No refresh token found");;
  // refreshToken = cookies.jwt;

  // find the user that owned this jwt
  const user = await User.findOne({ refreshToken }).exec();
  console.log(user);
  if (!user) throw new ForbiddenError("invalid refresh token"); // token does not match with any user

  // evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    console.log(decoded);
    if (err || user._id.toString() !== decoded.userId)
      throw new ForbiddenError("invalid refresh token");

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
    res.json({ accessToken });
  });
};

export default handleRefreshToken;
