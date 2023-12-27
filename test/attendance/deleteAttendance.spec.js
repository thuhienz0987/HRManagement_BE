import { deleteAttendance } from "../../controllers/attendanceController";
import Attendance from "../../models/Attendance";

jest.mock("../../models/Attendance");

describe("Delete Attendance Controller", () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = { params: { id: "attendanceId" } };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("should delete attendance successfully", async () => {
    const fakeAttendance = {
      _id: "attendanceId",
      userId: "userId",
      attendanceDate: "2023-12-04T17:00:00.000Z",
      checkInTime: "2023-12-05T00:42:00.000Z",
      checkOutTime: "2023-12-05T10:44:00.000Z",
      overTime: 0,
      isDeleted: true,
      updateHistory: [],
    };
    Attendance.findByIdAndUpdate = jest.fn().mockReturnValue(fakeAttendance);

    await deleteAttendance(mockRequest, mockResponse);

    expect(Attendance.findByIdAndUpdate).toHaveBeenCalledWith(
      { _id: "attendanceId" },
      { isDeleted: true },
      { new: true }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Deleted attendance successfully" })
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ attendance: fakeAttendance })
    );
  });
  it("should throw error if attendance cannot be deleted", async () => {
    const errorMessage = "Something went wrong";
    Attendance.findByIdAndUpdate.mockRejectedValue(new Error(errorMessage));

    await expect(deleteAttendance(mockRequest, mockResponse)).rejects.toThrow(
      errorMessage
    );
  });
});
