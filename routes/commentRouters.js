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
  getEmployeeNotCommentByDepartmentIdMonth,
} from "../controllers/commentController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js";

const commentRouter = Router();

commentRouter.get("/comments", getComments);
commentRouter.get("/comment/:id", getComment);
commentRouter.get("/comments/:reviewerId", getCommentsByReviewerId);
commentRouter.get("/comments/:revieweeId", getCommentsByRevieweeId);
commentRouter.get(
  "/users-without-comments/:departmentId/:month/:year",
  getEmployeeNotCommentByDepartmentIdMonth
);
commentRouter.post("/comment", postComment);
commentRouter.post("/additionalComment", additionalComment);
commentRouter.put("/comment/:id", updateComment);
commentRouter.delete("/comment/:id", deleteComment);

export default commentRouter;
