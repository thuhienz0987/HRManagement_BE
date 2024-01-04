import request from "supertest";
import fs from "fs";

import serverTest from "../../utils/serverTest";
import {
  userMissAddress,
  userMissBirthday,
  userMissEmail,
  userMissEthnicGroup,
  userMissGender,
  userMissHomeTown,
  userMissLevel,
  userMissName,
  userMissPhoneNumber,
  userMissPosition,
  userValid,
} from "../../utilsTest/user";
import User from "../../models/User";

const server = serverTest();

const infiniteToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJ1c2VySWQiOiI2NTFiOTE5NDk4YmYzMzk2MDM5YjEyZmMiLCJyb2xlcyI6WyIzMjA0IiwiMjAwMSIsIjE5ODQiXX0sImlhdCI6MTcwMzY3ODI1MCwiZXhwIjoxNzE5MjMwMjUwfQ.FXSMEb5QI9zjdAF0ejzjzvWiCquGrL-ej0KjpY7ERlA";

describe("Create User", () => {
  describe("Successfully", () => {
    test("should return create user successfully", async () => {
      const imageURL = "test/user/testImage/testImage.png";
      const imageBuffer = fs.readFileSync(imageURL);

      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "multipart/form-data")
        .attach("avatarImage", imageBuffer, new Date() + "_avatarImage.png")
        .field("email", userValid.email)
        .field("birthday", userValid.birthday)
        .field("positionId", userValid.positionId)
        .field("address", userValid.address)
        .field("departmentId", userValid.departmentId)
        .field("ethnicGroup", userValid.ethnicGroup)
        .field("gender", userValid.gender)
        .field("homeTown", userValid.homeTown)
        .field("level", userValid.level)
        .field("name", userValid.name)
        .field("phoneNumber", userValid.phoneNumber)
        .field("teamId", userValid?.teamId);

      // expect(res.statusCode).toBe(201);
      // expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("New user created!");
      await User.deleteOne({ email: userValid.email });
    });
  });

  describe("Error by position id", () => {
    test("should return status 404 when position not found", async () => {
      const positionNonExistId = "6528dcc793577d823f7213c2";

      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "application/json")
        .send({ ...userValid, positionId: positionNonExistId });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe(
        `The position with position _id ${positionNonExistId} does not exist`
      );
    });

    test("should return status 410 when position have been deleted", async () => {
      const positionDeletedId = "657da370fe477c63cdc65f60";

      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "application/json")
        .send({ ...userValid, positionId: positionDeletedId });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        `Position with position _id ${positionDeletedId} is deleted`
      );
    });

    test("should return status 400 when position Id is missing", async () => {
      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "application/json")
        .send(userMissPosition);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'Cast to ObjectId failed for value "" (type string) at path "_id" for model "Position"'
      );
    });
  });

  describe("Error by email", () => {
    test("should return status 400 when user with email registered", async () => {
      const emailExisted = "phuoctriqh01062003@gmail.com";

      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "application/json")
        .send({ ...userValid, email: emailExisted });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(`User with email registered`);
    });

    test("should return status 400 when user with email invalid", async () => {
      const emailInvalid = "obito01072003gmail.com";

      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "application/json")
        .send({ ...userValid, email: emailInvalid });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(`Invalid email`);
    });

    test("should return status 400 when email is missing", async () => {
      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "application/json")
        .send(userMissEmail);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Email is required");
    });
  });

  describe("Error by name", () => {
    test("should return status 400 when name is missing", async () => {
      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "application/json")
        .send(userMissName);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        "User validation failed: name: Name is missing"
      );
    });
  });

  describe("Error by home town", () => {
    test("should return status 400 when home town is missing", async () => {
      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "application/json")
        .send(userMissHomeTown);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        "User validation failed: homeTown: Home town is missing"
      );
    });
  });

  describe("Error by gender", () => {
    test("should return status 400 when gender is missing", async () => {
      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "application/json")
        .send(userMissGender);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        "User validation failed: gender: Gender is missing"
      );
    });
  });

  describe("Error by phone number", () => {
    test("should return status 400 when phone number is missing", async () => {
      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "application/json")
        .send(userMissPhoneNumber);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        "User validation failed: phoneNumber: Please tell us your phone number"
      );
    });

    test("should return status 400 when phone number have less 9 characters", async () => {
      const minPhoneNumber = "12345678";

      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "application/json")
        .send({ ...userValid, phoneNumber: minPhoneNumber });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        "User validation failed: phoneNumber: The phone number should have a minimum length of 9 characters"
      );
    });

    test("should return status 400 when phone number have more 11 characters", async () => {
      const maxPhoneNumber = "123456789100";

      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "application/json")
        .send({ ...userValid, phoneNumber: maxPhoneNumber });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        "User validation failed: phoneNumber: The phone number should have a maximum length of 11 characters"
      );
    });
  });

  describe("Error by birthday", () => {
    test("should return status 400 when birthday is missing", async () => {
      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "application/json")
        .send(userMissBirthday);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Birthday is missing");
    });
  });

  describe("Error by ethnic group", () => {
    test("should return status 400 when ethnic group is missing", async () => {
      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "application/json")
        .send(userMissEthnicGroup);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        "User validation failed: ethnicGroup: Ethnic group is missing"
      );
    });
  });

  describe("Error by level", () => {
    test("should return status 400 when level is missing", async () => {
      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "application/json")
        .send(userMissLevel);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        "User validation failed: level: Level is missing"
      );
    });
  });

  describe("Error by address", () => {
    test("should return status 400 when address is missing", async () => {
      const res = await request(server)
        .post("/create-user")
        .set("Authorization", `Bearer ${infiniteToken}`)
        .set("Content-Type", "application/json")
        .send(userMissAddress);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        "User validation failed: address: Address is missing"
      );
    });
  });
});
