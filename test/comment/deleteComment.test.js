import request from "supertest";

import serverTest from "../../utils/serverTest";
import Comment from "../../models/Comment";

const server = serverTest();

const login = async () => {
  const loginRes = await request(server).post("/login").send({
    email: "sontung01062003@gmail.com",
    password: "Sontung01062003",
  });

  return loginRes;
};

describe("Delete Comment", () => {
  let loginRes;
  const invalidId = "abc";
  const existedCommentId = "657974832fc86a9e92adb6c8";
  const nonExistedCommentId = "65541e3a92fb6c12b844f5a0";
  beforeAll(async () => (loginRes = await login()));

  test("should delete comment successfully when given the exist comment id", async () => {
    const res = await request(server)
      .delete(`/comment/${existedCommentId}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Deleted Comment successfully");
    await Comment.findByIdAndUpdate(
      res.body.comment._id,
      { isDeleted: false },
      { new: true }
    );
  });
  test("should handle not found comment when given the non exist comment id", async () => {
    const res = await request(server)
      .delete(`/comment/${nonExistedCommentId}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Comment not found");
  });
  test("should handle when given the invalid comment id", async () => {
    const res = await request(server)
      .delete(`/comment/${invalidId}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

    expect(res.statusCode).toBe(400);
  });
});
