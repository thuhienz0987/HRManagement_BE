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

describe("Get team by id", () => {
  let loginRes;

  const idExists = "6527a6f1281c4dd64db6dae4";
  const idNotExists = "651fbdbb4f20aa3dade4c422";
  const idIsDeleted = "65733f0d0546751e7dfeebc1";

  beforeAll(async () => (loginRes = await login(server)));

  test("should get team by id successfully ", async () => {
    const res = await request(server)
      .get(`/team/${idExists}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(idExists);
  });

  test("should handle team not found and throw NotFoundError", async () => {
    const res = await request(server)
      .get(`/team/${idNotExists}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

    console.log({ res });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Team not found");
  });

  test("should handle team is deleted", async () => {
    const res = await request(server)
      .get(`/team/${idIsDeleted}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

    console.log({ res });

    expect(res.statusCode).toBe(410);
    expect(res.body).toBe("Team is deleted");
  });
});
