import { Router } from "express";
import {
  addMembers,
  getMembersByGroupId,
} from "../controllers/groupMemberController.js";
import ROLES_LIST from "../config/roles_list.js";
import verifyRoles from "../middlewares/verifyRoles.js";

const groupMemberRouter = Router();

groupMemberRouter.post(
  "/add-members",
  verifyRoles(
    ROLES_LIST.CEO,
    ROLES_LIST.DepartmentManager,
    ROLES_LIST.HRManager,
    ROLES_LIST.TeamManager
  ),
  addMembers
);
groupMemberRouter.get("/members/:groupId", getMembersByGroupId);

export default groupMemberRouter;
