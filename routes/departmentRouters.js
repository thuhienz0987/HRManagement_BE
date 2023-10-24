import Router from "express";
import { getDepartments,getDepartment,postDepartment,updateDepartment,deleteDepartment } from "../controllers/departmentController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js"

const departmentRouter = Router();

departmentRouter.get('/departments',getDepartments);
departmentRouter.get('/department/:_id',getDepartment);
departmentRouter.post('/department',verifyRoles(ROLES_LIST.HRManager),postDepartment);
departmentRouter.put('/department/:_id',verifyRoles(ROLES_LIST.HRManager),updateDepartment);
departmentRouter.delete('/department/:_id',verifyRoles(ROLES_LIST.HRManager),deleteDepartment);

export default departmentRouter;