import Router from "express";
import { getDepartments,getDepartment,postDepartment,updateDepartment,deleteDepartment, getDepartmentEmployeeRatio, getAbsenteeismRatio } from "../controllers/departmentController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js"

const departmentRouter = Router();

departmentRouter.get('/departments',getDepartments);
departmentRouter.get('/department/:id',getDepartment);
departmentRouter.post('/department',verifyRoles(ROLES_LIST.HRManager),postDepartment);
departmentRouter.put('/department/:id',verifyRoles(ROLES_LIST.HRManager),updateDepartment);
departmentRouter.delete('/department/:id',verifyRoles(ROLES_LIST.HRManager),deleteDepartment);
departmentRouter.get('/departmentEmployeeRatio',getDepartmentEmployeeRatio);
departmentRouter.get('/departmentAbsenteeismRatio/:month/:year',getAbsenteeismRatio);




export default departmentRouter;