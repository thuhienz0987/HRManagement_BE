import Router from "express";
import {getComments,getComment,getCommentsByUserId,postComment,updateComment,deleteComment} from "../controllers/commentController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js"

const commentRouter = Router();

commentRouter.get('/comments',getComments);
commentRouter.get('/comment/:id',getComment);
commentRouter.get('/comments/:userId',getCommentsByUserId);
commentRouter.post('/comment',verifyRoles(ROLES_LIST.TeamManager),postComment);
commentRouter.put('/comment/:id',verifyRoles(ROLES_LIST.TeamManager),updateComment);
commentRouter.delete('/comment/:id',verifyRoles(ROLES_LIST.TeamManager),deleteComment);

export default commentRouter;