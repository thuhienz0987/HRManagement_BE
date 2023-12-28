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

//comments-by-revieweeId
describe("Get comment by revieweeId", () => {
    let loginRes;

    const idExists = "651fc8ea7c42156f148974ab"; //karik
    const idNotExists = "651fbdbb4f20aa3dade4c422"; // fake
    const idHaveNotComment = "656f40567d961f88773c4416"; //trung
    const idIsDeleted = "65733cab007e4c890aff20ee"; //phat

    beforeAll(async () => (loginRes = await login(server)));
    test("should get comment by revieweeId successfully", async () => {
        const res = await request(server)
            .get(`/comments-by-revieweeId/${idExists}`)
            .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

        expect(res.statusCode).toBe(200);

        if (
            Array.isArray(res.body.revieweeId) &&
            res.body.revieweeId.length > 0
        ) {
            const userSalary = res.body.userId.find(
                (comment) => comment.revieweeId === idExists
            );
            expect(userSalary).toBeDefined();
        }
    });

    test("should handle reviewee not found and throw NotFoundError", async () => {
        const res = await request(server)
            .get(`/comments-by-revieweeId/${idNotExists}`)
            .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

        console.log({ res });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe(
            `Reviewee with id ${idNotExists} does not exist`
        );
    });

    test("should handle comments by reviewee id not found and throw NotFoundError", async () => {
        const res = await request(server)
            .get(`/comments-by-revieweeId/${idHaveNotComment}`)
            .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

        console.log({ res });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Not found comments for reviewee id");
    });

    test("should handle reviewee is deleted", async () => {
        const res = await request(server)
            .get(`/comments-by-revieweeId/${idIsDeleted}`)
            .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

        console.log({ res });

        expect(res.statusCode).toBe(410);
        expect(res.body).toBe("Reviewee is deleted");
    });

    test("should handle reviewee id is not provided", async () => {
        const res = await request(server)
            .get(`/comments-by-revieweeId/`)
            .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

        console.log({ res });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Api not found");
    });
});
