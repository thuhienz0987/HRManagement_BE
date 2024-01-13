import Router from "express";
import {
  confirmSalary,
  getSalaries,
  getSalary,
  getSalaryByMonthYear,
  getAllSalariesByMonthYear,
  getSalaryByUserId,
  postSalary,
  updateSalary,
  getPercentSalariesByYear,
} from "../controllers/salaryController.js";

const salaryRouter = Router();

salaryRouter.get("/salaries", getSalaries);
salaryRouter.get("/salary/:id", getSalary);
salaryRouter.get("/salaryByUserId/:id", getSalaryByUserId);
salaryRouter.get(
  "/salariesByMonthYear/:month/:year",
  getAllSalariesByMonthYear
);
salaryRouter.get("/statisticSalariesByYear/:year", getPercentSalariesByYear);
salaryRouter.get(
  "/salaryByUserIdMonthYear/:userId/:month/:year",
  getSalaryByMonthYear
);

salaryRouter.post("/salary", postSalary);
salaryRouter.put("/salary/:id", updateSalary);
salaryRouter.put("/confirmSalary/:id", confirmSalary);

export default salaryRouter;
