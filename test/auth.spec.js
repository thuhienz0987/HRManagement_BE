// import { login_post } from "../controllers/authController";
// import User from "../models/User";
// import PasswordValidator from "password-validator";

// let passwordSchema = new PasswordValidator();
// jest.mock("../models/User");

// describe("POST /login", () => {
//   const request = {
//     body: {
//       email: "sontung01062003@gmail.com",
//       password: "Sontung01062003",
//     },
//   };
//   const response = {
//     status: jest.fn((x) => x),
//     json: jest.fn((x) => x),
//   };
//   it("should return access token and user on a successful login", async () => {
//     User.findOne.mockImplementationOnce(() => ({
//       // Mock user data for findOne
//       email: "sontung01062003@gmail.com",
//       password: "$2b$10$GYNFLE4A0m11MWhg0iuPSORnHVwlnLge2FnBZ0mmC2IZRGHC3Q2ii", // Replace with actual hashed password
//     }));

//     const userInstance = new User(); // Create a user instance
//     userInstance.comparePassword = jest.fn(() => true); // Mock comparePassword method
//     User.findOne.mockReturnValueOnce(userInstance); // Return user instance from findOne

//     await login_post(request, response);

//     // Assertions
//     expect(response.status).toHaveBeenCalledWith(200);
//     expect(response.json).toHaveBeenCalledWith(
//       expect.objectContaining({
//         accessToken: expect.any(String),
//         user: expect.any(Object),
//       })
//     );

//     // Additional assertion for refreshed token
//     expect(userInstance.refreshToken).toEqual(expect.any(String)); // Ensure refreshToken is assigned and saved for the user
//   });
// });
