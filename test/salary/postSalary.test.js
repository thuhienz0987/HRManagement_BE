import request from "supertest";

import serverTest from "../../utils/serverTest";
import {
  salaryWithNotExistAllowanceId,
  salaryWithNotExistUserId,
  salaryValid,
  salaryExisted,
} from "../../utilsTest/salary";
import Salary from "../../models/Salary";

const server = serverTest();

const login = async () => {
  const loginRes = await request(server).post("/login").send({
    email: "sontung01062003@gmail.com",
    password: "Sontung01062003",
  });

  return loginRes;
};

describe("Post Salary", () => {
  let loginRes;

  beforeAll(async () => (loginRes = await login()));

  test("should create a new comment successfully (given the valid salary)", async () => {
    const res = await request(server)
      .post(`/salary`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send(salaryValid);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Salary created successfully");
    await Salary.deleteOne({ _id: res.body.salary._id });
  });
  test("should handle error when salary was calculated (given the existed salary)", async () => {
    const res = await request(server)
      .post(`/salary`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send(salaryExisted);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Salary already calculated for this month.");
  });
  test("should handle error when allowance not found (given the not exist allowance id)", async () => {
    const res = await request(server)
      .post(`/salary`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send(salaryWithNotExistAllowanceId);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Allowance not found");
  });
  test("should handle error when user not found (given the not exist user id)", async () => {
    const res = await request(server)
      .post(`/salary`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send(salaryWithNotExistUserId);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });
});
