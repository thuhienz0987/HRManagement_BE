import request from "supertest";
import serverTest from "../../utils/serverTest";
import {
  HolidayCreate,
  HolidayDeleted,
  HolidayExisted,
} from "../../utilsTest/holiday";
import Holiday from "../../models/Holiday";
import { format, parse } from "date-fns";

const infiniteToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJ1c2VySWQiOiI2NTFiOTE5NDk4YmYzMzk2MDM5YjEyZmMiLCJyb2xlcyI6WyIzMjA0IiwiMjAwMSIsIjE5ODQiXX0sImlhdCI6MTcwMzY3ODI1MCwiZXhwIjoxNzE5MjMwMjUwfQ.FXSMEb5QI9zjdAF0ejzjzvWiCquGrL-ej0KjpY7ERlA";

const server = serverTest();

describe("Holiday", () => {
  test("should create a new Holiday when it does not exist", async () => {
    const res = await request(server)
      .post("/holiday")
      .set("Authorization", `Bearer ${infiniteToken}`)
      .send(HolidayCreate);
    console.log(res);
    expect(res.statusCode).toBe(201);
    expect(res.body.holiday.name).toBe(HolidayCreate.name);
    expect(res.body.message).toBe("Create holiday successfully");

    await Holiday.deleteOne({ name: HolidayCreate.name });
  });

  test("should restore a Holiday when it is marked as deleted", async () => {
    const res = await request(server)
      .post("/holiday")
      .set("Authorization", `Bearer ${infiniteToken}`)
      .send(HolidayDeleted);
    console.log(res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe(`restore holiday successfully`);
    const dateObj = parse(HolidayDeleted.day, "dd/MM/yyyy", new Date());
    const isoDateStr = format(dateObj, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    await Holiday.findOneAndUpdate({ day: isoDateStr }, { isDeleted: true });
  });

  test("should handle error when holiday exists and is not deleted", async () => {
    const res = await request(server)
      .post("/holiday")
      .set("Authorization", `Bearer ${infiniteToken}`)
      .send(HolidayExisted);
    console.log(res.body);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Holiday with day Sun Apr 30 2023 07:00:00 GMT+0700 (Indochina Time) exists"
    );
  });

  test("should handle error when holiday miss name", async () => {
    const res = await request(server)
      .post("/holiday")
      .set("Authorization", `Bearer ${infiniteToken}`)
      .send({ ...HolidayCreate, name: "" });
    console.log(res.body);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Holiday validation failed: name: A holiday must have a name"
    );
  });

  test("should handle error when holiday has 100+ char name", async () => {
    const res = await request(server)
      .post("/holiday")
      .set("Authorization", `Bearer ${infiniteToken}`)
      .send({ ...HolidayCreate, name: "a".repeat(101) });
    console.log(res.body);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Holiday validation failed: name: A name of holiday must have maximum of 100 character"
    );
  });

  test("should handle error when holiday miss day", async () => {
    const res = await request(server)
      .post("/holiday")
      .set("Authorization", `Bearer ${infiniteToken}`)
      .send({ ...HolidayCreate, day: "" });
    console.log(res.body);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid time value");
  });
});
