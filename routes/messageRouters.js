import { Router } from "express";
import {
  deleteMessage,
  getUserMessageHistory,
  saveMessage,
  updateMessage,
} from "../controllers/messageController.js";

const messageRouter = Router();

messageRouter.post("/save-message", saveMessage);
messageRouter.get("/message-history/:userId", getUserMessageHistory);
messageRouter.put("/update-message/:_id", updateMessage);
messageRouter.delete("/delete-message/:_id", deleteMessage);

export default messageRouter;
