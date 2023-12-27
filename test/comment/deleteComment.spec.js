import { deleteComment } from "../../controllers/commentController";
import Comment from "../../models/Comment";

jest.mock("../../models/Comment");

describe("Delete Comment Controller", () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = { params: { _id: "commentId" } };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("should delete comment successfully", async () => {
    const fakeComment = {
      _id: "commentId",
      rate: 10,
      comment: "Great performance",
      reviewerId: "reviewerId",
      revieweeId: "revieweeId",
      history: [],
      commentMonth: new Date("2024-01-01T00:00:00.000Z"),
      isDeleted: true,
    };
    Comment.findByIdAndUpdate = jest.fn().mockReturnValue(fakeComment);

    await deleteComment(mockRequest, mockResponse);

    expect(Comment.findByIdAndUpdate).toHaveBeenCalledWith(
      "commentId",
      { isDeleted: true },
      { new: true }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Deleted Comment successfully" })
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ comment: fakeComment })
    );
  });
  it("should throw error if comment cannot be deleted", async () => {
    const errorMessage = "Comment have been deleted";
    Comment.findByIdAndUpdate.mockRejectedValue(new Error(errorMessage));

    await expect(deleteComment(mockRequest, mockResponse)).rejects.toThrow(
      errorMessage
    );
  });
});
