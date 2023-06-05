const User = require('../models/User');

const asyncHandler = require('express-async-handler');

exports.getIndex = asyncHandler(async (req, res) => {
  const users = await User.find().exec();

  res.json({ users });
});
