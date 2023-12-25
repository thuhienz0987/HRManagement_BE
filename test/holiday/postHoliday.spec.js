import { postHoliday } from "../../controllers/holidayController";
import Holiday from "../../models/Holiday";
import BadRequestError from "../../errors/badRequestError";

describe("postHoliday", () => {
  it("should create a new holiday when it does not exist", async () => {
    // Mock request and response objects
    const req = {
      body: {
        day: "01/01/2023",
        name: "New Year",
      },
    };
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const res = { status: statusMock };

    // Mock Holiday model functions
    Holiday.findOne = jest.fn().mockResolvedValue(null);
    const saveMock = jest.fn().mockResolvedValue({
      day: "2023-01-01T00:00:00.000Z",
      name: "New Year",
      isDeleted: false,
    });
    Holiday.prototype.save = saveMock;

    // Call the postHoliday function
    await postHoliday(req, res);

    // Assertions
    expect(Holiday.findOne).toHaveBeenCalledWith({
      day: "2023-01-01T00:00:00.000Z",
    });
    expect(saveMock).toHaveBeenCalledWith();
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Create holiday successfully",
      holiday: {
        day: "2023-01-01T00:00:00.000Z",
        name: "New Year",
        isDeleted: false,
      },
    });
  });

  it("should restore a holiday when it is marked as deleted", async () => {
    // Mock request and response objects
    const req = {
      body: {
        day: "01/01/2023",
        name: "New Year",
      },
    };
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const res = { status: statusMock };

    // Mock Holiday model functions
    const existingHoliday = {
      day: "2023-01-01T00:00:00.000Z",
      name: "Christmas",
      isDeleted: true,
    };
    Holiday.findOne = jest.fn().mockResolvedValue(existingHoliday);
    const saveMock = jest.fn().mockResolvedValue({
      day: "2023-01-01T00:00:00.000Z",
      name: "New Year",
      isDeleted: false,
    });
    existingHoliday.save = saveMock;

    // Call the postHoliday function
    await postHoliday(req, res);

    // Assertions
    expect(Holiday.findOne).toHaveBeenCalledWith({
      day: "2023-01-01T00:00:00.000Z",
    });
    expect(saveMock).toHaveBeenCalledWith();
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "restore holiday successfully",
      holiday: {
        day: "2023-01-01T00:00:00.000Z",
        name: "New Year",
        isDeleted: false,
      },
    });
  });

  it("should handle error when holiday exists and is not deleted", async () => {
    // Mock request and response objects
    const req = {
      body: {
        day: "01/01/2023",
        name: "New Year",
      },
    };
    const throwMock = jest.fn();
    const res = { throw: throwMock };

    // Mock Holiday model functions
    const existingHoliday = {
      day: "2023-01-01T00:00:00.000Z",
      name: "New Year",
      isDeleted: false,
    };
    Holiday.findOne = jest.fn().mockResolvedValue(existingHoliday);

    // Call the postHoliday function and expect error to be thrown
    try {
      await postHoliday(req, res);
    } catch (error) {
      // Verify that BadRequestError is thrown
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.messageObject).toBe(
        "Holiday with day 2023-01-01T00:00:00.000Z exists"
      );
    }
  });
  it("should handle other errors by throwing them", async () => {
    const req = {
      body: {
        day: "01/01/2023",
        name: "New Year",
      },
    };
    const throwMock = jest.fn();
    const res = { throw: throwMock };

    const errorMessage = "Something went wrong";
    Holiday.findOne.mockRejectedValue(new Error(errorMessage));

    await expect(postHoliday(req, res)).rejects.toThrow(errorMessage);
  });
});
