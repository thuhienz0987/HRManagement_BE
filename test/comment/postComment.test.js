import request from "supertest";

import serverTest from "../../utils/serverTest";
import { commentInValid, commentValid } from "../../utilsTest/comment";

const server = serverTest();

const login = async () => {
  const loginRes = await request(server).post("/login").send({
    email: "sontung01062003@gmail.com",
    password: "Sontung01062003",
  });

  return loginRes;
};

describe("Post Comment", () => {
  let loginRes;

  beforeAll(async () => (loginRes = await login()));

  describe("given the valid comment", () => {
    const { rate, comment, commentMonth, revieweeId, reviewerId } =
      commentValid;
    test("should create a new comment successfully", async () => {
      const res = await request(server)
        .post(`/comment`)
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({ rate, comment, commentMonth, revieweeId, reviewerId });

      expect(res.statusCode).toBe(201);
    });
  });
  describe("given the invalid commentMonth", () => {
    const { rate, comment, commentMonth, revieweeId, reviewerId } =
      commentInValid;
    test("should handle error when a comment already exists for the pair in the same month", async () => {
      const res = await request(server)
        .post(`/comment`)
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({ rate, comment, commentMonth, revieweeId, reviewerId });

      expect(res.statusCode).toBe(400);
    });
  });
});
