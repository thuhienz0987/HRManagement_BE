import Router from "express";
import {getRoles,getRole,postRole,updateRole,deleteRole} from "../controllers/roleController.js";
const roleRouter = Router();

roleRouter.get('/roles',getRoles);
roleRouter.get('/role/:id',getRole);
roleRouter.post('/role',postRole);
roleRouter.put('/role/:id',updateRole);
roleRouter.delete('/role/:id',deleteRole);

export default roleRouter;