import Router from "express";
import {getPositions,getPosition,postPosition,updatePosition,deletePosition} from "../controllers/positionController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js"

const positionRouter = Router();

positionRouter.get('/positions',verifyRoles(ROLES_LIST.Admin),getPositions);
positionRouter.get('/position/:id',getPosition);
positionRouter.post('/position',verifyRoles(ROLES_LIST.Admin),postPosition);
positionRouter.put('/position/:id',verifyRoles(ROLES_LIST.Admin),updatePosition);
positionRouter.delete('/position/:id',verifyRoles(ROLES_LIST.Admin),deletePosition);

export default positionRouter;