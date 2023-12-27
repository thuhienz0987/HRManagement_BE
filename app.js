import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/connectDB.js";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import credentials from "./middlewares/credentials.js";
import corsOptions from "./config/corsOptions.js";
import "express-async-errors";

import router from "./routes/index.js";

connectDB();
const Port = process.env.PORT || 3001;

mongoose.set("strictQuery", false);
// connectDB();
mongoose.connection.once("open", () => {
  app.listen(Port);
});

const app = express();

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware for json
app.use(bodyParser.json());

// Middleware for cookies
app.use(cookieParser());

// view engine
app.set("view engine", "ejs");

// serve static files
app.use(express.static("public"));

// app.use((req, res, next) => {
//   return res.status(404).json({ error: 'API not found' });
// });

app.use(router);
