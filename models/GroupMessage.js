import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "GroupChat",
    },
    senderId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    message: {
      type: String,
      required: [true, "Message is missing"],
    },
  },
  { timestamps: true }
);

const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);

export default GroupMessage;
