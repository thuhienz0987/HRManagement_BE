import { create_user } from "../../controllers/userController";
import User from "../../models/User";
import Position from "../../models/Position";
import NotFoundError from "../../errors/notFoundError";
import BadRequestError from "../../errors/badRequestError";
import InternalServerError from "../../errors/internalServerError";
import cloudinary from "../../helper/imageUpload";
import ValidationError from "../../errors/validationError"

jest.mock("../../models/User");
jest.mock("../../models/Position");

// Mock user data for the request body
const req = {
  body: {
    email: "testuser@example.com",
    name: "Test User Name",
    phoneNumber: "1234567890",
    address: "123 Test St, Test City",
    birthday: "01/01/1990",
    gender: "male",
    homeTown: "Test Hometown",
    ethnicGroup: "Test Ethnic Group",
    level: "university",
    teamId: "60bfdb7b573f41d51d7710ec", // Replace with actual teamId
    departmentId: "60bfdb7b573f41d51d7710ed", // Replace with actual departmentId
    positionId: "60bfdb7b573f41d51d7710ee", // Replace with actual positionId
  },
};

const saveFunction = async() => {
  try {
    const newUser = new User(req.body);
    newUser.code = '230080'
    newUser.roles = ['2001']
    await newUser.validate();
    return newUser;
  } catch (e) {
    throw e;
  } 
}


// Mock the cloudinary uploader
cloudinary.uploader.upload = jest.fn();

// Mock response object
const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn(),
};

// Mock the User model's countDocuments and save methods
User.countDocuments = jest.fn(() => 10);
// User.prototype.save = jest.fn();

// Mock the Position model's findOne method
Position.findOne = jest.fn(() => ({
  _id: "60bfdb7b573f41d51d7710ee",
  isDeleted: false,
  code: "CEO", // Replace with actual position code
}));

describe("Create User Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new user", async () => {
    // Call the create_user function
    User.prototype.save = jest.fn();
    await create_user(req, res);

    // Assert that the user is saved and response is sent with success message
    expect(User.countDocuments).toHaveBeenCalled();
    expect(User.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "New user created!",
    });
  });

  it("should handle NotFoundError when position is not found", async () => {
    // Mock the Position not found scenario
    Position.findOne = jest.fn().mockResolvedValue(undefined);

    // Call the postAllowance function and expect error to be thrown
    try {
      await create_user(req, res);
    } catch (error) {
      // Verify that BadRequestError is thrown
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe(
        "The position with position _id 60bfdb7b573f41d51d7710ee does not exist"
      );
    }
  });

  //////////////////////////////////////////////////////////////////////////////////
  it("should handle NotFoundError when email invalid", async () => {
    // Mock the Position not found scenario
    req.body.email = 'mck1608';
    Position.findOne = jest.fn(() => ({
      _id: "60bfdb7b573f41d51d7710ee",
      isDeleted: false,
      code: "CEO", // Replace with actual position code
    }));
    User.prototype.save = jest.fn(saveFunction)
    try {
      await create_user(req, res);
    } catch (error) {
      console.log({error})
      // Verify that BadRequestError is thrown
      // expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe(
        "User validation failed: email: Invalid email"
      );
    }
  });

  it("should handle NotFoundError when email require", async () => {
    // Mock the Position not found scenario
    req.body.email = undefined;

    // Call the postAllowance function and expect error to be thrown
    try {
      await create_user(req, res);
    } catch (error) {
      console.log({error})
      // Verify that BadRequestError is thrown
      expect(error.status).toBe(undefined);
      expect(error.message).toBe(
        "User validation failed: email: Email is required"
      );
    }
  });

  it("should handle NotFoundError when email exists", async () => {
    // Mock the Position not found scenario
    const existingUser = new User({...req.body,email: 'testuser@example.com'})

    User.findOne = jest.fn().mockResolvedValue(existingUser);
    // Call the postAllowance function and expect error to be thrown
    try {
      await create_user(req, res);
    } catch (error) {
      console.log({error})
      // Verify that BadRequestError is thrown
      expect(error.status).toBe(
       400
      );
      expect(error.messageObject).toBe(
        "User with email registered"
      );
    }
  });

  // it("should handle InternalServerError when unable to upload avatar image", async () => {
  //   // Mock throwing an error during image upload

  //   // req.file =cloudinary.uploader.upload.mockResolvedValue('./testImage/testImage.png')
  //   // cloudinary.uploader.upload.mockRejectedValue(
  //   //   new Error("Unable to upload avatar")
  //   // );

  //   try {
  //     // Call the create_user function
  //     await create_user(req, res);
  //   } catch (error) {
  //     // Assert that the InternalServerError is handled and correct response is sent
      
  //     expect(error).toBeInstanceOf(InternalServerError);
  //     expect(error.message).toBe(
  //       "Unable to upload avatar, please try again"
  //       );
  //   }
  // });

  // it("should handle errors when creating a new user", async () => {
  //   // Mock throwing a duplication error
  //   User.prototype.save.mockRejectedValue({ email: "testuser@example.com" });

  //   try {
  //     await create_user(req, res);
  //   } catch (error) {
  //     // Assert that the duplication error is handled and correct response is sent
  //     expect(User.prototype.save).toHaveBeenCalled();
  //     // expect(res.status).toHaveBeenCalledWith(400);
  //     expect(res.send).toHaveBeenCalledWith(
  //       "This email has already been registered"
  //     );
  //   }

  // });
});
