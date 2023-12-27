import { updateAttendance } from "../../controllers/attendanceController";
import Attendance from "../../models/Attendance";
import NotFoundError from "../../errors/notFoundError";
import BadRequestError from "../../errors/badRequestError";

jest.mock("../../models/Attendance");

describe("Update Attendance Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: "attendanceId" },
      body: {
        checkInTime: "2023-12-25T00:30:00.000Z", // Assuming checkInTime is set
        attendanceDate: "2023-12-24T17:00:00.000Z", // Assuming attendanceDate is set
        checkOutTime: "2023-12-25T11:00:00.000Z",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("should update attendance successfully", async () => {
    const mockedAttendance = {
      _id: "attendanceId",
      checkInTime: "2023-12-25T00:00:00.000Z", // Assuming checkInTime is set
      attendanceDate: "2023-12-24T17:00:00.000Z", // Assuming attendanceDate is set
      checkOutTime: "2023-12-25T11:00:00.000Z",
      updateHistory: [],
      overTime: 1,
    };
    const saveMock = jest.fn().mockResolvedValue({
      _id: "attendanceId",
      userId: "userId",
      checkInTime: "2023-12-25T00:30:00.000Z",
      attendanceDate: "2023-12-24T17:00:00.000Z",
      checkOutTime: "2023-12-25T11:00:00.000Z",
      updateHistory: [
        {
          updateDate: "2023-12-25T15:46:31.993Z",
          checkInTime: "2023-12-25T00:30:00.000Z",
          attendanceDate: "2023-12-24T17:00:00.000Z",
          checkOutTime: "2023-12-25T11:00:00.000Z",
        },
      ],
      overTime: 1,
      isDeleted: false,
    });
    mockedAttendance.save = saveMock;
    // Mocking findById method to return mockedAttendance
    Attendance.findById = jest.fn().mockResolvedValue(mockedAttendance);

    await updateAttendance(req, res);

    expect(Attendance.findById).toHaveBeenCalledWith({
      _id: "attendanceId",
    });
    expect(saveMock).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      _id: "attendanceId",
      userId: "userId",
      checkInTime: "2023-12-25T00:30:00.000Z",
      attendanceDate: "2023-12-24T17:00:00.000Z",
      checkOutTime: "2023-12-25T11:00:00.000Z",
      updateHistory: [
        {
          updateDate: "2023-12-25T15:46:31.993Z",
          checkInTime: "2023-12-25T00:30:00.000Z",
          attendanceDate: "2023-12-24T17:00:00.000Z",
          checkOutTime: "2023-12-25T11:00:00.000Z",
        },
      ],
      overTime: 1,
      isDeleted: false,
    });
  });

  it("should handle not found attendance", async () => {
    // Mocking findById method to return null for not found attendance
    Attendance.findById = jest.fn().mockResolvedValue(null);

    await expect(updateAttendance(req, res)).rejects.toThrow(NotFoundError);
    expect(Attendance.findById).toHaveBeenCalledWith({
      _id: "attendanceId",
    });
  });

  it("should handle close attendance", async () => {
    const mockedAttendance = new Attendance({
      _id: "attendanceId",
      checkOutTime: null, // Assuming check-out time is not set
    });
    Attendance.findById.mockResolvedValue(mockedAttendance);

    await expect(updateAttendance(req, res)).rejects.toThrow(BadRequestError);
    expect(Attendance.findById).toHaveBeenCalledWith({
      _id: "attendanceId",
    });
  });

  it("should handle other errors", async () => {
    const errorMessage = "Something went wrong";
    Attendance.findById = jest.fn().mockRejectedValue(new Error(errorMessage));

    await expect(updateAttendance(req, res)).rejects.toThrow(errorMessage);
    expect(Attendance.findById).toHaveBeenCalledWith({
      _id: "attendanceId",
    });
  });
});
