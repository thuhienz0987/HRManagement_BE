import { postEvent } from "../../controllers/eventController";
import Event from "../../models/Event";
import BadRequestError from "../../errors/badRequestError";

jest.mock("../../models/Event");

const mockRequest = (name, description, room, dateTime, users) => ({
  body: { name, description, room, dateTime, users },
});

const mockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
};

describe("Post Event Controller", () => {
  it("should create a new event successfully", async () => {
    const req = mockRequest(
      "New Event",
      "Description for the new event",
      "Room A",
      "2023-12-26T03:55:35.628Z",
      [{ user: "user-id-1", mandatory: true }]
    );
    const res = mockResponse();

    const existingEvents = [];
    const saveMock = jest.fn().mockResolvedValue({
      name: "New Event",
      description: "Description for the new event",
      room: "Room A",
      dateTime: "2023-12-26T03:55:35.628Z",
      users: [{ user: "user-id-1", mandatory: true }],
      isDeleted: false,
    });

    Event.find.mockResolvedValue(existingEvents);
    Event.prototype.save = saveMock;

    await postEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Create event successfully" })
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        event: {
          name: "New Event",
          description: "Description for the new event",
          room: "Room A",
          dateTime: "2023-12-26T03:55:35.628Z",
          users: [{ user: "user-id-1", mandatory: true }],
          isDeleted: false,
        },
      })
    );
  });
  it("should handle error when some mandatory participants attended another event during the same time frame", async () => {
    const req = mockRequest(
      "Another Event",
      "Description for another event",
      "Room A",
      "2023-12-26T03:55:35.628Z",
      [{ user: "user-id-1", mandatory: true }]
    );
    const res = mockResponse();

    const existingEvents = [
      {
        name: "Old Event",
        description: "Description for the old event",
        room: "Room B",
        dateTime: "2023-12-26T03:55:35.628Z",
        users: [{ user: "user-id-1", mandatory: true }],
        isDeleted: false,
      },
    ];
    Event.find.mockResolvedValue(existingEvents);

    await expect(postEvent(req, res)).rejects.toThrow(BadRequestError);
  });

  it("should handle error when the room is already booked for another event during the same time frame", async () => {
    const req = mockRequest(
      "Another Event",
      "Description for another event",
      "Room A",
      "2023-12-26T03:55:35.628Z",
      [{ user: "user-id-2", mandatory: true }]
    );
    const res = mockResponse();

    const existingEvents = [
      {
        name: "Old Event",
        description: "Description for the old event",
        room: "Room A",
        dateTime: "2023-12-26T03:55:35.628Z",
        users: [{ user: "user-id-1", mandatory: true }],
        isDeleted: false,
      },
    ];
    Event.find.mockResolvedValue(existingEvents);

    await expect(postEvent(req, res)).rejects.toThrow(BadRequestError);
  });

  it("should handle other errors by throwing them", async () => {
    const req = mockRequest(
      "Yet Another Event",
      "Description for yet another event",
      "Room B",
      "2023-12-26T03:55:35.628Z",
      [{ user: "user-id-3", mandatory: true }]
    );
    const res = mockResponse();

    const errorMessage = "Something went wrong";
    Event.find.mockRejectedValue(new Error(errorMessage));

    await expect(postEvent(req, res)).rejects.toThrow(errorMessage);
  });
});
