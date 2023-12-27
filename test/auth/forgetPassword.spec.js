import { forget_password } from "../../controllers/authController";
import User from "../../models/User";
import ResetToken from "../../models/ResetToken";
import ForbiddenError from "../../errors/forbiddenError";
import NotFoundError from "../../errors/notFoundError";

jest.mock("../../models/User");

describe("forget_password controller", () => {
  it("should throw a NotFoundError when user is not found", async () => {
    // Arrange
    const req = {
      body: {
        email: "nonexistentuser@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(), // Mock the status method
      json: jest.fn(), // Mock the json method
    };

    User.findOne.mockResolvedValue(null);

    // Act and assert
    await expect(forget_password(req, res)).rejects.toThrow(NotFoundError);
  });

  it("should throw a ForbiddenError when token is requested within an hour", async () => {
    // Arrange
    const req = {
      body: {
        email: "existinguser@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(), // Mock the status method
      json: jest.fn(), // Mock the json method
    };

    const existingUser = {
      _id: "user123",
      email: "existinguser@example.com",
    };
    User.findOne = jest.fn().mockResolvedValue(existingUser);

    ResetToken.findOne = jest.fn().mockResolvedValue({
      owner: "user123",
      token: "1234",
      createAt: new Date(), // Token created within the hour
    });

    // Act and assert
    await expect(forget_password(req, res)).rejects.toThrow(ForbiddenError);
  });

  it("should successfully generate and send a reset token", async () => {
    // Arrange
    const req = {
      body: {
        email: "existinguser@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(), // Mock the status method
      json: jest.fn(), // Mock the json method
    };

    const existingUser = {
      _id: "user123",
      email: "existinguser@example.com",
    };
    User.findOne = jest.fn().mockResolvedValue(existingUser);

    ResetToken.findOne = jest.fn().mockResolvedValue(null);
    ResetToken.prototype.save = jest.fn().mockResolvedValue({
      owner: "user123",
      token: "1234",
      createAt: new Date(), // Token created within the hour
    });

    // Act and assert
    await forget_password(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ owner: "user123" })
    );
  });
});
