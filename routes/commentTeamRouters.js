import Router from "express";
import {getCommentTeams,getCommentTeam,getCommentTeamsByDepartmentId,
    postCommentTeam,updateCommentTeam,deleteCommentTeam} from "../controllers/commentTeamController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js"

const commentTeamRouter = Router();

commentTeamRouter.get('/commentTeams',getCommentTeams);
commentTeamRouter.get('/commentTeam/:id',getCommentTeam);
commentTeamRouter.get('/commentTeams/:departmentId',getCommentTeamsByDepartmentId);
commentTeamRouter.post('/commentTeam',verifyRoles(ROLES_LIST.DepartmentManager),postCommentTeam);
commentTeamRouter.put('/commentTeam/:id',verifyRoles(ROLES_LIST.DepartmentManager),updateCommentTeam);
commentTeamRouter.delete('/commentTeam/:id',verifyRoles(ROLES_LIST.DepartmentManager),deleteCommentTeam);

export default commentTeamRouter;