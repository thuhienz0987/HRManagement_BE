import Router from "express";
import verifyJWT from '../middlewares/verifyJWT.js';
import errorHandler from "../middlewares/errorHandler.js";
import authRouters from './authRouters.js';
import refreshRouters from './refreshRouters.js';

import userRouters from './userRouters.js';
import commentRouter from "./commentRouters.js";
import teamRouter from "./teamRouters.js";
import departmentRouter from "./departmentRouters.js";
import positionRouters from './positionRouters.js';
import allowanceRouter from "./allowanceRouters.js";
import leaveRequestRouter from "./leaveRequestRouters.js";
import holidayRouter from "./holidayRouters.js";
import attendanceRouter from "./attendanceRouters.js";
import eventRouter from "./eventRouters.js";
import salaryRouter from "./salaryRouters.js";

const router = Router();

router.use(authRouters);
router.use(refreshRouters);



router.use(verifyJWT);
router.get('/test', (req, res) => {res.status(200).json('OK')});
router.use(userRouters);
router.use(commentRouter);
router.use(teamRouter);
router.use(departmentRouter);
router.use(positionRouters);
router.use(allowanceRouter);
router.use(leaveRequestRouter);
router.use(holidayRouter);
router.use(attendanceRouter);
router.use(eventRouter);
router.use(salaryRouter);


// error handler all routes
router.use(errorHandler);

export default router