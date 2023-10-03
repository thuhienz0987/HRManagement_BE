import Router from "express";
import { getDepartments,getDepartment,getDepartmentsByDivisionId,postDepartment,updateDepartment,deleteDepartment } 
    from "../controllers/departmentController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js"

const departmentRouter = Router();

departmentRouter.get('/departments',verifyRoles(ROLES_LIST.Admin),getDepartments);
departmentRouter.get('/department/:_id',getDepartment);
departmentRouter.get('/departments/:_id',getDepartmentsByDivisionId);
departmentRouter.post('/department',verifyRoles(ROLES_LIST.Admin),postDepartment);
departmentRouter.put('/department/:_id',verifyRoles(ROLES_LIST.Admin),updateDepartment);
departmentRouter.delete('/department/:_id',verifyRoles(ROLES_LIST.Admin),deleteDepartment);

export default departmentRouter;