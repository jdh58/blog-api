const express = require('express');

const usersRoute = require('../routes/blogRoute.js');

const app = express();

// Everything is nested in here
app.use('/users', blogRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server now running on ${PORT}`));
