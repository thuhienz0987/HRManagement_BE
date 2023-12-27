import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      required: [true, "Reason is missing"],
    },
    status: {
      type: String,
      required: [true, "Status is missing"],
      enum: ["pending", "approved", "denied"],
      default: "pending",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is missing"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is missing"],
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    approverId: {
      type: mongoose.Types.ObjectId,
      // required: true,
      ref: "User",
    },
    paidLeaveDays: {
      type: Number,
      require: true,
      default: 0,
    },
    history: [
      {
        reason: String,
        status: String,
        userId: mongoose.Types.ObjectId,
        startDate: Date,
        endDate: Date,
        updatedAt: Date,
        approverId: mongoose.Types.ObjectId,
      },
    ],
  },
  {
    timestamps: true,
  }
);

leaveRequestSchema.pre("save", function (next) {
  // Before saving, push the current values to the history array
  this.history.push({
    reason: this.reason,
    commitment: this.commitment,
    status: this.status,
    userId: this.userId,
    startDate: this.startDate,
    endDate: this.endDate,
    updatedAt: new Date(),
    approverId: this.approverId,
  });
  next();
});

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);

export default LeaveRequest;
