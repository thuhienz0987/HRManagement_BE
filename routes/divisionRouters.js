import Router from "express";
import { getDivisions,getDivision,postDivision,updateDivision,deleteDivision } from "../controllers/divisionController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js"

const divisionRouter = Router();

divisionRouter.get('/divisions',getDivisions);
divisionRouter.get('/division/:_id',getDivision);
divisionRouter.post('/division',verifyRoles(ROLES_LIST.Admin),postDivision);
divisionRouter.put('/division/:_id',verifyRoles(ROLES_LIST.Admin),updateDivision);
divisionRouter.delete('/division/:_id',verifyRoles(ROLES_LIST.Admin),deleteDivision);

export default divisionRouter;