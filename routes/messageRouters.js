import { Router } from "express";
import {
  deleteMessage,
  saveMessage,
  updateMessage,
} from "../controllers/messageController.js";

const messageRouter = Router();

messageRouter.post("/save-message", saveMessage);
messageRouter.put("/update-message/:_id", updateMessage);
messageRouter.delete("/delete-message/:_id", deleteMessage);

export default messageRouter;
