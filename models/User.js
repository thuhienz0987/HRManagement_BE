import mongoose from "mongoose";
import pkg from "validator";
import bcrypt from "bcrypt";
import validator from "validator";
import ROLES_LIST from "../config/roles_list.js";
const { isEmail } = pkg;
import { generateRandomPassword } from "../utils/helper.js";
import { mailTransport, UserPassword } from "../utils/mail.js";
import UnauthorizedError from "../errors/unauthorizedError.js";
import BadRequestError from "../errors/badRequestError.js";

const userSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "A user must have a code"],
      unique: [true, "A code of user with the same name has already exists"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "A email with the same name has already exists"],
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    password: {
      type: String,
    },
    name: {
      type: String,
      required: [true, "Name is missing"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please tell us your phone number"],
      minLength: [
        9,
        "The phone number should have a minimum length of 9 characters",
      ],
      maxLength: [
        11,
        "The phone number should have a maximum length of 11 characters",
      ],
    },
    birthday: {
      type: Date,
      required: [true, "Birthday is missing"],
    },
    address: {
      type: String,
      required: [true, "Address is missing"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Gender is missing"],
    },
    homeTown: {
      type: String,
      required: [true, "Home town is missing"],
    },
    ethnicGroup: {
      type: String,
      required: [true, "Ethnic group is missing"],
    },
    level: {
      type: String,
      enum: ["college", "university", "master", "doctorate"],
      required: [true, "Level is missing"],
    },
    isEmployee: {
      type: Boolean,
      required: [true, "Is employee is missing"],
      default: true,
    },
    positionId: {
      type: mongoose.Types.ObjectId,
      required: [true, "User must have a position"],
      ref: "Position",
    },
    teamId: {
      type: mongoose.Types.ObjectId,
      default: null,
      ref: "Team",
    },
    departmentId: {
      type: mongoose.Types.ObjectId,
      default: null,
      ref: "Department",
    },
    refreshToken: {
      type: String,
    },
    avatarImage: {
      type: String,
      default:
        "https://res.cloudinary.com/dux8aqzzz/image/upload/v1685547037/xd0gen7b4z5wgwuqfvpz.png",
      required: true,
    },
    roles: {
      type: [String],
      required: true,
      default: [ROLES_LIST.Employee],
    },
    salaryGrade: {
      type: Number,
      default: 1.0,
      required: [true, "A user must have a salary grade"],
      min: [1.0, "Salary grade must not be smaller than 1.0"],
    },
    dayOff: {
      type: Date,
    },
  },
  { timestamps: true }
);

// static method to login user
userSchema.statics.login = async function (email, password) {
  if (!validator.isEmail(email)) {
    throw new BadRequestError("Invalid email");
  }
  const user = await this.findOne({ email })
    .populate("positionId")
    .populate("departmentId")
    .populate("teamId");
  console.log(user);
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw new UnauthorizedError("Incorrect password");
  }
  throw new UnauthorizedError("Incorrect email");
};

userSchema.methods.comparePassword = async function (password) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
  }

  next();
});

const User = mongoose.model("User", userSchema);

export default User;
