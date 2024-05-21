import { Router } from "express";
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
} from "../controllers/groupChatController.js";
import uploads from "../middlewares/image.js";
import ROLES_LIST from "../config/roles_list.js";
import verifyRoles from "../middlewares/verifyRoles.js";

const groupChatRouter = Router();

groupChatRouter.post(
  "/create-group/:userId",
  verifyRoles(
    ROLES_LIST.CEO,
    ROLES_LIST.DepartmentManager,
    ROLES_LIST.HRManager,
    ROLES_LIST.TeamManager
  ),
  uploads.single("groupImage"),
  createGroup
);
groupChatRouter.put(
  "/update-group/:_id",
  verifyRoles(
    ROLES_LIST.CEO,
    ROLES_LIST.DepartmentManager,
    ROLES_LIST.HRManager,
    ROLES_LIST.TeamManager
  ),
  uploads.single("groupImage"),
  updateGroup
);
groupChatRouter.get("/groups/:creatorId", getGroups);
groupChatRouter.get("/group/:id", getGroupById);
groupChatRouter.delete("/group/:_id", deleteGroup);

export default groupChatRouter;
