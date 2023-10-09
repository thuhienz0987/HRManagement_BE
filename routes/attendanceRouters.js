import { Router } from "express";
import { closeAttendance, deleteAttendance, getAttendance, getAttendances, postAttendance, updateAttendance } from "../controllers/attendanceController.js";

const attendanceRouter = Router();
attendanceRouter.get('/attendances',getAttendances);
attendanceRouter.get('/attendance/:id',getAttendance);
attendanceRouter.post('/attendance',postAttendance);
attendanceRouter.put('/attendance_close/:id',closeAttendance);
attendanceRouter.put('/attendance/:id',updateAttendance);
attendanceRouter.delete('/attendance/:id',deleteAttendance);

export default attendanceRouter;