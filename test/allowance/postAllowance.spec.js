import { postAllowance } from "../../controllers/allowanceController";
import Allowance from "../../models/Allowance";
import BadRequestError from "../../errors/badRequestError";

describe("postAllowance", () => {
  it("should create a new allowance when it does not exist", async () => {
    // Mock request and response objects
    const req = {
      body: {
        amount: "650000",
        name: "Lunch",
        code: "L",
      },
    };
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const res = { status: statusMock };

    // Mock Allowance model functions
    Allowance.findOne = jest.fn().mockResolvedValue(null);
    const saveMock = jest.fn().mockResolvedValue({
      amount: "650000",
      name: "Lunch",
      code: "L",
      isDeleted: false,
    });
    Allowance.prototype.save = saveMock;

    // Call the postHoliday function
    await postAllowance(req, res);

    // Assertions
    expect(Allowance.findOne).toHaveBeenCalledWith({
      code: "L",
    });
    expect(saveMock).toHaveBeenCalledWith();
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Create Allowance successfully",
      allowance: {
        amount: "650000",
        name: "Lunch",
        code: "L",
        isDeleted: false,
      },
    });
  });

  it("should restore a allowance when it is marked as deleted", async () => {
    // Mock request and response objects
    const req = {
      body: {
        amount: "650000",
        name: "Lunch",
        code: "L",
      },
    };
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const res = { status: statusMock };

    // Mock Allowance model functions
    const existingAllowance = {
      amount: "950000",
      name: "lunch",
      code: "L",
      isDeleted: true,
    };
    Allowance.findOne = jest.fn().mockResolvedValue(existingAllowance);
    const saveMock = jest.fn().mockResolvedValue({
      amount: "650000",
      name: "Lunch",
      code: "L",
      isDeleted: false,
    });
    existingAllowance.save = saveMock;

    // Call the postHoliday function
    await postAllowance(req, res);

    // Assertions
    expect(Allowance.findOne).toHaveBeenCalledWith({
      code: "L",
    });
    expect(saveMock).toHaveBeenCalledWith();
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Restore Allowance successfully",
      allowance: {
        amount: "650000",
        name: "Lunch",
        code: "L",
        isDeleted: false,
      },
    });
  });

  it("should handle error when allowance exists and is not deleted", async () => {
    // Mock request and response objects
    const req = {
      body: {
        amount: "650000",
        name: "Lunch",
        code: "L",
      },
    };
    const throwMock = jest.fn();
    const res = { throw: throwMock };

    // Mock Allowance model functions
    const existingAllowance = {
      amount: "650000",
      name: "Lunch",
      code: "L",
      isDeleted: false,
    };
    Allowance.findOne = jest.fn().mockResolvedValue(existingAllowance);

    // Call the postAllowance function and expect error to be thrown
    try {
      await postAllowance(req, res);
    } catch (error) {
      // Verify that BadRequestError is thrown
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.messageObject).toBe("Allowance with code L exist");
    }
  });
});
