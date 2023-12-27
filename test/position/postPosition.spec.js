import { postPosition } from "../../controllers/positionController";
import Position from "../../models/Position";
import BadRequestError from "../../errors/badRequestError";

describe("postPosition", () => {
  it("should create a new Position when it does not exist", async () => {
    // Mock request and response objects
    const req = {
      body: {
        basicSalary: "15000000",
        name: "Security",
        code: "SEC",
      },
    };
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const res = { status: statusMock };

    // Mock Position model functions
    Position.findOne = jest.fn().mockResolvedValue(null);
    const saveMock = jest.fn().mockResolvedValue({
      basicSalary: "15000000",
      name: "Security",
      code: "SEC",
      isDeleted: false,
    });
    Position.prototype.save = saveMock;

    // Call the postHoliday function
    await postPosition(req, res);

    // Assertions
    expect(Position.findOne).toHaveBeenCalledWith({
      code: "SEC",
    });
    expect(saveMock).toHaveBeenCalledWith();
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Create Position successfully",
      position: {
        basicSalary: "15000000",
        name: "Security",
        code: "SEC",
        isDeleted: false,
      },
    });
  });

  it("should restore a Position when it is marked as deleted", async () => {
    // Mock request and response objects
    const req = {
      body: {
        basicSalary: "15000000",
        name: "Security",
        code: "SEC",
      },
    };
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const res = { status: statusMock };

    // Mock Position model functions
    const existingPosition = {
      amount: "17000000",
      name: "Protector",
      code: "SEC",
      isDeleted: true,
    };
    Position.findOne = jest.fn().mockResolvedValue(existingPosition);
    const saveMock = jest.fn().mockResolvedValue({
      basicSalary: "15000000",
      name: "Security",
      code: "SEC",
      isDeleted: false,
    });
    existingPosition.save = saveMock;

    // Call the postHoliday function
    await postPosition(req, res);

    // Assertions
    expect(Position.findOne).toHaveBeenCalledWith({
      code: "SEC",
    });
    expect(saveMock).toHaveBeenCalledWith();
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "restore Position successfully",
      position: {
        basicSalary: "15000000",
        name: "Security",
        code: "SEC",
        isDeleted: false,
      },
    });
  });

  it("should handle error when Position exists and is not deleted", async () => {
    // Mock request and response objects
    const req = {
      body: {
        basicSalary: "15000000",
        name: "Security",
        code: "SEC",
      },
    };
    const throwMock = jest.fn();
    const res = { throw: throwMock };

    // Mock Position model functions
    const existingPosition = {
      basicSalary: "15000000",
      name: "Security",
      code: "SEC",
      isDeleted: false,
    };
    Position.findOne = jest.fn().mockResolvedValue(existingPosition);

    // Call the postPosition function and expect error to be thrown
    try {
      await postPosition(req, res);
    } catch (error) {
      // Verify that BadRequestError is thrown
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.messageObject).toBe("Position with code SEC exist");
    }
  });
});
