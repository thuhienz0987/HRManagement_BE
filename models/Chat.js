import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    receiverId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    senderId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    message: {
      type: String,
      required: [true, "Comment is missing"],
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
