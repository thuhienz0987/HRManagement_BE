import Router from "express";
import {getComments,getComment,getCommentsByUserId,postComment,updateComment,deleteComment} from "../controllers/commentController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js"

const commentRouter = Router();

commentRouter.get('/comments',verifyRoles(ROLES_LIST.HRManager, ROLES_LIST.Admin),getComments);
commentRouter.get('/comment/:id',getComment);
commentRouter.get('/comments/:userId',getCommentsByUserId);
commentRouter.post('/comment',verifyRoles(ROLES_LIST.HRManager),postComment);
commentRouter.put('/comment/:id',verifyRoles(ROLES_LIST.HRManager),updateComment);
commentRouter.delete('/comment/:id',verifyRoles(ROLES_LIST.HRManager),deleteComment);

export default commentRouter;