import { Router } from "express";
// import roleRouter from './roleRouters'
import roleRouter from './roleRouters.js'

const router = Router();
router.use(roleRouter);

export default router