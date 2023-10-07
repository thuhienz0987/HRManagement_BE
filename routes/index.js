import Router from "express";
import verifyJWT from '../middlewares/verifyJWT.js';
import errorHandler from "../middlewares/errorHandler.js";
import authRouters from './authRouters.js';
import refreshRouters from './refreshRouters.js';
import userRouters from './userRouters.js';
import commentRouter from "./commentRouters.js";
import positionRouters from './positionRouters.js';
import allowanceRouter from "./allowanceRouters.js";
import bonusRouter from "./bonusRouters.js";
import salaryGradeRouter from "./salaryGradeRouters.js"
import holidayRouter from "./holidayRouters.js";

const router = Router();

router.use(authRouters);
router.use(refreshRouters);



router.use(verifyJWT);
router.get('/test', (req, res) => {res.status(200).json('OK')});
router.use(userRouters);
router.use(commentRouter);
router.use(positionRouters);
router.use(allowanceRouter);
router.use(bonusRouter);
router.use(salaryGradeRouter);
router.use(holidayRouter);



// error handler all routes
router.use(errorHandler);

export default router