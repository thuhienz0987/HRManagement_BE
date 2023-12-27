import { getCommentsByRevieweeId } from "../../controllers/commentController";
import Comment from "../../models/Comment";
import User from "../../models/User";
import NotFoundError from "../../errors/notFoundError";

jest.mock("../../models/Comment");
jest.mock("../../models/User");

describe("Get Comments By RevieweeId Controller", () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = { params: { revieweeId: "revieweeId" } };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("should get comments by revieweeId successfully and return comments", async () => {
    const fakeComments = [
      {
        _id: "commentId1",
        reviewerId: "reviewerId",
        revieweeId: "revieweeId",
        rate: 9,
        comment: "Good good",
        isDeleted: false,
        commentMonth: "2023-12-01T00:00:00.000Z",
        history: [
          {
            rate: 9,
            comment: "Good good",
            commentMonth: "2023-12-01T00:00:00.000Z",
            _id: "updateId",
            updatedAt: "2023-12-13T03:13:18.582Z",
          },
        ],
        createdAt: "2023-12-13T03:13:18.581Z",
        updatedAt: "2023-12-13T03:13:18.581Z",
      },
      {
        _id: "commentId2",
        reviewerId: "reviewerId",
        revieweeId: "revieweeId",
        rate: 9,
        comment: "Good",
        isDeleted: false,
        commentMonth: "2023-11-01T00:00:00.000Z",
        history: [
          {
            rate: 10,
            comment: "Good good",
            commentMonth: "2023-11-01T00:00:00.000Z",
            _id: "updateId1",
            updatedAt: "2023-12-13T03:16:07.345Z",
          },
          {
            rate: 9,
            comment: "Good",
            commentMonth: "2023-11-01T00:00:00.000Z",
            _id: "updateId2",
            updatedAt: "2023-12-13T03:17:17.357Z",
          },
        ],
        createdAt: "2023-12-13T03:16:07.344Z",
        updatedAt: "2023-12-13T03:17:17.357Z",
      },
    ];
    const fakeReviewee = {
      _id: "revieweeId",
      email: "phuoctriqh01062003@gmail.com",
      name: "Trương Nguyễn Phước Trí",
      phoneNumber: "0333883127",
      birthday: "2003-01-06T00:00:00.000Z",
      address: "Hue",
      gender: "male",
      homeTown: "England",
      ethnicGroup: "Kinh",
      level: "master",
      isEmployee: true,
      avatarImage:
        "https://res.cloudinary.com/dux8aqzzz/image/upload/v1685547037/xd0gen7b4z5wgwuqfvpz.png",
      teamId: "6527a6f1281c4dd64db6dae4",
      roles: ["Leader"],
      positionId: "positionId",
      code: "230004",
      departmentId: "departmentId",
      salaryGrade: 1.4,
    };
    User.findById = jest.fn().mockReturnValue(fakeReviewee);
    Comment.find = jest.fn().mockReturnValue(fakeComments);

    await getCommentsByRevieweeId(mockRequest, mockResponse);

    expect(User.findById).toHaveBeenCalledWith({
      _id: "revieweeId",
    });
    expect(Comment.find).toHaveBeenCalledWith({
      isDeleted: false,
      revieweeId: "revieweeId",
    });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith([
      {
        _id: "commentId1",
        reviewerId: "reviewerId",
        revieweeId: "revieweeId",
        rate: 9,
        comment: "Good good",
        isDeleted: false,
        commentMonth: "2023-12-01T00:00:00.000Z",
        history: [
          {
            rate: 9,
            comment: "Good good",
            commentMonth: "2023-12-01T00:00:00.000Z",
            _id: "updateId",
            updatedAt: "2023-12-13T03:13:18.582Z",
          },
        ],
        createdAt: "2023-12-13T03:13:18.581Z",
        updatedAt: "2023-12-13T03:13:18.581Z",
      },
      {
        _id: "commentId2",
        reviewerId: "reviewerId",
        revieweeId: "revieweeId",
        rate: 9,
        comment: "Good",
        isDeleted: false,
        commentMonth: "2023-11-01T00:00:00.000Z",
        history: [
          {
            rate: 10,
            comment: "Good good",
            commentMonth: "2023-11-01T00:00:00.000Z",
            _id: "updateId1",
            updatedAt: "2023-12-13T03:16:07.345Z",
          },
          {
            rate: 9,
            comment: "Good",
            commentMonth: "2023-11-01T00:00:00.000Z",
            _id: "updateId2",
            updatedAt: "2023-12-13T03:17:17.357Z",
          },
        ],
        createdAt: "2023-12-13T03:16:07.344Z",
        updatedAt: "2023-12-13T03:17:17.357Z",
      },
    ]);
  });
  it("should handle reviewee not found and throw NotFoundError", async () => {
    User.findById = jest.fn().mockResolvedValue(null);

    await expect(
      getCommentsByRevieweeId(mockRequest, mockResponse)
    ).rejects.toThrow(NotFoundError);
    // expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
  });
  it("should handle reviewee is deleted", async () => {
    User.findById = jest.fn().mockResolvedValue({
      _id: "revieweeId",
      email: "phuoctriqh01062003@gmail.com",
      name: "Trương Nguyễn Phước Trí",
      phoneNumber: "0333883127",
      birthday: "2003-01-06T00:00:00.000Z",
      address: "Hue",
      gender: "male",
      homeTown: "England",
      ethnicGroup: "Kinh",
      level: "master",
      isEmployee: false,
      avatarImage:
        "https://res.cloudinary.com/dux8aqzzz/image/upload/v1685547037/xd0gen7b4z5wgwuqfvpz.png",
      teamId: "6527a6f1281c4dd64db6dae4",
      roles: ["Leader"],
      positionId: "positionId",
      code: "230004",
      departmentId: "departmentId",
      salaryGrade: 1.4,
    });
    await getCommentsByRevieweeId(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(410);
  });
  it("should handle comments by reviewee id not found and throw NotFoundError", async () => {
    Comment.find = jest.fn().mockResolvedValue([]);

    try {
      await getCommentsByRevieweeId(mockRequest, mockResponse);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe("Not found comments for reviewee id");
    }
  });

  it("should handle other errors and propagate them to the error handling middleware", async () => {
    const errorMessage = "Something went wrong";
    Comment.find.mockRejectedValue(new Error(errorMessage));

    try {
      await getCommentsByRevieweeId(mockRequest, mockResponse);
    } catch (error) {
      expect(error.message).toBe(errorMessage);
    }
  });
});
