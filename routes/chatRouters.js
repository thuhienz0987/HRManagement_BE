import { Router } from "express";
import {
  save_chat,
  delete_chat,
  update_chat,
} from "../controllers/chatController.js";

const chatRouter = Router();

chatRouter.post("/save-chat", save_chat);
chatRouter.put("/update-chat/:_id", update_chat);
chatRouter.delete("/delete-chat/:_id", delete_chat);

export default chatRouter;
