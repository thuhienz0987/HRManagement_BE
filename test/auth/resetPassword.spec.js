import { reset_password } from "../../controllers/authController";
import User from "../../models/User";
import ResetToken from "../../models/ResetToken";
import BadRequestError from "../../errors/badRequestError";
import NotFoundError from "../../errors/notFoundError";
import ROLES_LIST from "../../config/roles_list";
import passwordValidator from "password-validator";

jest.mock("../../models/User");
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

describe("reset password controller", () => {
  const user = {
    _id: "123abc",
    code: "230001",
    email: "testuser@example.com",
    name: "Test User Name",
    phoneNumber: "1234567890",
    address: "123 Test St, Test City",
    birthday: "01/01/1990",
    gender: "male",
    homeTown: "Test Hometown",
    ethnicGroup: "Test Ethnic Group",
    level: "university",
    salaryGrade: 1.0,
    isEmployee: true,
    roles: [ROLES_LIST.Employee],
    avatarImage:
      "https://res.cloudinary.com/dux8aqzzz/image/upload/v1685547037/xd0gen7b4z5wgwuqfvpz.png",
    teamId: "teamId",
    departmentId: "departmentId",
    positionId: "positionId",
    password: "Sontung01062003",
  };
  const token = {
    owner: "user123",
    token: "1234",
    createAt: new Date(),
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
  it("should throw a BadRequestError when password and otp is undefined", async () => {
    // Arrange
    const req = {
      body: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Act and assert
    await expect(reset_password(req, res)).rejects.toThrow(BadRequestError);
  });
  it("should throw a NotFoundError when user is not found", async () => {
    // Arrange
    const req = {
      params: {
        id: "userId",
      },
      body: {
        password: "Sontung01062003",
        otp: "2354",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(), // Mock the status method
      json: jest.fn().mockReturnThis(), // Mock the json method
    };
    passwordSchema.validate = jest.fn().mockResolvedValue([]);
    User.findById.mockResolvedValue(null);

    // Act and assert
    await expect(reset_password(req, res)).rejects.toThrow(NotFoundError);
  });
  it("should throw a NotFoundError when token is not found", async () => {
    // Arrange
    const req = {
      params: {
        id: "userId",
      },
      body: {
        password: "Sontung01062003",
        otp: "2354",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(), // Mock the status method
      json: jest.fn().mockReturnThis(), // Mock the json method
    };
    passwordSchema.validate = jest.fn().mockResolvedValue([]);
    ResetToken.findOne = jest.fn().mockResolvedValue(null);

    // Act and assert
    await expect(reset_password(req, res)).rejects.toThrow(NotFoundError);
  });
  it("should throw a NotFoundError when OTP is wrong", async () => {
    // Arrange
    const req = {
      params: {
        id: "userId",
      },
      body: {
        password: "Sontung01062003",
        otp: "2354",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(), // Mock the status method
      json: jest.fn().mockReturnThis(), // Mock the json method
    };
    passwordSchema.validate = jest.fn().mockResolvedValue([]);
    User.findById = jest.fn().mockResolvedValue(user);
    ResetToken.findOne = jest.fn().mockResolvedValue(token);
    token.compareToken = jest.fn().mockResolvedValue(false);

    // Act and assert
    await expect(reset_password(req, res)).rejects.toThrow(BadRequestError);
  });
  it("should throw a BadRequestError when new password and old password are same ", async () => {
    // Arrange
    const req = {
      params: {
        id: "userId",
      },
      body: {
        password: "Sontung01062003",
        otp: "2354",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(), // Mock the status method
      json: jest.fn().mockReturnThis(), // Mock the json method
    };
    passwordSchema.validate = jest.fn().mockResolvedValue([]);
    User.findById = jest.fn().mockResolvedValue(user);
    ResetToken.findOne = jest.fn().mockResolvedValue(token);
    token.compareToken = jest.fn().mockResolvedValue(true);
    user.comparePassword = jest.fn().mockResolvedValue(true);

    await expect(reset_password(req, res)).rejects.toThrow(BadRequestError);
  });

  it("should handle password have a minimum length of 8 characters", async () => {
    const req = {
      params: {
        id: "userId",
      },
      body: {
        password: "Sontu01",
        otp: "2354",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(), // Mock the status method
      json: jest.fn().mockReturnThis(), // Mock the json method
    };
    const validateResult = [
      {
        validation: "min",
        arguments: 8,
        message: "The string should have a minimum length of 8 characters",
      },
    ];
    User.findById = jest.fn().mockResolvedValue(user);
    ResetToken.findOne = jest.fn().mockResolvedValue(token);
    token.compareToken = jest.fn().mockResolvedValue(true);
    user.comparePassword = jest.fn().mockResolvedValue(false);
    passwordSchema.validate = jest.fn().mockResolvedValue(validateResult);

    try {
      await reset_password(req, res);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toEqual(validateResult[0].message);
    }
  });

  // it("should handle password have a maximum length of 16 characters", async () => {
  //   const req = mockRequest(
  //     "sontung01062003@gmail.com",
  //     "Sontung0106200323932832"
  //   );
  //   const res = mockResponse();
  //   const validateResult = [
  //     {
  //       validation: "max",
  //       arguments: 16,
  //       message: "The string should have a maximum length of 16 characters",
  //     },
  //   ];
  //   passwordSchema.validate = jest.fn().mockResolvedValue(validateResult);

  //   try {
  //     await login_post(req, res);
  //   } catch (error) {
  //     expect(error).toBeInstanceOf(BadRequestError);
  //     expect(error.message).toEqual(validateResult[0].message);
  //   }
  // });
  // it("should handle password have a minimum of 1 lowercase letter", async () => {
  //   const req = mockRequest("sontung01062003@gmail.com", "SONTUNG01062003");
  //   const res = mockResponse();
  //   const validateResult = [
  //     {
  //       validation: "lowercase",
  //       message: "The string should have a minimum of 1 lowercase letter",
  //     },
  //   ];
  //   passwordSchema.validate = jest.fn().mockResolvedValue(validateResult);

  //   try {
  //     await login_post(req, res);
  //   } catch (error) {
  //     expect(error).toBeInstanceOf(BadRequestError);
  //     expect(error.message).toEqual(validateResult[0].message);
  //   }
  // });
  // it("should handle password have a minimum of 1 uppercase letter", async () => {
  //   const req = mockRequest("sontung01062003@gmail.com", "sontung01062003");
  //   const res = mockResponse();
  //   const validateResult = [
  //     {
  //       validation: "uppercase",
  //       message: "The string should have a minimum of 1 uppercase letter",
  //     },
  //   ];
  //   passwordSchema.validate = jest.fn().mockResolvedValue(validateResult);

  //   try {
  //     await login_post(req, res);
  //   } catch (error) {
  //     expect(error).toBeInstanceOf(BadRequestError);
  //     expect(error.message).toEqual(validateResult[0].message);
  //   }
  // });

  // it("password should not have spaces", async () => {
  //   const req = mockRequest("sontung01062003@gmail.com", "Sontung 01062003");
  //   const res = mockResponse();
  //   const validateResult = [
  //     {
  //       validation: "spaces",
  //       inverted: true,
  //       message: "The string should not have spaces",
  //     },
  //   ];
  //   passwordSchema.validate = jest.fn().mockResolvedValue(validateResult);

  //   try {
  //     await login_post(req, res);
  //   } catch (error) {
  //     expect(error).toBeInstanceOf(BadRequestError);
  //     expect(error.message).toEqual(validateResult[0].message);
  //   }
  // });

  // it("should successfully generate and send a reset token", async () => {
  //   // Arrange
  //   const req = {
  //     body: {
  //       email: "existinguser@example.com",
  //     },
  //   };
  //   const res = {
  //     status: jest.fn().mockReturnThis(), // Mock the status method
  //     json: jest.fn(), // Mock the json method
  //   };

  //   const existingUser = {
  //     _id: "user123",
  //     email: "existinguser@example.com",
  //   };
  //   User.findOne = jest.fn().mockResolvedValue(existingUser);

  //   ResetToken.findOne = jest.fn().mockResolvedValue(null);
  //   ResetToken.prototype.save = jest.fn().mockResolvedValue({
  //     owner: "user123",
  //     token: "1234",
  //     createAt: new Date(), // Token created within the hour
  //   });

  //   // Act and assert
  //   await forget_password(req, res);
  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalledWith(
  //     expect.objectContaining({ owner: "user123" })
  //   );
  // });
});
