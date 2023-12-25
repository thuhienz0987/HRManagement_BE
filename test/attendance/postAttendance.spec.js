import { postAttendance } from "../../controllers/attendanceController";
import Attendance from "../../models/Attendance";
import BadRequestError from "../../errors/badRequestError";

jest.mock("../models/Attendance");

const mockRequest = (userId) => ({
  body: { userId },
});

const mockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
};

describe("Post Attendance Controller", () => {
  it("should create a new attendance successfully if none exists for the user on the current day", async () => {
    const req = mockRequest("65733cab007e4c890aff20ee");
    const res = mockResponse();

    const existingAttendance = null;
    const saveMock = jest.fn().mockResolvedValue({
      userId: "65733cab007e4c890aff20ee",
      attendanceDate: "2023-12-24T17:00:00.000Z",
      checkInTime: "2023-12-24T17:55:35.628Z",
      overTime: 0,
      isDeleted: false,
    });
    Attendance.prototype.save = saveMock;

    Attendance.findOne.mockResolvedValue(existingAttendance);

    await postAttendance(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Attendance was successful." })
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        attendance: {
          userId: "65733cab007e4c890aff20ee",
          attendanceDate: "2023-12-24T17:00:00.000Z",
          checkInTime: "2023-12-24T17:55:35.628Z",
          overTime: 0,
          isDeleted: false,
        },
      })
    );
  });

  it("should throw BadRequestError if attendance already exists for the user on the current day", async () => {
    const req = mockRequest("userId123");
    const res = mockResponse();

    const existingAttendance = new Attendance({ userId: "userId123" });

    Attendance.findOne.mockResolvedValue(existingAttendance);

    await expect(postAttendance(req, res)).rejects.toThrow(BadRequestError);
  });

  it("should handle errors thrown within the controller", async () => {
    const req = mockRequest("userId123");
    const res = mockResponse();

    Attendance.findOne.mockRejectedValue(new Error("Database error"));

    await expect(postAttendance(req, res)).rejects.toThrow(Error);
  });
});
