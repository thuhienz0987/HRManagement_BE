import { postLeaveRequest } from "../../controllers/leaveRequestController";
import LeaveRequest from "../../models/LeaveRequest";
import User from "../../models/User";
import BadRequestError from "../../errors/badRequestError";

jest.mock("../../models/LeaveRequest");
jest.mock("../../models/User");

const mockRequest = (reason, userId, startDate, endDate) => ({
  body: { reason, userId, startDate, endDate },
});

const mockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
};

describe("Post Leave Request Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it("should create a new leave request successfully", async () => {
    const req = mockRequest("Vacation", "user123", "2023-12-26", "2023-12-28");
    const res = mockResponse();

    const saveMock = jest.fn().mockResolvedValue({
      reason: "Vacation",
      userId: "user123",
      status: "pending",
      isDeleted: false,
      paidLeaveDays: 3,
      approverId: "approver123",
      startDate: "2023-12-26T00:00:00.000Z",
      endDate: "2023-12-28T00:00:00.000Z",
      history: [
        {
          reason: "Vacation",
          status: "pending",
          userId: "user123",
          startDate: "2023-12-26T00:00:00.000Z",
          endDate: "2023-12-28T00:00:00.000Z",
          updatedAt: "2023-12-25T16:52:00.000Z",
          approverId: "approver123",
        },
      ],
    });

    User.findOne.mockResolvedValue({ _id: "approver123" });
    LeaveRequest.find.mockResolvedValue([]);

    LeaveRequest.prototype.save = saveMock;

    await postLeaveRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Create Leave Request successfully" })
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        leaveRequest: {
          reason: "Vacation",
          userId: "user123",
          status: "pending",
          isDeleted: false,
          paidLeaveDays: 3,
          approverId: "approver123",
          startDate: "2023-12-26T00:00:00.000Z",
          endDate: "2023-12-28T00:00:00.000Z",
          history: [
            {
              reason: "Vacation",
              status: "pending",
              userId: "user123",
              startDate: "2023-12-26T00:00:00.000Z",
              endDate: "2023-12-28T00:00:00.000Z",
              updatedAt: "2023-12-25T16:52:00.000Z",
              approverId: "approver123",
            },
          ],
        },
      })
    );
  });

  it("should handle start date earlier than the current date", async () => {
    const req = mockRequest("Meeting", "user123", "2023-12-23", "2023-12-27");
    const res = mockResponse();

    await expect(postLeaveRequest(req, res)).rejects.toThrow(BadRequestError);
    // expect(BadRequestError).toHaveBeenCalledWith(
    //   expect.objectContaining({
    //     message: "The start date must be later than the current date.",
    //   })
    // );
  });

  it("should handle invalid start date", async () => {
    const req = mockRequest(
      "Sick leave",
      "user456",
      "2023-12-28",
      "2023-12-27"
    );
    const res = mockResponse();

    await expect(postLeaveRequest(req, res)).rejects.toThrow(BadRequestError);
    // expect(BadRequestError).toHaveBeenCalledWith(
    //   expect.objectContaining({
    //     message: "The start date must be earlier than the end date.",
    //   })
    // );
  });

  it("should handle overlapping leave requests", async () => {
    const req = mockRequest(
      "Conference",
      "user789",
      "2023-12-27",
      "2023-12-31"
    );
    const res = mockResponse();

    LeaveRequest.find.mockResolvedValue([
      {
        userId: "user789",
        startDate: "2023-12-28T00:00:00.000Z",
        endDate: "2024-01-01T00:00:00.000Z",
      },
    ]);

    await expect(postLeaveRequest(req, res)).rejects.toThrow(BadRequestError);
    // expect(BadRequestError).toHaveBeenCalledWith(
    //   expect.objectContaining({
    //     message:
    //       "The user already has overlapping leave requests for the specified time.",
    //   })
    // );
  });

  it("should handle other errors by throwing them", async () => {
    const req = mockRequest("Vacation", "user123", "2023-12-26", "2023-12-27");
    const res = mockResponse();

    const errorMessage = "Something went wrong";
    LeaveRequest.find.mockRejectedValue(new Error(errorMessage));
    await expect(postLeaveRequest(req, res)).rejects.toThrowError(errorMessage);
  });
});
