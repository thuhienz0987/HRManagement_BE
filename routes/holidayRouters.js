import { Router } from "express";
import { deleteHoliday, getHoliday, getHolidays, postHoliday, updateHoliday } from "../controllers/holidayController.js";
import ROLES_LIST from "../config/roles_list.js";
import verifyRoles from "../middlewares/verifyRoles.js";

const holidayRouter = Router();

holidayRouter.get('/holidays',getHolidays);
holidayRouter.get('/holiday/:id',getHoliday);
holidayRouter.post('/holiday',verifyRoles(ROLES_LIST.HRManager),postHoliday);
holidayRouter.put('/holiday/:id',verifyRoles(ROLES_LIST.HRManager),updateHoliday);
holidayRouter.delete('/holiday/:id',verifyRoles(ROLES_LIST.HRManager),deleteHoliday);

export default holidayRouter;