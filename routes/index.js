import Router from "express";
import verifyJWT from '../middlewares/verifyJWT.js';
import errorHandler from "../middlewares/errorHandler.js";
import authRouters from './authRouters.js';
import refreshRouters from './refreshRouters.js';
import userRouters from './userRouters.js';
import roleRouter from './roleRouters.js';

const router = Router();

router.use(authRouters);
router.use(refreshRouters);

router.use(roleRouter);
router.use(verifyJWT);
router.get('/test', (req, res) => {res.status(200).json('OK')});
router.use(userRouters);

// error handler all routes
router.use(errorHandler);

export default router