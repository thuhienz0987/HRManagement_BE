import Router from "express";
import {getPositions,getPosition,postPosition,updatePosition,deletePosition} from "../controllers/positionController.js";
const positionRouter = Router();

positionRouter.get('/positions',getPositions);
positionRouter.get('/position/:id',getPosition);
positionRouter.post('/position',postPosition);
positionRouter.put('/position/:id',updatePosition);
positionRouter.delete('/position/:id',deletePosition);

export default positionRouter;