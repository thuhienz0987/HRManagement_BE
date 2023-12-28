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

//salaryByUserId
describe("Get salary by userId", () => {
  let loginRes;

  const idExists = "651fc8ea7c42156f148974ab";
  const idNotExists = "651fbdbb4f20aa3dade4c422";

  beforeAll(async () => (loginRes = await login(server)));
  test("should get salary by userId successfully", async () => {
    const res = await request(server)
      .get(`/salaryByUserId/${idExists}`)
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

  test("should handle salary not found and throw NotFoundError", async () => {
    const res = await request(server)
      .get(`/salaryByUserId/${idNotExists}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

    console.log({ res });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Salary not found");
  });
});
