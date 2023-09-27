import { Router } from "express";
// import roleRouter from './roleRouters'
import roleRouter from './roleRouters.js'
import allowanceRouter from "./allowanceRouters.js";

const router = Router();
router.use(roleRouter);
router.use(allowanceRouter);

export default router