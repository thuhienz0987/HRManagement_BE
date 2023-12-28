import request from "supertest";
import serverTest from "../../utils/serverTest";
import { format, parse } from "date-fns";
import {
  EventCreate,
  EventMissProperties,
  EventSameRoom,
  EventSameTime,
} from "../../utilsTest/event";
import Event from "../../models/Event";

const infiniteToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJ1c2VySWQiOiI2NTFiOTE5NDk4YmYzMzk2MDM5YjEyZmMiLCJyb2xlcyI6WyIzMjA0IiwiMjAwMSIsIjE5ODQiXX0sImlhdCI6MTcwMzY3ODI1MCwiZXhwIjoxNzE5MjMwMjUwfQ.FXSMEb5QI9zjdAF0ejzjzvWiCquGrL-ej0KjpY7ERlA";

const server = serverTest();

describe("Event", () => {
  test("should create a new Event when it does not exist", async () => {
    const res = await request(server)
      .post("/event")
      .set("Authorization", `Bearer ${infiniteToken}`)
      .send(EventCreate);
    // console.log(res);
    expect(res.statusCode).toBe(201);
    expect(res.body.event.name).toBe(EventCreate.name);
    expect(res.body.message).toBe("Create event successfully");

    await Event.deleteOne({ name: EventCreate.name });
  });

  test("should handle error when some mandatory participants attended another event during the same time frame", async () => {
    const res = await request(server)
      .post("/event")
      .set("Authorization", `Bearer ${infiniteToken}`)
      .send(EventSameTime);
    // console.log(res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Some mandatory participants attended another event during the same time frame"
    );
  });

  test("should handle error when the room is already booked for another event during the same time frame", async () => {
    const res = await request(server)
      .post("/event")
      .set("Authorization", `Bearer ${infiniteToken}`)
      .send(EventSameRoom);
    // console.log(res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "The room is already booked for another event during the same time frame"
    );
  });

  test("should handle error when Event miss name", async () => {
    const { description, dateTime, users, room } = EventMissProperties;
    const res = await request(server)
      .post("/event")
      .set("Authorization", `Bearer ${infiniteToken}`)
      .send({
        description,
        dateTime,
        users,
        room,
      });
    // console.log(res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Event validation failed: name: A Event must have a name"
    );
  });
  test("should handle error when name of Event have more 50 characters", async () => {
    const { description, dateTime, users, room } = EventMissProperties;
    const name =
      "Contract signingContract signingContract signingContract signingContract signingContract signingContract signingContract signing";
    const res = await request(server)
      .post("/event")
      .set("Authorization", `Bearer ${infiniteToken}`)
      .send({
        name,
        description,
        dateTime,
        users,
        room,
      });
    // console.log(res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Event validation failed: name: A name of Event must have a maximum of 50 characters"
    );
  });
  test("should handle error when Event miss room", async () => {
    const { name, description, dateTime, users } = EventMissProperties;
    const res = await request(server)
      .post("/event")
      .set("Authorization", `Bearer ${infiniteToken}`)
      .send({
        name,
        description,
        dateTime,
        users,
      });
    // console.log(res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Event validation failed: room: A Event must have a room"
    );
  });

  test("should handle error when room of Event have more 50 characters", async () => {
    const { description, dateTime, users, name } = EventMissProperties;
    const room =
      "Contract signingContract signingContract signingContract signingContract signingContract signingContract signingContract signing";
    const res = await request(server)
      .post("/event")
      .set("Authorization", `Bearer ${infiniteToken}`)
      .send({
        name,
        description,
        dateTime,
        users,
        room,
      });
    // console.log(res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Event validation failed: room: A room name of Event must have a maximum of 50 characters"
    );
  });

  test("should handle error when Event miss description", async () => {
    const { name, dateTime, users, room } = EventMissProperties;
    const res = await request(server)
      .post("/event")
      .set("Authorization", `Bearer ${infiniteToken}`)
      .send({
        name,
        dateTime,
        users,
        room,
      });
    // console.log(res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Event validation failed: description: A Event must have a description"
    );
  });
  test("should handle error when description of Event have more 100 characters", async () => {
    const { name, dateTime, users, room } = EventMissProperties;
    const description = "Contract".repeat(20);
    const res = await request(server)
      .post("/event")
      .set("Authorization", `Bearer ${infiniteToken}`)
      .send({
        name,
        description,
        dateTime,
        users,
        room,
      });
    // console.log(res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Event validation failed: description: A description of Event must have a maximum of 100 characters"
    );
  });
  test("should handle error when Event miss dateTime", async () => {
    const { name, description, users, room } = EventMissProperties;
    const res = await request(server)
      .post("/event")
      .set("Authorization", `Bearer ${infiniteToken}`)
      .send({
        name,
        description,
        users,
        room,
      });
    // console.log(res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Event validation failed: dateTime: A Event must have a date time"
    );
  });
});
