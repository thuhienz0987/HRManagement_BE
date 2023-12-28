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

  describe("given the exist salary id", () => {
    const { idAllowance } = salaryExisted;
    test("should update salary successfully", async () => {
      const res = await request(server)
        .put(`/salary/${existedSalaryId}`)
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({ idAllowance: idAllowance });

      //   expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Update salary successfully");
    });
  });
  describe("given the non exist salary id", () => {
    const { idAllowance } = salaryExisted;
    test("should handle not found salary", async () => {
      const res = await request(server)
        .put(`/salary/${nonExistedSalaryId}`)
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({ idAllowance: idAllowance });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Not found salary");
    });
  });
  describe("given the non exist allowance id", () => {
    const { idAllowance } = salaryExistedWithNotExistAllowanceId;
    test("should handle not found allowance", async () => {
      const res = await request(server)
        .put(`/salary/${existedSalaryId}`)
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({ idAllowance: idAllowance });

      //   expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Allowance not found");
    });
  });
  describe("given the invalid id", () => {
    const { idAllowance } = salaryExisted;
    test("should handle invalid id", async () => {
      const res = await request(server)
        .put(`/salary/${invalidId}`)
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({ idAllowance: idAllowance });

      expect(res.statusCode).toBe(400);
    });
  });
});
