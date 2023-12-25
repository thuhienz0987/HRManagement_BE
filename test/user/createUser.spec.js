import { create_user } from "../../controllers/userController";
import User from "../../models/User";
import Position from "../../models/Position";
import NotFoundError from "../../errors/notFoundError";
import BadRequestError from "../../errors/badRequestError";
import InternalServerError from "../../errors/internalServerError";
import cloudinary from "../../helper/imageUpload";

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
  file: { path: "/path/to/test/file" },
};

// Mock response object
const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  send: jest.fn(),
};

// Mock the cloudinary uploader
cloudinary.uploader.upload = jest.fn();

// Mock the User model's countDocuments and save methods
User.countDocuments = jest.fn(() => 10);
User.prototype.save = jest.fn();

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
    // Mock the result of cloudinary uploader
    const result = { url: "https://testurl.com/testimage.png" };
    cloudinary.uploader.upload.mockResolvedValue(result);

    // Call the create_user function
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

  it("should handle errors when creating a new user", async () => {
    // Mock throwing a duplication error
    User.prototype.save.mockRejectedValue({ email: "testuser@example.com" });

    // Call the create_user function
    await create_user(req, res);

    // Assert that the duplication error is handled and correct response is sent
    expect(User.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      "This email has already been registered"
    );
  });

  it("should handle NotFoundError when position is not found", async () => {
    // Mock the Position not found scenario
    Position.findOne.mockReturnValue(null);

    // Call the create_user function
    await create_user(req, res);

    // Assert that the NotFoundError is handled and correct response is sent
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(
      "The position with position _id 60bfdb7b573f41d51d7710ee does not exist"
    );
  });

  it("should handle InternalServerError when unable to upload avatar image", async () => {
    // Mock throwing an error during image upload
    cloudinary.uploader.upload.mockRejectedValue(
      new Error("Unable to upload avatar")
    );

    // Call the create_user function
    await create_user(req, res);

    // Assert that the InternalServerError is handled and correct response is sent
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      "Unable to upload avatar, please try again"
    );
  });
});
