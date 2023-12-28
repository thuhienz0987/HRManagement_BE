import request from "supertest";

import serverTest from "../../utils/serverTest";
import {
  salaryExisted,
  salaryExistedWithNotExistAllowanceId,
} from "../../utilsTest/salary";

const server = serverTest();

const login = async () => {
  const loginRes = await request(server).post("/login").send({
    email: "sontung01062003@gmail.com",
    password: "Sontung01062003",
  });

  return loginRes;
};

describe("Update Salary", () => {
  let loginRes;
  const invalidId = "abc";
  const existedSalaryId = "657c6dfda520667d95845006";
  const nonExistedSalaryId = "65541e3a92fb6c12b844f5a0";
  beforeAll(async () => (loginRes = await login()));

  test("should update salary successfully", async () => {
    const { idAllowance } = salaryExisted;
    const res = await request(server)
      .put(`/salary/${existedSalaryId}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({ idAllowance: idAllowance });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Update salary successfully");
  });
  test("should handle not found salary when given the non exist salary id", async () => {
    const { idAllowance } = salaryExisted;
    const res = await request(server)
      .put(`/salary/${nonExistedSalaryId}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({ idAllowance: idAllowance });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Not found salary");
  });
  test("should handle not found allowance when given the non exist allowance id", async () => {
    const { idAllowance } = salaryExistedWithNotExistAllowanceId;
    const res = await request(server)
      .put(`/salary/${existedSalaryId}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({ idAllowance: idAllowance });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Allowance not found");
  });
  test("should handle when given the invalid salary id", async () => {
    const { idAllowance } = salaryExisted;
    const res = await request(server)
      .put(`/salary/${invalidId}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({ idAllowance: idAllowance });

    expect(res.statusCode).toBe(400);
  });
});
