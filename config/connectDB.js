import mongoose from "mongoose";
const connectDB = async () => {
  try {
    const connect = await mongoose.connect(
      process.env.URL_DATABASE,
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
