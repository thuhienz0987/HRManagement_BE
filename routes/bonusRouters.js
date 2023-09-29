import Router from "express";
import { deleteBonus, getBonus, getBonuses, postBonus, updateBonus } from "../controllers/bonusController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js";

const bonusRouter = Router();

bonusRouter.get('/bonuses',verifyRoles(ROLES_LIST.HRManager,ROLES_LIST.Admin),getBonuses);
bonusRouter.get('/bonus/:id',getBonus);
bonusRouter.post('/bonus',verifyRoles(ROLES_LIST.Admin),postBonus);
bonusRouter.put('/bonus/:id',verifyRoles(ROLES_LIST.Admin),updateBonus);
bonusRouter.delete('/bonus/:id',verifyRoles(ROLES_LIST.Admin),deleteBonus);

export default bonusRouter;