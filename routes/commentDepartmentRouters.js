import Router from "express";
import {getCommentDepartments,getCommentDepartment,getCommentDepartmentsByUserId,
    postCommentDepartment,updateCommentDepartment,deleteCommentDepartment} from "../controllers/commentDepartmentController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js"

const commentDepartmentRouter = Router();

commentDepartmentRouter.get('/commentDepartments',verifyRoles(ROLES_LIST.HRManager, ROLES_LIST.Admin),getCommentDepartments);
commentDepartmentRouter.get('/commentDepartment/:id',getCommentDepartment);
commentDepartmentRouter.get('/commentDepartments/:userId',getCommentDepartmentsByUserId);
commentDepartmentRouter.post('/commentDepartment',verifyRoles(ROLES_LIST.HRManager),postCommentDepartment);
commentDepartmentRouter.put('/commentDepartment/:id',verifyRoles(ROLES_LIST.HRManager),updateCommentDepartment);
commentDepartmentRouter.delete('/commentDepartment/:id',verifyRoles(ROLES_LIST.HRManager),deleteCommentDepartment);

export default commentDepartmentRouter;