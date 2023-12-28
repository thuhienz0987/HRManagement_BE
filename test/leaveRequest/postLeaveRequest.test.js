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

describe("Post leave request", () => {
  let loginRes;
  let createdLeaveId; // Store the ID of the created attendance for cleanup

  const userId = "65541b49616c3f67b46e84f2"; //duy - dang nghi 28/12-> 1/1/2024
  const date1 = "2024-1-3";
  const date2 = "2024-1-4";
  const date3 = "2023-12-20";
  const date4 = "2023-12-30";
  const reason = "sick";

  beforeAll(async () => (loginRes = await login(server)));

  test("should post leave request missing reason", async () => {
    const res = await request(server)
      .post(`/leaveRequest`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({
        userId: userId,
        startDate: date1,
        endDate: date2,
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "LeaveRequest validation failed: reason: Reason is missing"
    );
  });

  test("should post leave request missing start date", async () => {
    const res = await request(server)
      .post(`/leaveRequest`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({
        userId: userId,
        reason: reason,
        endDate: date2,
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      'LeaveRequest validation failed: paidLeaveDays: Cast to Number failed for value "NaN" (type number) at path "paidLeaveDays", startDate: Start date is missing'
    );
  });

  test("should post leave request missing end date", async () => {
    const res = await request(server)
      .post(`/leaveRequest`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({
        userId: userId,
        startDate: date1,
        reason: reason,
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      'LeaveRequest validation failed: paidLeaveDays: Cast to Number failed for value "NaN" (type number) at path "paidLeaveDays", endDate: End date is missing'
    );
  });

  test("should post leave request missing reason", async () => {
    const res = await request(server)
      .post(`/leaveRequest`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({
        reason: reason,
        startDate: date1,
        endDate: date2,
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "LeaveRequest validation failed: userId: User id is missing"
    );
  });

  test("should post leave request successfully ", async () => {
    const res = await request(server)
      .post(`/leaveRequest`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({
        userId: userId,
        reason: reason,
        startDate: date1,
        endDate: date2,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Create Leave Request successfully");

    // Check if res.body.attendance exists before accessing its properties
    if (res.body.leaveRequest && res.body.leaveRequest._id) {
      createdLeaveId = res.body.leaveRequest._id;
    } else {
      console.error("Unable to retrieve created leaveRequest ID.");
    }
  });

  test("should post leave request have current date later than start date & throw badRequest  ", async () => {
    const res = await request(server)
      .post(`/leaveRequest`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({
        userId: userId,
        reason: reason,
        startDate: date3,
        endDate: date2,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "The start date must be later than the current date."
    );
  });

  test("should post leave request have end date earlier than start date & throw badRequest   ", async () => {
    const res = await request(server)
      .post(`/leaveRequest`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({
        userId: userId,
        reason: reason,
        startDate: date2,
        endDate: date1,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "The start date must be earlier than the end date."
    );
  });

  test("should post leave request overlap & throw badRequest   ", async () => {
    const res = await request(server)
      .post(`/leaveRequest`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({
        userId: userId,
        reason: reason,
        startDate: date4,
        endDate: date2,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "The user already has overlapping leave requests for the specified time."
    );
  });

  afterAll(async () => {
    // Clean up the created attendance record
    await request(server)
      .delete(`/leaveRequestDeleteForever/${createdLeaveId}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);
  });
});
