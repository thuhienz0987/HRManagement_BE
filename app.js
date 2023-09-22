import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/connectDB.js";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';

import router from './routes/index.js'
// import 

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


// app.use((req, res, next) => {
//   return res.status(404).json({ error: 'API not found' });
// });

app.use(router)
