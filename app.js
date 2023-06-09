const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const passport = require('passport');
const { localStrat, jwtStrat } = require('./passport');

const blogRoute = require('./routes/blogRoute.js');

const app = express();

// Connect to mongoose
mongoDB = process.env.MONGOURI;
(async () => {
  mongoose.connect(mongoDB);
})().catch((err) => console.error(err));

// Set up the passport strategies
app.use(passport.initialize());
passport.use('local', localStrat);
passport.use('jwt', jwtStrat);

// This call parses the json sent in and puts it in req.body
app.use(express.json());

// Everything is nested in here
app.use('/users', blogRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server now running on ${PORT}`));
