import mongoose from "mongoose";
const connectDB = async () => {
  try {
    const connect = await mongoose.connect(
      "mongodb+srv://thuhien:thuhien1234@hrmanagement.qxvtycq.mongodb.net/HRManagement",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("connect successfully");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

export default connectDB;
