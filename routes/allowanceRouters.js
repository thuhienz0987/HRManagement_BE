import { Router } from "express";
import { deleteAllowance, getAllowance, getAllowances, postAllowance, updateAllowance } from "../controllers/allowanceController.js";

const allowanceRouter = Router();

allowanceRouter.get('/allowances',getAllowances);
allowanceRouter.get('/allowance/:id',getAllowance);
allowanceRouter.post('/allowance',postAllowance);
allowanceRouter.put('/allowance/:id',updateAllowance);
allowanceRouter.delete('/allowance/:id',deleteAllowance);

export default allowanceRouter;