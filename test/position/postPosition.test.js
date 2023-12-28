import request from "supertest";
import serverTest from "../../utils/serverTest";
import {
    PositionCreate,
    PositionDeleted,
    PositionExisted,
} from "../../utilsTest/position";
import Position from "../../models/Position";

const infiniteToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJ1c2VySWQiOiI2NTFiOTE5NDk4YmYzMzk2MDM5YjEyZmMiLCJyb2xlcyI6WyIzMjA0IiwiMjAwMSIsIjE5ODQiXX0sImlhdCI6MTcwMzY3ODI1MCwiZXhwIjoxNzE5MjMwMjUwfQ.FXSMEb5QI9zjdAF0ejzjzvWiCquGrL-ej0KjpY7ERlA";

const server = serverTest();

describe("Position", () => {
    test("should create a new Position when it does not exist", async () => {
        const res = await request(server)
            .post("/position")
            .set("Authorization", `Bearer ${infiniteToken}`)
            .send(PositionCreate);
        expect(res.statusCode).toBe(201);
        expect(res.body.position.name).toBe(PositionCreate.name);
        await Position.deleteOne({ code: PositionCreate.code });
    });

    test("should restore a Position when it is marked as deleted", async () => {
        const res = await request(server)
            .post("/position")
            .set("Authorization", `Bearer ${infiniteToken}`)
            .send(PositionDeleted);
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe(`restore Position successfully`);
        await Position.findOneAndUpdate(
            { code: PositionDeleted.code },
            { isDeleted: true }
        );
    });

    test("should handle error when Position exists and is not deleted", async () => {
        const res = await request(server)
            .post("/position")
            .set("Authorization", `Bearer ${infiniteToken}`)
            .send(PositionExisted);
        console.log(res.body);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            `Position with code ${PositionExisted.code} exist`
        );
    });

    test("should not create a Position when it miss code", async () => {
        const res = await request(server)
            .post("/position")
            .set("Authorization", `Bearer ${infiniteToken}`)
            .send({ ...PositionCreate, code: "" });
        // console.log(res.body);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            `Position validation failed: code: A Position must have a code`
        );
    });

    test("should not create a Position when it 4+ code char", async () => {
        const res = await request(server)
            .post("/position")
            .set("Authorization", `Bearer ${infiniteToken}`)
            .send({ ...PositionCreate, code: "AAAAAAAAAAA" });
        console.log(res.body);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            `Position validation failed: code: A code of Position must have maximum of 4 character`
        );
    });

    test("should not create a Position when it miss basic salary", async () => {
        const res = await request(server)
            .post("/position")
            .set("Authorization", `Bearer ${infiniteToken}`)
            .send({ ...PositionCreate, basicSalary: "" });
        console.log(res.body);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            `Position validation failed: basicSalary: A Position must have basic salary`
        );
    });

    test("should not create a Position when it miss name", async () => {
        const res = await request(server)
            .post("/position")
            .set("Authorization", `Bearer ${infiniteToken}`)
            .send({ ...PositionCreate, name: "" });
        console.log(res.body);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            `Position validation failed: name: A Position must have a name`
        );
    });
});
