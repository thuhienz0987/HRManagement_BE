import { updateComment } from "../../controllers/commentController";
import Comment from "../../models/Comment";
import NotFoundError from "../../errors/notFoundError";

jest.mock("../../models/Comment");

describe("Update Comment Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { _id: "commentId" },
      body: {
        rate: 8,
        comment: "Great performance",
        commentMonth: "01/01/2024",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("should update comment successfully", async () => {
    const mockedComment = {
      _id: "commentId",
      rate: 10,
      comment: "Great performance",
      reviewerId: "reviewerId",
      revieweeId: "revieweeId",
      history: [],
      commentMonth: new Date("2024-01-01T00:00:00.000Z"),
      isDeleted: false,
    };
    const saveMock = jest.fn().mockResolvedValue({
      _id: "commentId",
      rate: 8,
      comment: "Great performance",
      reviewerId: "reviewerId",
      revieweeId: "revieweeId",
      commentMonth: new Date("2024-01-01T00:00:00.000Z"),
      isDeleted: false,
      history: [
        {
          updatedAt: "2023-12-26T15:46:31.993Z",
          rate: 8,
          comment: "Great performance",
          commentMonth: new Date("2024-01-01T00:00:00.000Z"),
        },
      ],
    });
    mockedComment.save = saveMock;
    // Mocking findById method to return mockedComment
    Comment.findById = jest.fn().mockResolvedValue(mockedComment);

    await updateComment(req, res);

    expect(Comment.findById).toHaveBeenCalledWith("commentId");
    expect(saveMock).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      _id: "commentId",
      rate: 8,
      comment: "Great performance",
      reviewerId: "reviewerId",
      revieweeId: "revieweeId",
      commentMonth: new Date("2024-01-01T00:00:00.000Z"),
      isDeleted: false,
      history: [
        {
          updatedAt: "2023-12-26T15:46:31.993Z",
          rate: 8,
          comment: "Great performance",
          commentMonth: new Date("2024-01-01T00:00:00.000Z"),
        },
      ],
    });
  });

  it("should handle not found comment", async () => {
    // Mocking findById method to return null for not found attendance
    Comment.findById = jest.fn().mockResolvedValue(null);

    await expect(updateComment(req, res)).rejects.toThrow(NotFoundError);
    expect(Comment.findById).toHaveBeenCalledWith("commentId");
  });

  it("should handle other errors", async () => {
    const errorMessage = "Something went wrong";
    Comment.findById = jest.fn().mockRejectedValue(new Error(errorMessage));

    await expect(updateComment(req, res)).rejects.toThrow(errorMessage);
    expect(Comment.findById).toHaveBeenCalledWith("commentId");
  });
});
