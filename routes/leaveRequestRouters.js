import Router from "express";
import {getLeaveRequests,getLeaveRequest,getLeaveRequestsByUserId,postLeaveRequest,updateLeaveRequest,deleteLeaveRequest} from "../controllers/leaveRequestController.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js"

const leaveRequestRouter = Router();

leaveRequestRouter.get('/leaveRequests',verifyRoles(ROLES_LIST.HRManager, ROLES_LIST.CEO),getLeaveRequests);
leaveRequestRouter.get('/leaveRequest/:id',verifyRoles(ROLES_LIST.HRManager, ROLES_LIST.CEO),getLeaveRequest);
leaveRequestRouter.get('/leaveRequests/:userId',getLeaveRequestsByUserId);
leaveRequestRouter.post('/leaveRequest',postLeaveRequest);
leaveRequestRouter.put('/leaveRequest/:id',verifyRoles(ROLES_LIST.HRManager,ROLES_LIST.CEO),updateLeaveRequest);
leaveRequestRouter.delete('/leaveRequest/:id',verifyRoles(ROLES_LIST.HRManager,ROLES_LIST.Employee),deleteLeaveRequest);

export default leaveRequestRouter;