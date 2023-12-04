import Router from "express";
import {
  getLeaveRequests,
  getLeaveRequest,
  getRemainingLeaveRequestDaysByUserId,
  getLeaveRequestsByUserId,
  postLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  ChangeStatus,
} from "../controllers/leaveRequestController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js";

const leaveRequestRouter = Router();

leaveRequestRouter.get(
  "/leaveRequests",
  verifyRoles(ROLES_LIST.HRManager, ROLES_LIST.CEO),
  getLeaveRequests
);
leaveRequestRouter.get(
  "/leaveRequest/:id",
  verifyRoles(ROLES_LIST.HRManager, ROLES_LIST.CEO),
  getLeaveRequest
);
leaveRequestRouter.get("/leaveRequests/:userId", getLeaveRequestsByUserId);
leaveRequestRouter.get(
  "/remainingLeaveRequestDays/:userId",
  getRemainingLeaveRequestDaysByUserId
);
leaveRequestRouter.post("/leaveRequest", postLeaveRequest);
leaveRequestRouter.put(
  "/leaveRequest/:id",
  updateLeaveRequest
);
leaveRequestRouter.put("/approverLeaveRequest/:id", ChangeStatus);
leaveRequestRouter.delete(
  "/leaveRequest/:id",
  deleteLeaveRequest
);

export default leaveRequestRouter;
