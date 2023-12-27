import request from "supertest";

import serverTest from "../../utils/serverTest";
import { commentUpdate } from "../../utilsTest/comment";

const server = serverTest();

const login = async () => {
  const loginRes = await request(server).post("/login").send({
    email: "sontung01062003@gmail.com",
    password: "Sontung01062003",
  });

  return loginRes;
};

describe("Update Comment", () => {
  let loginRes;
  const invalidId = "abc";
  const existedCommentId = "657974832fc86a9e92adb6c8";
  const nonExistedCommentId = "65541e3a92fb6c12b844f5a0";
  beforeAll(async () => (loginRes = await login()));

  describe("given the exist comment id", () => {
    const { rate, comment, commentMonth } = commentUpdate;
    test("should update comment successfully", async () => {
      const res = await request(server)
        .put(`/comment/${existedCommentId}`)
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({ rate, comment, commentMonth });

      expect(res.statusCode).toBe(200);
    });
  });
  describe("given the non exist comment id", () => {
    const { rate, comment, commentMonth } = commentUpdate;
    test("should handle not found comment", async () => {
      const res = await request(server)
        .put(`/comment/${nonExistedCommentId}`)
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({ rate, comment, commentMonth });

      expect(res.statusCode).toBe(404);
    });
  });
  describe("given the invalid id", () => {
    const { rate, comment, commentMonth } = commentUpdate;
    test("should handle invalid id", async () => {
      const res = await request(server)
        .put(`/comment/${invalidId}`)
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({ rate, comment, commentMonth });

      expect(res.statusCode).toBe(400);
    });
  });
});
