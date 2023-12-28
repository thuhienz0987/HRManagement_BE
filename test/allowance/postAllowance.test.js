import request from "supertest";
import serverTest from "../../utils/serverTest";
import {
    AllowanceCreate,
    AllowanceDeleted,
    AllowanceExisted,
} from "../../utilsTest/allowance";
import Allowance from "../../models/Allowance";

const infiniteToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJ1c2VySWQiOiI2NTFiOTE5NDk4YmYzMzk2MDM5YjEyZmMiLCJyb2xlcyI6WyIzMjA0IiwiMjAwMSIsIjE5ODQiXX0sImlhdCI6MTcwMzY3ODI1MCwiZXhwIjoxNzE5MjMwMjUwfQ.FXSMEb5QI9zjdAF0ejzjzvWiCquGrL-ej0KjpY7ERlA";

const server = serverTest();

describe("Allowance", () => {
    test("should create a new allowance when it does not exist", async () => {
        const res = await request(server)
            .post("/position")
            .set("Authorization", `Bearer ${infiniteToken}`)
            .send(AllowanceCreate);
        expect(res.statusCode).toBe(201);
        expect(res.body.allowance.name).toBe(AllowanceCreate.name);
        await Allowance.deleteOne({ code: AllowanceCreate.code });
    });

    test("should restore a allowance when it is marked as deleted", async () => {
        const res = await request(server)
            .post("/allowance")
            .set("Authorization", `Bearer ${infiniteToken}`)
            .send(AllowanceDeleted);
        console.log(res.body);
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe(`Restore Allowance successfully`);
        await Allowance.findOneAndUpdate(
            { code: AllowanceDeleted.code },
            { isDeleted: true }
        );
    });

    test("should handle error when allowance exists and is not deleted", async () => {
        const res = await request(server)
            .post("/allowance")
            .set("Authorization", `Bearer ${infiniteToken}`)
            .send(AllowanceExisted);
        console.log(res.body);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            `Allowance with code ${AllowanceExisted.code} exist`
        );
    });

    test("should not create a allowance when it miss code", async () => {
        const res = await request(server)
            .post("/allowance")
            .set("Authorization", `Bearer ${infiniteToken}`)
            .send({ ...AllowanceCreate, code: "" });
        // console.log(res.body);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            `Allowance validation failed: code: Allowance must have a code`
        );
    });

    test("should not create a allowance when it 10+ code char", async () => {
        const res = await request(server)
            .post("/allowance")
            .set("Authorization", `Bearer ${infiniteToken}`)
            .send({ ...AllowanceCreate, code: "AAAAAAAAAAA" });
        console.log(res.body);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            `Allowance validation failed: code: A code of allowance must have maximum of 10 characters`
        );
    });

    test("should not create a allowance when it miss amount", async () => {
        const res = await request(server)
            .post("/allowance")
            .set("Authorization", `Bearer ${infiniteToken}`)
            .send({ ...AllowanceCreate, amount: "" });
        console.log(res.body);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            `Allowance validation failed: amount: Allowance must have an amount`
        );
    });

    test("should not create a allowance when it miss name", async () => {
        const res = await request(server)
            .post("/allowance")
            .set("Authorization", `Bearer ${infiniteToken}`)
            .send({ ...AllowanceCreate, name: "" });
        console.log(res.body);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
            `Allowance validation failed: name: Allowance must have a name`
        );
    });
});
