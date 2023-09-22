import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/connectDB.js";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';

dotenv.config();
connectDB();
const Port = process.env.PORT || 3000;

mongoose.set("strictQuery", false);
connectDB();

const app = express();

app.listen(Port, () => {
  console.log(`server running on ${Port}`);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

