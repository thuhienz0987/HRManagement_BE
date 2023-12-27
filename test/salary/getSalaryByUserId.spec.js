import { getSalaryByUserId } from "../../controllers/salaryController";
import Salary from "../../models/Salary";
import NotFoundError from "../../errors/notFoundError";

jest.mock("../../models/Salary");

describe("Get Salary By UserId Controller", () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = { params: { id: "userId" } };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("should get salary by user id successfully and return user's salary", async () => {
    const fakeSalary = {
      _id: "salaryId",
      userId: "userId",
      idComment: "commentId",
      idPosition: "positionId",
      bonus: [0.1],
      idAllowance: [
        "allowanceLunchId",
        "allowanceTravelId",
        "allowanceSocialId",
      ],
      incomeTax: 20,
      payDay: "2023-12-28T00:00:00.000Z",
      presentDate: 22,
      totalSalary: 15865399.999999996,
      totalIncome: 19831749.999999996,
      incomeTaxAmount: 3966349.9999999995,
      overTimeDay: 0,
      overTime: 17,
      paidLeaveDays: 0,
      totalLeaveRequest: 0,
      overTimeMoney: 1448863.6363636362,
      overTimeDayMoney: 0,
      dayMoney: 14999999.999999998,
      bonusMoney: 1802886.3636363633,
      allowanceAmount: 1580000,
      paidLeaveDaysMoney: 0,
    };
    Salary.find = jest.fn().mockReturnValue(fakeSalary);

    await getSalaryByUserId(mockRequest, mockResponse);

    expect(Salary.find).toHaveBeenCalledWith({ userId: "userId" });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      _id: "salaryId",
      userId: "userId",
      idComment: "commentId",
      idPosition: "positionId",
      bonus: [0.1],
      idAllowance: [
        "allowanceLunchId",
        "allowanceTravelId",
        "allowanceSocialId",
      ],
      incomeTax: 20,
      payDay: "2023-12-28T00:00:00.000Z",
      presentDate: 22,
      totalSalary: 15865399.999999996,
      totalIncome: 19831749.999999996,
      incomeTaxAmount: 3966349.9999999995,
      overTimeDay: 0,
      overTime: 17,
      paidLeaveDays: 0,
      totalLeaveRequest: 0,
      overTimeMoney: 1448863.6363636362,
      overTimeDayMoney: 0,
      dayMoney: 14999999.999999998,
      bonusMoney: 1802886.3636363633,
      allowanceAmount: 1580000,
      paidLeaveDaysMoney: 0,
    });
  });

  it("should handle salary not found and throw NotFoundError", async () => {
    mockRequest.params.id = "userId1";
    Salary.find = jest.fn().mockResolvedValue(null);

    await expect(getSalaryByUserId(mockRequest, mockResponse)).rejects.toThrow(
      NotFoundError
    );
  });

  it("should handle other errors and propagate them to the error handling middleware", async () => {
    const errorMessage = "Something went wrong";
    Salary.find.mockRejectedValue(new Error(errorMessage));

    await expect(getSalaryByUserId(mockRequest, mockResponse)).rejects.toThrow(
      errorMessage
    );
  });
});
