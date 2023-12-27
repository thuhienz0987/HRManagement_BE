import { get_user_by_id } from "../../controllers/userController";
import User from "../../models/User";
import NotFoundError from "../../errors/notFoundError";
import ROLES_LIST from "../../config/roles_list";

jest.mock("../../models/User");

describe("Get User By Id Controller", () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = { params: { _id: "userId" } };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("should get user by id successfully and return user info", async () => {
    const fakeUser = {
      _id: "userId",
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
      password: undefined,
    };
    User.findById = jest.fn().mockReturnValue(fakeUser);

    await get_user_by_id(mockRequest, mockResponse);

    expect(User.findById).toHaveBeenCalledWith("userId");
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      _id: "userId",
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
      password: undefined,
    });
  });

  it("should handle user not found and throw NotFoundError", async () => {
    mockRequest.params._id = "userId1";
    User.findById = jest.fn().mockResolvedValue(null);

    await expect(get_user_by_id(mockRequest, mockResponse)).rejects.toThrow(
      NotFoundError
    );
    // expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it("should handle other errors and propagate them to the error handling middleware", async () => {
    const errorMessage = "Something went wrong";
    User.findById.mockRejectedValue(new Error(errorMessage));

    await expect(get_user_by_id(mockRequest, mockResponse)).rejects.toThrow(
      errorMessage
    );
  });
});
