import jwt from "jsonwebtoken";
import User from "../../models/User";
import { login_post } from "../../controllers/authController";
import passwordValidator from "password-validator";
import BadRequestError from "../../errors/badRequestError";

jest.mock("../../models/User");
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));
jest.mock("password-validator", () => {
  return jest.fn().mockImplementation(() => {
    return {
      is: jest.fn().mockReturnThis(),
      min: jest.fn().mockReturnThis(),
      max: jest.fn().mockReturnThis(),
      has: jest.fn().mockReturnThis(),
      uppercase: jest.fn().mockReturnThis(),
      lowercase: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      spaces: jest.fn().mockReturnThis(),
      validate: jest.fn().mockReturnValue([]), // Assuming an empty array is the expected return value
    };
  });
});

const mockRequest = (email, password) => ({
  body: { email: email, password: password },
});
const mockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
};
const passwordSchema = new passwordValidator();
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
process.env.ACCESS_TOKEN_SECRET = "mockAccessTokenSecret";
process.env.REFRESH_TOKEN_SECRET = "mockRefreshTokenSecret";
describe("Login Post Controller", () => {
  it("should login user successfully and return tokens and user info", async () => {
    const req = mockRequest("sontung01062003@gmail.com", "Sontung01062003");
    const res = mockResponse();
    const fakeUser = {
      _id: "651b919498bf3396039b12fc",
      email: "sontung01062003@gmail.com",
      name: "Nguyễn Thanh Tùng",
      phoneNumber: "0333883127",
      birthday: "2004-11-08T00:00:00.000Z",
      address: "Binh Duong",
      gender: "male",
      homeTown: "Brazil",
      ethnicGroup: "Kinh",
      level: "university",
      isEmployee: true,
      avatarImage:
        "http://res.cloudinary.com/dano2vyry/image/upload/v1702526111/651b919498bf3396039b12fc_profile.jpg",
      createdAt: "2023-10-03T03:59:16.763Z",
      updatedAt: "2023-12-26T14:31:58.585Z",
      __v: 0,
      refreshToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTFiOTE5NDk4YmYzMzk2MDM5YjEyZmMiLCJpYXQiOjE3MDM2MDExMTgsImV4cCI6MTcxOTE1MzExOH0.UPnarFsHVuKTwDX-0g_jfls2onFCwYai3F5ShNVWEEQ",
      teamId: null,
      departmentId: "6527a58bdf91518066200afb",
      roles: ["3204", "2001", "1984"],
      positionId: "6528dc9e93566d823f7213bc",
      code: "230002",
      salaryGrade: 1.5,
      save: jest.fn(),
    };
    User.login = jest.fn().mockResolvedValue(fakeUser);
    passwordSchema.validate = jest.fn().mockResolvedValue([]);

    User.prototype.save = jest.fn().mockResolvedValue(fakeUser);

    await login_post(req, res);

    // expect(passwordSchema.validate).toHaveBeenCalledWith("Sontung01062003", {
    //   details: true,
    // });
    expect(User.login).toHaveBeenCalledWith(
      "sontung01062003@gmail.com",
      "Sontung01062003"
    );
    expect(fakeUser.save).toHaveBeenCalledWith();
    expect(jwt.sign).toHaveBeenNthCalledWith(
      1,
      {
        userInfo: {
          userId: "651b919498bf3396039b12fc",
          roles: ["3204", "2001", "1984"],
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 3600 }
    );
    expect(jwt.sign).toHaveBeenNthCalledWith(
      2,
      { userId: "651b919498bf3396039b12fc" },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: 15552000 }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        user: fakeUser,
      })
    );
  });
  it("should handle password have a minimum length of 8 characters", async () => {
    const req = mockRequest("sontung01062003@gmail.com", "Sontu01");
    const res = mockResponse();
    const validateResult = [
      {
        validation: "min",
        arguments: 8,
        message: "The string should have a minimum length of 8 characters",
      },
    ];
    passwordSchema.validate = jest.fn().mockResolvedValue(validateResult);

    try {
      await login_post(req, res);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toEqual(validateResult[0].message);
    }
  });

  it("should handle password have a maximum length of 16 characters", async () => {
    const req = mockRequest(
      "sontung01062003@gmail.com",
      "Sontung0106200323932832"
    );
    const res = mockResponse();
    const validateResult = [
      {
        validation: "max",
        arguments: 16,
        message: "The string should have a maximum length of 16 characters",
      },
    ];
    passwordSchema.validate = jest.fn().mockResolvedValue(validateResult);

    try {
      await login_post(req, res);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toEqual(validateResult[0].message);
    }
  });
  it("should handle password have a minimum of 1 lowercase letter", async () => {
    const req = mockRequest("sontung01062003@gmail.com", "SONTUNG01062003");
    const res = mockResponse();
    const validateResult = [
      {
        validation: "lowercase",
        message: "The string should have a minimum of 1 lowercase letter",
      },
    ];
    passwordSchema.validate = jest.fn().mockResolvedValue(validateResult);

    try {
      await login_post(req, res);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toEqual(validateResult[0].message);
    }
  });
  it("should handle password have a minimum of 1 uppercase letter", async () => {
    const req = mockRequest("sontung01062003@gmail.com", "sontung01062003");
    const res = mockResponse();
    const validateResult = [
      {
        validation: "uppercase",
        message: "The string should have a minimum of 1 uppercase letter",
      },
    ];
    passwordSchema.validate = jest.fn().mockResolvedValue(validateResult);

    try {
      await login_post(req, res);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toEqual(validateResult[0].message);
    }
  });

  it("password should not have spaces", async () => {
    const req = mockRequest("sontung01062003@gmail.com", "Sontung 01062003");
    const res = mockResponse();
    const validateResult = [
      {
        validation: "spaces",
        inverted: true,
        message: "The string should not have spaces",
      },
    ];
    passwordSchema.validate = jest.fn().mockResolvedValue(validateResult);

    try {
      await login_post(req, res);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toEqual(validateResult[0].message);
    }
  });

  it("should handle user not found and throw incorrect email", async () => {
    const req = mockRequest("sontung01062003@gmail.com", "Sontung01062003");
    const res = mockResponse();
    User.login = jest.fn().mockResolvedValue(null);

    User.login.mockRejectedValue(new Error("incorrect email"));
    await expect(User.login(req, res)).rejects.toThrow(
      new Error("incorrect email")
    );
  });
  it("should handle user not found and throw incorrect email", async () => {
    const req = mockRequest("sontung01062003@gmail.com", "Sontung01062003");
    const res = mockResponse();
    User.login = jest.fn().mockResolvedValue(null);

    User.login.mockRejectedValue(new Error("incorrect password"));
    await expect(User.login(req, res)).rejects.toThrow(
      new Error("incorrect password")
    );
  });

  it("should handle errors thrown within the controller", async () => {
    const req = mockRequest("sontung01062003@gmail.com", "Sontung01062003");
    const res = mockResponse();

    User.login.mockRejectedValue(new Error("Something went wrong"));

    await expect(login_post(req, res)).rejects.toThrow(
      new Error("Something went wrong")
    );
  });
});
