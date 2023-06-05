const express = require('express');

const userRoute = require('../routes/userRoute.js');
const postRoute = require('../routes/postRoute.js');
const commentRoute = require('../routes/commentRoute.js');

const app = express();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server now running on ${PORT}`));

app.use('/user', userRoute);
app.use('/post', postRoute);
app.use('/comment', commentRoute);
