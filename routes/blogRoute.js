const express = require('express');
const controller = require('../controllers/blogController');

const route = express.Router();

// Get users
route.get('/', controller.getUsers);

// Get user
route.get('/:userId', controller.getOneUser);

// Make new user
route.post('/', controller.createUser);

// Get user's posts
route.get('/:userId/posts', controller.getPosts);

// Get user post
route.get('/:userId/posts/:postId', controller.getOnePost);

// Create new user post
route.post('/:userId/posts', controller.createPost);

// Delete a post
route.delete('/:userId/posts/:postId', controller.deletePost);

// Get post's comments
route.get('/:userId/posts/:postId/comments', controller.getComments);

// Get post comment
route.get(
  '/:userId/posts/:postId/comments/:commentId',
  controller.getOneComment
);

// Create new comment
route.post('/:userId/posts/:postId/comments', controller.createComment);

// Delete a comment
route.delete(
  '/:userId/posts/:postId/comments/:commentId',
  controller.deleteComment
);

// Log in the user
route.post('/login', controller.logIn);

module.exports = route;
