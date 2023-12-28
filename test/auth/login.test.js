import request from "supertest";

import serverTest from "../../utils/serverTest";

const server = serverTest();

describe("Login", () => {
  test("should return the status 200 when given the correct email and correct password", async () => {
    const correctEmail = "sontung01062003@gmail.com";
    const correctPassword = "Sontung01062003";
    const res = await request(server).post("/login").send({
      email: correctEmail,
      password: correctPassword,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login successfully");
    expect(res.body.accessToken).not.toBeNull();
    expect(res.body.user.refreshToken).not.toBeNull();
    expect(res.body.user.password).toBeUndefined();
  });
  test("should handle user not found when given the incorrect email", async () => {
    const incorrectEmail = "sontung@gmail.com";
    const correctPassword = "Sontung01062003";
    const res = await request(server).post("/login").send({
      email: incorrectEmail,
      password: correctPassword,
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Incorrect email");
    expect(res.body.accessToken).toBeUndefined();
    expect(res.body.user).toBeUndefined();
  });
  test("should handle user not found when given the incorrect password", async () => {
    const correctEmail = "sontung01062003@gmail.com";
    const incorrectPassword = "Sontung16082003";
    const res = await request(server).post("/login").send({
      email: correctEmail,
      password: incorrectPassword,
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Incorrect password");
    expect(res.body.accessToken).toBeUndefined();
    expect(res.body.user).toBeUndefined();
  });
  test("should return the status 401 when given the invalid email", async () => {
    const invalidEmail = "sontung01062003gmail.com";
    const validPassword = "Sontung16082003";
    const res = await request(server).post("/login").send({
      email: invalidEmail,
      password: validPassword,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid email");
    expect(res.body.accessToken).toBeUndefined();
    expect(res.body.user).toBeUndefined();
  });
  describe("given the invalid password", () => {
    test("should handle password have a minimum length of 8 characters", async () => {
      const validEmail = "sontung01062003@gmail.com";
      const invalidPassword = "Sontu01";
      const validateResult = [
        {
          validation: "min",
          arguments: 8,
          message: "The string should have a minimum length of 8 characters",
        },
      ];
      const res = await request(server).post("/login").send({
        email: validEmail,
        password: invalidPassword,
      });

      console.log(res.body.message);
      expect(res.statusCode).toBe(400);
      expect(res.body.message[0].message).toBe(validateResult[0].message);
      expect(res.body.accessToken).toBeUndefined();
      expect(res.body.user).toBeUndefined();
    });
    test("should handle password have a maximum length of 16 characters", async () => {
      const validEmail = "sontung01062003@gmail.com";
      const invalidPassword = "Sontung0106200323932832";
      const validateResult = [
        {
          validation: "max",
          arguments: 16,
          message: "The string should have a maximum length of 16 characters",
        },
      ];
      const res = await request(server).post("/login").send({
        email: validEmail,
        password: invalidPassword,
      });

      console.log(res.body.message);
      expect(res.statusCode).toBe(400);
      expect(res.body.message[0].message).toBe(validateResult[0].message);
      expect(res.body.accessToken).toBeUndefined();
      expect(res.body.user).toBeUndefined();
    });
    test("should handle password have a minimum of 1 lowercase letter", async () => {
      const validEmail = "sontung01062003@gmail.com";
      const invalidPassword = "SONTUNG01062003";
      const validateResult = [
        {
          validation: "lowercase",
          message: "The string should have a minimum of 1 lowercase letter",
        },
      ];
      const res = await request(server).post("/login").send({
        email: validEmail,
        password: invalidPassword,
      });

      console.log(res.body.message);
      expect(res.statusCode).toBe(400);
      expect(res.body.message[0].message).toBe(validateResult[0].message);
      expect(res.body.accessToken).toBeUndefined();
      expect(res.body.user).toBeUndefined();
    });
    test("should handle password have a minimum of 1 uppercase letter", async () => {
      const validEmail = "sontung01062003@gmail.com";
      const invalidPassword = "sontung01062003";
      const validateResult = [
        {
          validation: "uppercase",
          message: "The string should have a minimum of 1 uppercase letter",
        },
      ];
      const res = await request(server).post("/login").send({
        email: validEmail,
        password: invalidPassword,
      });

      console.log(res.body.message);
      expect(res.statusCode).toBe(400);
      expect(res.body.message[0].message).toBe(validateResult[0].message);
      expect(res.body.accessToken).toBeUndefined();
      expect(res.body.user).toBeUndefined();
    });

    test("should handle password have spaces", async () => {
      const validEmail = "sontung01062003@gmail.com";
      const invalidPassword = "Sontung 01062003";
      const validateResult = [
        {
          validation: "spaces",
          inverted: true,
          message: "The string should not have spaces",
        },
      ];
      const res = await request(server).post("/login").send({
        email: validEmail,
        password: invalidPassword,
      });

      console.log(res.body.message);
      expect(res.statusCode).toBe(400);
      expect(res.body.message[0].message).toBe(validateResult[0].message);
      expect(res.body.accessToken).toBeUndefined();
      expect(res.body.user).toBeUndefined();
    });
  });
});
