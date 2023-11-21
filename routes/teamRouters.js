import Router from "express";
import { getTeams,getTeam,getTeamsByDepartmentId,postTeam,updateTeam,deleteTeam } 
    from "../controllers/teamController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js"

const teamRouter = Router();

teamRouter.get('/teams',getTeams);
teamRouter.get('/team/:id',getTeam);
teamRouter.get('/teams/:departmentId',verifyRoles(ROLES_LIST.CEO,ROLES_LIST.HRManager,ROLES_LIST.DepartmentManager),getTeamsByDepartmentId);
teamRouter.post('/team',verifyRoles(ROLES_LIST.HRManager),postTeam);
teamRouter.put('/team/:id',verifyRoles(ROLES_LIST.HRManager),updateTeam);
teamRouter.delete('/team/:id',verifyRoles(ROLES_LIST.HRManager),deleteTeam);

export default teamRouter;