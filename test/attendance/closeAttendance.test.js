import request from "supertest";

import serverTest from "../../utils/serverTest";
import Attendance from "../../models/Attendance";

const server = serverTest();

const login = async () => {
    const loginRes = await request(server).post("/login").send({
        email: "mck16082003@gmail.com",
        password: "Mck16082003",
    });

    return loginRes;
};

describe("Close attendance", () => {
    let loginRes;
    let createdAttendanceId; // Store the ID of the created attendance for cleanup

    const idExists = "65541e5b92fb6c12b844f5a4"; //thao
    const idNonExists = "65541e5b91fb6c12b366f5a4";
    const idClosed = "6572d0f5febdbbd6dcac5d4e";
    const idNotClosed = "6572d3befebdbbd6dcac6790";
    const idInvalid = "6572d3be";

    beforeAll(async () => (loginRes = await login(server)));

    test("should close Attendance successfully ", async () => {
        const res = await request(server)
            .put(`/attendance_close/` + idNotClosed)
            .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Closed the attendance successfully.");
        const atd = await Attendance.findById(idNotClosed);
        atd.checkOutTime = undefined;
        await atd.save();
    });

    test("should handle error when Attendance already close", async () => {
        const res = await request(server)
            .put(`/attendance_close/` + idClosed)
            .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Attendance has been closed.");
    });

    test("should handle error when Attendance id not exists", async () => {
        const res = await request(server)
            .put(`/attendance_close/` + idNonExists)
            .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Not found attendance");
    });

    test("should handle error when provide empty id", async () => {
        const res = await request(server)
            .put(`/attendance_close/` + "")
            .set("Authorization", `Bearer ${loginRes.body.accessToken}`);
        expect(res.statusCode).toBe(404);
    });

    test("should handle error when provide invalid id", async () => {
        const res = await request(server)
            .put(`/attendance_close/` + idInvalid)
            .set("Authorization", `Bearer ${loginRes.body.accessToken}`);
        expect(res.statusCode).toBe(400);
    });

    // test("should handle user be attended throw BadRequestError", async () => {
    //     const res = await request(server)
    //         .post(`/attendance`)
    //         .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
    //         .send({ userId: idExists });

    //     expect(res.statusCode).toBe(400);
    //     expect(res.body.message).toBe("You took attendance today.");
    // });
    // test("should handle error when user not found ", async () => {
    //     const res = await request(server)
    //         .post("/attendance")
    //         .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
    //         .send({
    //             userId: idNonExists,
    //         });
    //     // console.log(res);
    //     expect(res.statusCode).toBe(404);
    //     expect(res.body.message).toBe("User not found!");
    // });
    // afterAll(async () => {
    //     // Clean up the created attendance record
    //     await request(server)
    //         .delete(`/attendanceDeleteForever/${createdAttendanceId}`)
    //         .set("Authorization", `Bearer ${loginRes.body.accessToken}`);
    // });
});
