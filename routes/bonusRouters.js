import Router from "express";
import { deleteBonus, getBonus, getBonuses, postBonus, updateBonus } from "../controllers/bonusController.js";
const bonusRouter = Router();

bonusRouter.get('/bonuses',getBonuses);
bonusRouter.get('/bonus/:id',getBonus);
bonusRouter.post('/bonus',postBonus);
bonusRouter.put('/bonus/:id',updateBonus);
bonusRouter.delete('/bonus/:id',deleteBonus);

export default bonusRouter;