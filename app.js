const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/connectDB');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const credentials = require('./middlewares/credentials');
const corsOptions = require('./config/corsOptions');
require('express-async-errors');

const router = require('./routes/index.js');

connectDB();
const Port = process.env.PORT || 3000;

mongoose.set("strictQuery", false);
// connectDB();
mongoose.connection.once('open', () => {
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
app.set('view engine', 'ejs');

// serve static files
app.use(express.static('public'));






// app.use((req, res, next) => {
//   return res.status(404).json({ error: 'API not found' });
// });

app.use(router)
