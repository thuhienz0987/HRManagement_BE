import { logout_post } from "../../controllers/authController";
import User from "../../models/User";

jest.mock("../../models/User");
describe("logout_post controller unit tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { cookies: {}, headers: {}, query: {} };
    res = {
      sendStatus: jest.fn(),
      clearCookie: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should send 204 if no token exists", async () => {
    await logout_post(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(204);
    expect(res.clearCookie).not.toHaveBeenCalled();
  });

  it("should send 204 if jwt does not belong to any user", async () => {
    req.cookies.jwt = "invalidToken";

    User.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    await logout_post(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: "invalidToken" });
    expect(res.clearCookie).toHaveBeenCalledWith("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  it("should clear refreshToken and send 204 if user is found", async () => {
    req.cookies.jwt = "validToken";
    const foundUser = {
      refreshToken: "validToken",
      save: jest.fn().mockResolvedValue({}),
    };

    User.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(foundUser),
    });

    await logout_post(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: "validToken" });
    expect(foundUser.save).toHaveBeenCalled();
    expect(res.clearCookie).toHaveBeenCalledWith("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });
});
