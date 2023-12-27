import { getAttendanceByMonth } from "../../controllers/attendanceController";
import Attendance from "../../models/Attendance";
import NotFoundError from "../../errors/notFoundError";

jest.mock("../../models/Attendance");

describe("Get Attendance By UserId In Month Controller", () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = { params: { month: "12", year: "2023", userId: "userId" } };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("should get attendance by userId in month successfully and return attendances in month", async () => {
    const fakeAttendances = [
      {
        _id: "attendanceId1",
        userId: "userId",
        attendanceDate: "2023-11-30T17:00:00.000Z",
        checkInTime: "2023-12-01T00:48:00.000Z",
        checkOutTime: "2023-12-01T12:49:00.000Z",
        overTime: 2,
        isDeleted: false,
        updateHistory: [
          {
            updateDate: "2023-12-08T11:20:48.722Z",
            checkInTime: "2023-12-01T00:48:00.000Z",
            checkOutTime: "2023-12-01T12:50:00.000Z",
            attendanceDate: "2023-11-30T17:00:00.000Z",
            _id: "updateId1",
          },
        ],
      },
      {
        _id: "attendanceId2",
        userId: "userId",
        attendanceDate: "2023-12-04T17:00:00.000Z",
        checkInTime: "2023-12-05T00:42:00.000Z",
        checkOutTime: "2023-12-05T10:44:00.000Z",
        overTime: 0,
        isDeleted: false,
        updateHistory: [],
      },
      {
        _id: "attendanceId3",
        userId: "userId",
        attendanceDate: "2023-12-05T17:00:00.000Z",
        checkInTime: "2023-12-06T01:34:00.000Z",
        checkOutTime: "2023-12-06T09:29:00.000Z",
        overTime: 0,
        isDeleted: false,
        updateHistory: [],
      },
      {
        _id: "attendanceId4",
        userId: "userId",
        attendanceDate: "2023-12-06T17:00:00.000Z",
        checkInTime: "2023-12-07T01:25:00.000Z",
        checkOutTime: "2023-12-07T09:01:00.000Z",
        overTime: 0,
        isDeleted: false,
        updateHistory: [],
      },
    ];
    Attendance.find = jest.fn().mockReturnValue(fakeAttendances);

    await getAttendanceByMonth(mockRequest, mockResponse);

    expect(Attendance.find).toHaveBeenCalledWith({
      isDeleted: false,
      userId: "userId",
      attendanceDate: {
        $gte: new Date("2023-11-30T17:00:00.000Z"),
        $lte: new Date("2023-12-30T17:00:00.000Z"),
      },
    });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith([
      {
        _id: "attendanceId1",
        userId: "userId",
        attendanceDate: "2023-11-30T17:00:00.000Z",
        checkInTime: "2023-12-01T00:48:00.000Z",
        checkOutTime: "2023-12-01T12:49:00.000Z",
        overTime: 2,
        isDeleted: false,
        updateHistory: [
          {
            updateDate: "2023-12-08T11:20:48.722Z",
            checkInTime: "2023-12-01T00:48:00.000Z",
            checkOutTime: "2023-12-01T12:50:00.000Z",
            attendanceDate: "2023-11-30T17:00:00.000Z",
            _id: "updateId1",
          },
        ],
      },
      {
        _id: "attendanceId2",
        userId: "userId",
        attendanceDate: "2023-12-04T17:00:00.000Z",
        checkInTime: "2023-12-05T00:42:00.000Z",
        checkOutTime: "2023-12-05T10:44:00.000Z",
        overTime: 0,
        isDeleted: false,
        updateHistory: [],
      },
      {
        _id: "attendanceId3",
        userId: "userId",
        attendanceDate: "2023-12-05T17:00:00.000Z",
        checkInTime: "2023-12-06T01:34:00.000Z",
        checkOutTime: "2023-12-06T09:29:00.000Z",
        overTime: 0,
        isDeleted: false,
        updateHistory: [],
      },
      {
        _id: "attendanceId4",
        userId: "userId",
        attendanceDate: "2023-12-06T17:00:00.000Z",
        checkInTime: "2023-12-07T01:25:00.000Z",
        checkOutTime: "2023-12-07T09:01:00.000Z",
        overTime: 0,
        isDeleted: false,
        updateHistory: [],
      },
    ]);
  });

  it("should handle attendances by user id in month not found and throw NotFoundError", async () => {
    Attendance.find = jest.fn().mockResolvedValue([]);

    await expect(
      getAttendanceByMonth(mockRequest, mockResponse)
    ).rejects.toThrow(NotFoundError);
    // expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it("should handle other errors and propagate them to the error handling middleware", async () => {
    const errorMessage = "Something went wrong";
    Attendance.find.mockRejectedValue(new Error(errorMessage));

    await expect(
      getAttendanceByMonth(mockRequest, mockResponse)
    ).rejects.toThrow(errorMessage);
  });
});
