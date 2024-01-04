import dotenv from "dotenv";

dotenv.config();

import express from "express";
import connectDB from "../config/connectDB";
import router from "../routes";
import credentials from "../middlewares/credentials";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

function serverTest() {
  const PORT = 1111;
  const app = express();
  connectDB();
  app.use(express.static("public"));

  // Cross Origin Resource Sharing
  // app.use(cors(corsOptions()));
  app.use(credentials);
  // built-in middleware to handle urlencoded form data
  app.use(bodyParser.urlencoded({ extended: false }));

  // Middleware for json
  app.use(bodyParser.json());

  // Middleware for cookies
  app.use(cookieParser());

  app.use(router);

  app.listen(PORT, () => {
    console.log(`server test listening on PORT ${PORT}`);
  });
  return app;
}

export default serverTest;
