import { Router } from "express";
import {
  create_user,
  request_change_password,
  change_password,
  update_salary_grade,
  edit_user_profile,
  get_all_user,
  get_user_by_id,
  get_user_by_departmentId,
  get_user_by_teamId,
  get_user_by_createdAtMonth,
  deleteUser,
  get_leader_by_departmentId,
  get_CEO,
  get_HRManager,
} from "../controllers/userController.js";
import uploads from "../middlewares/image.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import isValidResetToken from "../middlewares/user.js";
import ROLES_LIST from "../config/roles_list.js";

const router = Router();

router.post(
  "/create-user",
  verifyRoles(ROLES_LIST.HRManager),
  uploads.single("avatarImage"),
  create_user
);
router.get("/request-change-password/:_id", request_change_password);
router.post("/change-password/:_id", change_password);
router.put("/user/:_id", uploads.single("avatarImage"), edit_user_profile);
router.put(
  "/update-salary-grade/:userId",
  verifyRoles(ROLES_LIST.HRManager),
  update_salary_grade
);
router.get(
  "/all-user",
  verifyRoles(ROLES_LIST.CEO, ROLES_LIST.HRManager),
  get_all_user
);
router.get("/user/:_id", get_user_by_id);
router.get("/ceo", get_CEO);
router.get("/hr-manager", get_HRManager);
router.get("/team-member/:teamId", get_user_by_teamId);
router.get("/department-member/:departmentId", get_user_by_departmentId);
router.get("/leaders/:departmentId", get_leader_by_departmentId);
router.get(
  "/employee-created-at-month/:month/:year",
  get_user_by_createdAtMonth
);
router.delete("/deleteUser/:id", deleteUser);


export default router;
