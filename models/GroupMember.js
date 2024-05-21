import mongoose from "mongoose";

const groupMemberSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "GroupChat",
    },
    memberId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const GroupMember = mongoose.model("GroupMember", groupMemberSchema);

export default GroupMember;
