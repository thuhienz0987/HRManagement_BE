import Router from "express";
import {getPositions,getPosition,postPosition,updatePosition,deletePosition} from "../controllers/positionController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js"

const positionRouter = Router();

positionRouter.get('/positions',getPositions);
positionRouter.get('/position/:id',getPosition);
positionRouter.post('/position',verifyRoles(ROLES_LIST.HRManager),postPosition);
positionRouter.put('/position/:id',verifyRoles(ROLES_LIST.HRManager),updatePosition);
positionRouter.delete('/position/:id',verifyRoles(ROLES_LIST.HRManager),deletePosition);

export default positionRouter;