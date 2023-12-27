import request from "supertest";

import serverTest from "../../utils/serverTest";

const server = serverTest();

const login = async () => {
  const loginRes = await request(server).post("/login").send({
    email: "mck16082003@gmail.com",
    password: "Mck16082003",
  });

  return loginRes;
};

describe("Get user by userId", () => {
  let loginRes;

  const idExists = "651fbdbb4f20aa3dade4c43a";
  const idNotExists = "651fbdbb4f20aa3dade4c422";

  beforeAll(async () => (loginRes = await login(server)));

  test("should get user by id successfully and return user info", async () => {
    const res = await request(server)
      .get(`/user/${idExists}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(idExists);
  });

  test("should handle user not found and throw NotFoundError", async () => {
    const res = await request(server)
      .get(`/user/${idNotExists}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

    console.log({ res });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });
});
