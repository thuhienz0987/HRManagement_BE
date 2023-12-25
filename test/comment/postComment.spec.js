import { postComment } from "../../controllers/commentController";
import Comment from "../../models/Comment";
import BadRequestError from "../../errors/badRequestError";

jest.mock("../models/Comment");

const mockRequest = (rate, comment, reviewerId, revieweeId, commentMonth) => ({
  body: {
    rate,
    comment,
    reviewerId,
    revieweeId,
    commentMonth,
  },
});

const mockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
};

describe("Post Comment Controller", () => {
  it("should create a new comment successfully", async () => {
    const req = mockRequest(
      5,
      "Great performance",
      "6513ea6db2f06af8724be2d9",
      "651fbe0c4f20aa3dade4c441",
      "01/01/2024"
    );
    const res = mockResponse();

    const existingComment = null;
    const saveMock = jest.fn().mockResolvedValue({
      rate: 5,
      comment: "Great performance",
      reviewerId: "6513ea6db2f06af8724be2d9",
      revieweeId: "651fbe0c4f20aa3dade4c441",
      commentMonth: new Date("2024-01-01T00:00:00.000Z"),
      isDeleted: false,
    });

    Comment.findOne.mockResolvedValue(existingComment);
    Comment.prototype.save = saveMock;

    await postComment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Create Comment successfully" })
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        comment: {
          rate: 5,
          comment: "Great performance",
          reviewerId: "6513ea6db2f06af8724be2d9",
          revieweeId: "651fbe0c4f20aa3dade4c441",
          commentMonth: new Date("2024-01-01T00:00:00.000Z"),
          isDeleted: false,
        },
      })
    );
  });

  it("should handle error when a comment already exists for the pair in the same month", async () => {
    const req = mockRequest(
      8,
      "Average performance",
      "reviewerId123",
      "revieweeId123",
      "01/10/2022"
    );
    const res = mockResponse();

    const existingComment = jest.fn().mockResolvedValue({
      rate: 9,
      comment: "Good performance",
      reviewerId: "reviewerId123",
      revieweeId: "revieweeId123",
      commentMonth: new Date("2022-10-15T00:00:00.000Z"),
    });
    Comment.findOne = existingComment;

    await expect(postComment(req, res)).rejects.toThrow(BadRequestError);
  });

  it("should handle other errors by throwing them", async () => {
    const req = mockRequest(
      3,
      "Needs improvement",
      "reviewerId456",
      "revieweeId789",
      "01/11/2022"
    );
    const res = mockResponse();

    const errorMessage = "Something went wrong";
    Comment.findOne.mockRejectedValue(new Error(errorMessage));

    await expect(postComment(req, res)).rejects.toThrow(errorMessage);
  });
});
