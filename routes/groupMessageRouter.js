import { Router } from "express";
import {
  deleteGroupMessage,
  loadGroupMessage,
  saveGroupMessage,
  updateGroupMessage,
} from "../controllers/groupMessageController.js";

const groupMessageRouter = Router();

groupMessageRouter.post("/save-group-message", saveGroupMessage);
groupMessageRouter.put("/update-group-message/:_id", updateGroupMessage);
groupMessageRouter.get("/load-group-message/:groupId", loadGroupMessage);
groupMessageRouter.delete("/delete-group-message/:_id", deleteGroupMessage);

export default groupMessageRouter;
