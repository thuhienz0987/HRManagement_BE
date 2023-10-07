import { Router } from "express";
import { deleteHoliday, getHoliday, getHolidays, postHoliday, updateHoliday } from "../controllers/holidayController.js";

const holidayRouter = Router();

holidayRouter.get('/holidays',getHolidays);
holidayRouter.get('/holiday/:id',getHoliday);
holidayRouter.post('/holiday',postHoliday);
holidayRouter.put('/holiday/:id',updateHoliday);
holidayRouter.delete('/holiday/:id',deleteHoliday);

export default holidayRouter;