import Router from "express";
import {getComments,getComment,getCommentsByUserId,postComment,updateComment,deleteComment} from "../controllers/commentController.js";
const commentRouter = Router();

commentRouter.get('/comments',getComments);
commentRouter.get('/comment/:id',getComment);
commentRouter.get('/comments/:userId',getCommentsByUserId);
commentRouter.post('/comment',postComment);
commentRouter.put('/comment/:id',updateComment);
commentRouter.delete('/comment/:id',deleteComment);

export default commentRouter;