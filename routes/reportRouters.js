import Router from "express";
import {
  getReport,
  getReports,
  postReport,
  updateReport,
  deleteReport,
} from "../controllers/reportController";
import uploads from "../middlewares/image";
import verifyRoles from "../middlewares/verifyRoles";
import ROLES_LIST from "../config/roles_list";

const router = Router();

router.get("/reports", getReports);
router.get("/report/:id", getReport);
router.post("/report", uploads.array("proofPhoto", 5), postReport);
router.put("/report/:_id", uploads.array("proofPhoto", 5), updateReport);
router.delete("/report/:_id", deleteReport);

module.exports = router;
