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

describe("Post attendance", () => {
  let loginRes;
  let createdAttendanceId; // Store the ID of the created attendance for cleanup

  const idExists = "65541e5b92fb6c12b844f5a4"; //thao
  const idNonExists = "65541e5b91fb6c12b366f5a4";

  beforeAll(async () => (loginRes = await login(server)));

  test("should post attendance successfully ", async () => {
    const res = await request(server)
      .post(`/attendance`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({ userId: idExists });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Attendance was successful.");

    // Check if res.body.attendance exists before accessing its properties
    if (res.body.attendance && res.body.attendance._id) {
      createdAttendanceId = res.body.attendance._id;
    } else {
      console.error("Unable to retrieve created attendance ID.");
    }
  });

  test("should handle user be attended throw BadRequestError", async () => {
    const res = await request(server)
      .post(`/attendance`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({ userId: idExists });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("You took attendance today.");
  });
  test("should handle error when user not found ", async () => {
    const res = await request(server)
      .post("/attendance")
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({
        userId: idNonExists,
      });
    // console.log(res);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found!");
  });

  afterAll(async () => {
    // Clean up the created attendance record
    await request(server)
      .delete(`/attendanceDeleteForever/${createdAttendanceId}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);
  });
});
