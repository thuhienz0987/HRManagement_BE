import Router from "express";
import { deleteSalaryGrade, getSalaryGrade, getSalaryGrades, postSalaryGrade, updateSalaryGrade } from "../controllers/salaryGradeController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js";

const salaryGradeRouter = Router()

salaryGradeRouter.get('/salaryGrades',verifyRoles(ROLES_LIST.HRManager,ROLES_LIST.Admin),getSalaryGrades)
salaryGradeRouter.get('/salaryGrade/:id',getSalaryGrade)
salaryGradeRouter.post('/salaryGrade',verifyRoles(ROLES_LIST.Admin),postSalaryGrade)
salaryGradeRouter.put('/salaryGrade/:id',verifyRoles(ROLES_LIST.Admin),updateSalaryGrade)
salaryGradeRouter.delete('/salaryGrade/:id',verifyRoles(ROLES_LIST.Admin),deleteSalaryGrade)

export default salaryGradeRouter