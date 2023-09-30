import { Router } from "express";
import { deleteAllowance, getAllowance, getAllowances, postAllowance, updateAllowance } from "../controllers/allowanceController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js"

const allowanceRouter = Router();

allowanceRouter.get('/allowances',verifyRoles(ROLES_LIST.HRManager,ROLES_LIST.Admin),getAllowances);
allowanceRouter.get('/allowance/:id',getAllowance);
allowanceRouter.post('/allowance',verifyRoles(ROLES_LIST.Admin),postAllowance);
allowanceRouter.put('/allowance/:id',verifyRoles(ROLES_LIST.Admin),updateAllowance);
allowanceRouter.delete('/allowance/:id',verifyRoles(ROLES_LIST.Admin),deleteAllowance);

export default allowanceRouter;