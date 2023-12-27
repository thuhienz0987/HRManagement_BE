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

//attendanceByMonth/:month/:year/:userId
describe("Get attendance by userId in month", () => {
  let loginRes;

  const idExists = "651fc8ea7c42156f148974ab"; //karik
  const monthExist = 11;
  const year = 2023;
  const monthNotExists = 9;

  beforeAll(async () => (loginRes = await login(server)));
  test("should get attendance by userId in month successfully and return attendances in month", async () => {
    const res = await request(server)
      .get(`/attendanceByMonth/${monthExist}/${year}/${idExists}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

    expect(res.statusCode).toBe(200);
    // expect(res.body.userId).toBeDefined();

    // Check if userId is an array and not empty
    if (Array.isArray(res.body.userId) && res.body.userId.length > 0) {
      // Check if the user ID exists in the array of salaries
      const userSalary = res.body.userId.find(
        (salary) => salary._id === idExists
      );
      expect(userSalary).toBeDefined();
    }
  });

  test("should handle attendances by user id in month not found and throw NotFoundError", async () => {
    const res = await request(server)
      .get(`/attendanceByMonth/${monthNotExists}/${year}/${idExists}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

    console.log({ res });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe(
      `No attendance found for ${monthNotExists}/${year}`
    );
  });
});
