import { Router } from "express";
import {
    deleteAllowance,
    getAllowance,
    getAllowances,
    postAllowance,
    updateAllowance,
} from "../controllers/allowanceController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js";

const allowanceRouter = Router();

allowanceRouter.get("/allowances", getAllowances);
allowanceRouter.get("/allowance/:id", getAllowance);
allowanceRouter.post(
    "/allowance",
    verifyRoles(ROLES_LIST.HRManager),
    postAllowance
);
allowanceRouter.put(
    "/allowance/:id",
    verifyRoles(ROLES_LIST.HRManager),
    updateAllowance
);
allowanceRouter.delete(
    "/allowance/:id",
    verifyRoles(ROLES_LIST.HRManager),
    deleteAllowance
);

export default allowanceRouter;
