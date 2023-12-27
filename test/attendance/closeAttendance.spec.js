import { closeAttendance } from "../../controllers/attendanceController";
import Attendance from "../../models/Attendance";
import NotFoundError from "../../errors/notFoundError";
import BadRequestError from "../../errors/badRequestError";

jest.mock("../../models/Attendance");

describe("Close Attendance Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: "attendanceId" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("should close attendance successfully", async () => {
    const mockedAttendance = {
      _id: "attendanceId",
      checkInTime: "2023-12-25T00:00:00.000Z", // Assuming checkInTime is set
      attendanceDate: "2023-12-24T17:00:00.000Z", // Assuming attendanceDate is set
      checkOutTime: null, // Assuming checkOutTime is not set
      updateHistory: [],
      overTime: 0, // Assuming overTime is initially 0
    };
    const saveMock = jest.fn().mockResolvedValue({
      _id: "attendanceId",
      userId: "userId",
      checkInTime: "2023-12-25T00:00:00.000Z",
      attendanceDate: "2023-12-24T17:00:00.000Z",
      checkOutTime: "2023-12-25T11:00:00.000Z",
      updateHistory: [],
      overTime: 1,
      isDeleted: false,
    });
    mockedAttendance.save = saveMock;
    // Mocking findById method to return mockedAttendance
    Attendance.findById = jest.fn().mockResolvedValue(mockedAttendance);

    await closeAttendance(req, res);

    expect(Attendance.findById).toHaveBeenCalledWith({
      _id: "attendanceId",
    });
    expect(saveMock).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Closed the attendance successfully.",
      })
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        attendance: {
          _id: "attendanceId",
          userId: "userId",
          checkInTime: "2023-12-25T00:00:00.000Z",
          attendanceDate: "2023-12-24T17:00:00.000Z",
          checkOutTime: "2023-12-25T11:00:00.000Z",
          updateHistory: [],
          overTime: 1,
          isDeleted: false,
        },
      })
    );
  });

  it("should handle not found attendance", async () => {
    // Mocking findById method to return null for not found attendance
    Attendance.findById = jest.fn().mockResolvedValue(null);

    await expect(closeAttendance(req, res)).rejects.toThrow(NotFoundError);
    expect(Attendance.findById).toHaveBeenCalledWith({
      _id: "attendanceId",
    });
  });

  it("should handle already closed attendance", async () => {
    const mockedAttendance = {
      _id: "attendanceId",
      checkOutTime: new Date(), // Assuming checkOutTime is already set
    };

    // Mocking findById method to return mockedAttendance with checkOutTime already set
    Attendance.findById = jest.fn().mockResolvedValue(mockedAttendance);

    await expect(closeAttendance(req, res)).rejects.toThrow(BadRequestError);
    expect(Attendance.findById).toHaveBeenCalledWith({
      _id: "attendanceId",
    });
  });

  it("should propagate other errors to the error handling middleware", async () => {
    const errorMessage = "Something went wrong";
    // Mocking findById to throw an error
    Attendance.findById = jest.fn().mockRejectedValue(new Error(errorMessage));

    await expect(closeAttendance(req, res)).rejects.toThrow(errorMessage);
    expect(Attendance.findById).toHaveBeenCalledWith({
      _id: "attendanceId",
    });
  });
});
