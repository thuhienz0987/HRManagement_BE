import request from "supertest";
import serverTest from "../utils/serverTest";

const server = serverTest();

describe("Test", () => {
  test("test", async () => {
    const res = await request(server)
      .post("/holiday")
      .set(
        "Authorization",
        `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJ1c2VySWQiOiI2NTFiOTE5NDk4YmYzMzk2MDM5YjEyZmMiLCJyb2xlcyI6WyIzMjA0IiwiMjAwMSIsIjE5ODQiXX0sImlhdCI6MTcwMzY3ODI1MCwiZXhwIjoxNzE5MjMwMjUwfQ.FXSMEb5QI9zjdAF0ejzjzvWiCquGrL-ej0KjpY7ERlA`
      )
      .send({ day: "21/12/2023", name: "1234" });
    // console.log(res.body)
    // expect(res.statusCode).toBe(201);
  });
});
