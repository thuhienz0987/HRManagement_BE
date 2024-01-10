import mongoose from "mongoose";

// excellent performance, average performance, under average performance
const TypeBar = ["Attendance", "Salary", "Personal Information", "Others"];

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      required: [true, "Type is missing"],
      enum: TypeBar,
    },
    amount: {
      type: Number,
      // required: [true, "Amount is missing"],
    },
    proofPhoto: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    description: {
      type: String,
      required: [true, "Description is missing"],
    },
    history: [
      {
        type: {
          type: Number,
          required: true,
        },
        amount: {
          type: String,
          // required: true,
        },
        proofPhoto: [
          {
            public_id: {
              type: String,
              required: true,
            },
            url: {
              type: String,
              required: true,
            },
          },
        ],
        description: {
          type: String,
          required: true,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

reportSchema.pre("save", function (next) {
  // Before saving, push the current values to the history array
  this.history.push({
    type: this.type,
    amount: this.amount,
    proofPhoto: this.proofPhoto,
    description: this.description,
  });
  next();
});

const Report = mongoose.model("Report", reportSchema);

export default Report;
