import request from "supertest";

import serverTest from "../../utils/serverTest";
import {
  commentInValid,
  commentMissProperties,
  commentValid,
} from "../../utilsTest/comment";
import Comment from "../../models/Comment";

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

  test("should create a new comment successfully", async () => {
    const { rate, comment, commentMonth, revieweeId, reviewerId } =
      commentValid;
    const res = await request(server)
      .post(`/comment`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({ rate, comment, commentMonth, revieweeId, reviewerId });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Create Comment successfully");

    await Comment.deleteOne({ _id: res.body.comment._id });
  });
  test("should handle error when a comment already exists for the pair in the same month", async () => {
    const { rate, comment, commentMonth, revieweeId, reviewerId } =
      commentInValid;
    const res = await request(server)
      .post(`/comment`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({ rate, comment, commentMonth, revieweeId, reviewerId });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(`A comment already exists for this month`);
  });
  test("should handle error when Comment miss comment", async () => {
    const { rate, commentMonth, revieweeId, reviewerId } =
      commentMissProperties;
    const res = await request(server)
      .post("/comment")
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({
        rate,
        commentMonth,
        revieweeId,
        reviewerId,
      });
    // console.log(res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Comment validation failed: comment: Comment is missing"
    );
  });
  test("should handle error when Comment miss rate", async () => {
    const { comment, commentMonth, revieweeId, reviewerId } =
      commentMissProperties;
    const res = await request(server)
      .post("/comment")
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({
        comment,
        commentMonth,
        revieweeId,
        reviewerId,
      });
    // console.log(res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Comment validation failed: rate: Rate is missing"
    );
  });
  test("should handle error when rate of Comment must include rating bar = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]", async () => {
    const { comment, commentMonth, revieweeId, reviewerId } =
      commentMissProperties;
    const rate = 11;
    const res = await request(server)
      .post("/comment")
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({
        rate,
        comment,
        commentMonth,
        revieweeId,
        reviewerId,
      });
    // console.log(res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Comment validation failed: rate: `11` is not a valid enum value for path `rate`."
    );
  });
});
