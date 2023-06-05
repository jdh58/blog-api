const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const asyncHandler = require('express-async-handler');

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().exec();

  res.json({ users });
});

exports.getOneUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).exec();

  res.json({ user });
});

exports.createUser = asyncHandler(async (req, res) => {});

exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ user: req.params.userId }).exec();

  res.json({ posts });
});

exports.getOnePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  res.json({ post });
});

exports.createPost = asyncHandler(async (req, res) => {});

exports.deletePost = asyncHandler(async (req, res) => {});

exports.getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId });

  res.json({ comments });
});

exports.getOneComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);

  res.json({ comment });
});

exports.createComment = asyncHandler(async (req, res) => {});

exports.deleteComment = asyncHandler(async (req, res) => {});
