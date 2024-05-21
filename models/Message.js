import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
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

const Message = mongoose.model("Message", messageSchema);

export default Message;
