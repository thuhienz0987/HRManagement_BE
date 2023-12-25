import { postLeaveRequest } from "../../controllers/leaveRequestController";
import LeaveRequest from "../../models/LeaveRequest";
import User from "../../models/User";
import BadRequestError from "../../errors/badRequestError";

jest.mock("../models/LeaveRequest");
jest.mock("../models/User");

const mockRequest = (reason, userId, startDate, endDate) => ({
  body: { reason, userId, startDate, endDate },
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Post Leave Request Controller", () => {
  it("should create a new leave request successfully", async () => {
    const req = mockRequest("Vacation", "user123", "15/08/2023", "20/08/2023");
    const res = mockResponse();

    const saveMock = jest.fn().mockResolvedValue({
      reason: "Vacation",
      userId: "user123",
      status: "pending",
      isDeleted: false,
      paidLeaveDays: 6,
      approverId: "approver123",
      startDate: new Date("2023-08-15T00:00:00.000Z"),
      endDate: new Date("2023-08-20T00:00:00.000Z"),
    });
    const overlappingRequests = [];

    User.findOne.mockResolvedValue({ _id: "approver123" });
    LeaveRequest.find.mockResolvedValue(overlappingRequests);
    LeaveRequest.prototype.save = saveMock;

    await postLeaveRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
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
          paidLeaveDays: 6,
          approverId: "approver123",
          startDate: new Date("2023-08-15T00:00:00.000Z"),
          endDate: new Date("2023-08-20T00:00:00.000Z"),
        },
      })
    );
  });

  it("should handle invalid start date", async () => {
    const req = mockRequest(
      "Sick leave",
      "user456",
      "2022-01-05",
      "2022-01-03"
    );
    const res = mockResponse();

    await expect(postLeaveRequest(req, res)).rejects.toThrow(BadRequestError);
    // expect(BadRequestError).toHaveBeenCalledWith(
    //   "The start date must be earlier than the end date."
    // );
  });

  it("should handle overlapping leave requests", async () => {
    const req = mockRequest(
      "Conference",
      "user789",
      "2022-10-10",
      "2022-10-15"
    );
    const res = mockResponse();

    LeaveRequest.find.mockResolvedValue([
      {
        userId: "user789",
        startDate: "2022-10-12",
        endDate: "2022-10-18",
      },
    ]);
    await expect(postLeaveRequest(req, res)).rejects.toThrow(BadRequestError);
    // expect(BadRequestError).toHaveBeenCalledWith(
    //   "The user already has overlapping leave requests for the specified time."
    // );
  });

  it("should handle other errors by throwing them", async () => {
    const req = mockRequest("Vacation", "user123", "2023-08-15", "2023-08-20");
    const res = mockResponse();

    const errorMessage = "Something went wrong";
    LeaveRequest.find.mockRejectedValue(new Error(errorMessage));
    await expect(postLeaveRequest(req, res)).rejects.toThrowError(errorMessage);
  });
});
