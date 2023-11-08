import Router from "express";
import { confirmSalary, getSalaries, getSalary, postSalary, updateSalary } from "../controllers/salaryController.js";

const salaryRouter = Router()

salaryRouter.get('/salaries', getSalaries);
salaryRouter.get('/salary/:id', getSalary);
salaryRouter.post('/salary',postSalary);
salaryRouter.put('/salary/:id',updateSalary);
salaryRouter.put('/confirmSalary/:id',confirmSalary);

export default salaryRouter;