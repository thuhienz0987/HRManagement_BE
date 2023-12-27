import mongoose from "mongoose";
import { update_salary_grade } from "../../controllers/userController";
import User from "../../models/User";
import NotFoundError from "../../errors/notFoundError";
import ROLES_LIST from "../../config/roles_list";

jest.mock("../../models/User");

const mockRequest = (userId, salaryGrade) => ({
  params: { userId },
  body: { salaryGrade },
});

const mockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

describe("Update salary grade controller", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it("should update the salary grade successfully", async () => {
    const req = mockRequest("userId", 1.5);
    const res = mockResponse();

    const mockedUser = {
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
      teamId: {
        _id: "65733f0d0546751e7dfeebc1",
        code: "ITD_HAR",
        name: "Hardware Team",
        managerId: "656f40567d961f88773c4416",
        departmentId: "65684e5930d1e81f36e6be47",
        isDeleted: false,
      },
      departmentId: {
        _id: "65684e5930d1e81f36e6be47",
        code: "ITD",
        name: "IT Department",
        managerId: "65733cab007e4c890aff20ee",
        isDeleted: false,
      },
      positionId: {
        _id: "6528dcc793566d823f7213c2",
        code: "EMP",
        name: "Employee",
        basicSalary: 15000000,
        isDeleted: false,
      },
    };
    const saveMock = jest.fn().mockResolvedValue({
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
      salaryGrade: 1.5,
      isEmployee: true,
      roles: [ROLES_LIST.Employee],
      avatarImage:
        "https://res.cloudinary.com/dux8aqzzz/image/upload/v1685547037/xd0gen7b4z5wgwuqfvpz.png",
      teamId: {
        _id: "65733f0d0546751e7dfeebc1",
        code: "ITD_HAR",
        name: "Hardware Team",
        managerId: "656f40567d961f88773c4416",
        departmentId: "65684e5930d1e81f36e6be47",
        isDeleted: false,
      },
      departmentId: {
        _id: "65684e5930d1e81f36e6be47",
        code: "ITD",
        name: "IT Department",
        managerId: "65733cab007e4c890aff20ee",
        isDeleted: false,
      },
      positionId: {
        _id: "6528dcc793566d823f7213c2",
        code: "EMP",
        name: "Employee",
        basicSalary: 15000000,
        isDeleted: false,
      },
    });
    mockedUser.save = saveMock;

    User.findById = jest.fn().mockResolvedValue(mockedUser);

    await update_salary_grade(req, res);

    expect(User.findById).toHaveBeenCalledWith({ _id: "userId" });
    expect(mockedUser.salaryGrade).toBe(1.5);
    expect(mockedUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      Status: "Success",
      message: "Update salary grade successfully",
      user: {
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
        salaryGrade: 1.5,
        isEmployee: true,
        roles: [ROLES_LIST.Employee],
        avatarImage:
          "https://res.cloudinary.com/dux8aqzzz/image/upload/v1685547037/xd0gen7b4z5wgwuqfvpz.png",
        teamId: {
          _id: "65733f0d0546751e7dfeebc1",
          code: "ITD_HAR",
          name: "Hardware Team",
          managerId: "656f40567d961f88773c4416",
          departmentId: "65684e5930d1e81f36e6be47",
          isDeleted: false,
        },
        departmentId: {
          _id: "65684e5930d1e81f36e6be47",
          code: "ITD",
          name: "IT Department",
          managerId: "65733cab007e4c890aff20ee",
          isDeleted: false,
        },
        positionId: {
          _id: "6528dcc793566d823f7213c2",
          code: "EMP",
          name: "Employee",
          basicSalary: 15000000,
          isDeleted: false,
        },
      },
    });
  });

  it("should handle user not found error", async () => {
    const req = mockRequest("userId", 1.5);
    const res = mockResponse();

    User.findById.mockResolvedValue(null);

    await expect(update_salary_grade(req, res)).rejects.toThrow(NotFoundError);

    expect(User.findById).toHaveBeenCalledWith({ _id: "userId" });
  });

  it("should handle error and re-throw", async () => {
    const req = mockRequest("userId", 1.5);
    const res = mockResponse();

    const errorMessage = "Something went wrong";
    User.findById.mockRejectedValue(new Error(errorMessage));

    await expect(update_salary_grade(req, res)).rejects.toThrowError(
      errorMessage
    );
  });
});
