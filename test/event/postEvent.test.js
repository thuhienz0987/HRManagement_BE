import request from "supertest";
import serverTest from "../../utils/serverTest";
import { format, parse } from "date-fns";
import {
    EventCreate,
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
        // await Event.deleteOne({ name: EventSameTime.name });
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
        // await Event.deleteOne({ name: EventSameTime.name });
    });
});
