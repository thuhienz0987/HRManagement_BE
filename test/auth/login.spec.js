import jwt from "jsonwebtoken";
import login_post from "../../controllers/authController";
import User from "../../models/User";
import BadRequestError from "../../errors/badRequestError";
import passwordValidator from "password-validator";

jest.mock("../models/User");

describe("Login Post Controller", () => {
  let fakeAccessToken;
  let fakeRefreshToken;
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {
      body: { email: "test@example.com", password: "TestPass123" },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    fakeAccessToken = "fake_access_token";
    fakeRefreshToken = "fake_refresh_token";
  });

  it("should login user successfully and return tokens and user info", async () => {
    const fakeUser = {
      _id: "123abc",
      roles: ["Employee"],
      save: jest.fn().mockResolvedValue({}),
    };
    User.login = jest.fn().mockResolvedValue(fakeUser);

    jwt.sign
      .mockReturnValueOnce(fakeAccessToken)
      .mockReturnValueOnce(fakeRefreshToken);

    const expectedUser = { ...fakeUser };
    delete expectedUser.password;

    await login_post(mockRequest, mockResponse, mockNext);

    expect(User.login).toHaveBeenCalledWith("test@example.com", "TestPass123");
    expect(jwt.sign).toHaveBeenNthCalledWith(
      1,
      { userInfo: { userId: "123abc", roles: ["Employee"] } },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 3600 }
    );
    expect(jwt.sign).toHaveBeenNthCalledWith(
      2,
      { userId: "123abc" },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: 15552000 }
    );
    expect(fakeUser.refreshToken).toBe(fakeRefreshToken);
    expect(fakeUser.save).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      accessToken: fakeAccessToken,
      user: expectedUser,
    });
  });

  it("should handle validation error and throw BadRequestError", async () => {
    const validationError = [{ error: "Some error message" }];

    passwordValidator.prototype.validate = jest
      .fn()
      .mockReturnValue(validationError);

    await expect(
      login_post(mockRequest, mockResponse, mockNext)
    ).rejects.toThrow(BadRequestError);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      messageObject: validationError,
    });
  });

  it("should handle other errors and propagate them to the error handling middleware", async () => {
    User.login = jest.fn().mockRejectedValue(new Error("Some error message"));

    await login_post(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(new Error("Some error message"));
  });
});
