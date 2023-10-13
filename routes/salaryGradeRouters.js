import Router from "express";
import { deleteSalaryGrade, getSalaryGrade, getSalaryGrades, postSalaryGrade, updateSalaryGrade } from "../controllers/salaryGradeController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js";

const salaryGradeRouter = Router()

salaryGradeRouter.get('/salaryGrades',verifyRoles(ROLES_LIST.HRManager,ROLES_LIST.CEO),getSalaryGrades)
salaryGradeRouter.get('/salaryGrade/:id',verifyRoles(ROLES_LIST.HRManager,ROLES_LIST.CEO),getSalaryGrade)
salaryGradeRouter.post('/salaryGrade',verifyRoles(ROLES_LIST.HRManager),postSalaryGrade)
salaryGradeRouter.put('/salaryGrade/:id',verifyRoles(ROLES_LIST.HRManager),updateSalaryGrade)
salaryGradeRouter.delete('/salaryGrade/:id',verifyRoles(ROLES_LIST.HRManager),deleteSalaryGrade)

export default salaryGradeRouter