import Router from "express";
import { deleteSalaryGrade, getSalaryGrade, getSalaryGrades, postSalaryGrade, updateSalaryGrade } from "../controllers/salaryGradeController.js";

const salaryGradeRouter = Router()

salaryGradeRouter.get('/salaryGrades',getSalaryGrades)
salaryGradeRouter.get('/salaryGrade/:id',getSalaryGrade)
salaryGradeRouter.post('/salaryGrade',postSalaryGrade)
salaryGradeRouter.put('/salaryGrade/:id',updateSalaryGrade)
salaryGradeRouter.delete('/salaryGrade/:id',deleteSalaryGrade)

export default salaryGradeRouter