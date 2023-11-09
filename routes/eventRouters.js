import Router from "express";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js"
import { deleteEvent, getEvent, getEvents, getEventsByDate, getEventsByMonth, postEvent, updateEvent } from "../controllers/eventController.js";

const eventRouter = Router();

eventRouter.get('/events', getEvents);
eventRouter.get('/event/:id', getEvent);
eventRouter.get('/eventByDate/:day/:month/:year', getEventsByDate);
eventRouter.get('/eventByMonth/:month/:year', getEventsByMonth);
eventRouter.post('/event',postEvent);
eventRouter.put('/event/:id',updateEvent);
eventRouter.delete('/event/:id',deleteEvent);

export default eventRouter;

