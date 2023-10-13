import { Router } from "express";
import { closeAttendance, deleteAttendance, getAttendance, getAttendances, postAttendance, updateAttendance } from "../controllers/attendanceController.js";
import ROLES_LIST from "../config/roles_list.js";
import verifyRoles from "../middlewares/verifyRoles.js";

const attendanceRouter = Router();
attendanceRouter.get('/attendances',verifyRoles(ROLES_LIST.HRManager,ROLES_LIST.CEO),getAttendances);
attendanceRouter.get('/attendance/:id',getAttendance);
attendanceRouter.post('/attendance',verifyRoles(ROLES_LIST.HRManager),postAttendance);
attendanceRouter.put('/attendance_close/:id',verifyRoles(ROLES_LIST.HRManager),closeAttendance);
attendanceRouter.put('/attendance/:id',verifyRoles(ROLES_LIST.HRManager),updateAttendance);
attendanceRouter.delete('/attendance/:id',verifyRoles(ROLES_LIST.HRManager),deleteAttendance);

export default attendanceRouter;