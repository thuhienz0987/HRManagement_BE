import Router from "express";
import {
  getComments,
  getComment,
  postComment,
  updateComment,
  deleteComment,
  getCommentsByReviewerId,
  getCommentsByRevieweeId,
  additionalComment,
  getEmployeeNotCommentByTeamIdMonth,
  getDepManagerNotCommentMonth,
  getLeaderNotCommentByDepartmentIdMonth,
} from "../controllers/commentController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js";

const commentRouter = Router();

commentRouter.get("/comments", getComments);
commentRouter.get("/comment/:id", getComment);
commentRouter.get("/comments/:reviewerId", getCommentsByReviewerId);
commentRouter.get("/comments/:revieweeId", getCommentsByRevieweeId);
commentRouter.get(
  "/employees-without-comments/:teamId/:month/:year",
  getEmployeeNotCommentByTeamIdMonth
);
commentRouter.get(
  "/leaders-without-comments/:departmentId/:month/:year",
  getLeaderNotCommentByDepartmentIdMonth
);
commentRouter.get(
  "/managers-without-comments/:month/:year",
  getDepManagerNotCommentMonth
);
commentRouter.post("/comment", postComment);
commentRouter.post("/additionalComment", additionalComment);
commentRouter.put("/comment/:id", updateComment);
commentRouter.delete("/comment/:id", deleteComment);

export default commentRouter;
