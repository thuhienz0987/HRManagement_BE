import Router from "express";
import {getCommentDepartments,getCommentDepartment,
    postCommentDepartment,updateCommentDepartment,deleteCommentDepartment} from "../controllers/commentDepartmentController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js"

const commentDepartmentRouter = Router();

commentDepartmentRouter.get('/commentDepartments',getCommentDepartments);
commentDepartmentRouter.get('/commentDepartment/:id',getCommentDepartment);
commentDepartmentRouter.post('/commentDepartment',verifyRoles(ROLES_LIST.CEO),postCommentDepartment);
commentDepartmentRouter.put('/commentDepartment/:id',verifyRoles(ROLES_LIST.CEO),updateCommentDepartment);
commentDepartmentRouter.delete('/commentDepartment/:id',verifyRoles(ROLES_LIST.CEO),deleteCommentDepartment);

export default commentDepartmentRouter;