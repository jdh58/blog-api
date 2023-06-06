const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const { body, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const asyncHandler = require('express-async-handler');

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().exec();

  console.log('dasdasd');
  res.json({ users });
});

exports.getOneUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).exec();

  res.json({ user });
});

exports.createUser = [
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Your first name must be between 2 and 50 characters.')
    .escape(),
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Your last name must be between 2 and 50 characters.')
    .escape(),
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Your username must be between 3 and 50 characters.')
    .escape(),

  asyncHandler(async (req, res) => {
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      private: req.body.private === 'ok' ? true : false,
    });

    const errors = validationResult(req);

    const existingUser = await User.find({ username: user.username }).exec();

    if (existingUser.length > 0) {
      // There is a user with this username already. Return a failure.
      res.status(400);
      res.send('This username is taken');
      return;
    } else if (!errors.isEmpty()) {
      // There are validation errors. Return them with a 400 error.
      res.status(400);
      res.send(errors.errors);
      return;
    }

    // There are no errors, encrypt the password and save it in the database.
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        console.error(err);
        return;
      } else {
        user.password = hashedPassword;
        await user.save();
        res.status(200);
        res.send('User has been created');
        return;
      }
    });
  }),
];

exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ user: req.params.userId }).exec();

  res.json({ posts });
});

exports.getOnePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  res.json({ post });
});

exports.createPost = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 75 })
    .withMessage('Your title must be between 5 and 75 characters.')
    .escape(),
  body('text')
    .trim()
    .isLength({ min: 10, max: 100000 })
    .withMessage('Your blog content must be between 10 and 100,000 characters.')
    .escape(),

  function authenticateUser(req, res) {
    passport.authenticate(
      'jwt',
      { session: false },
      async (err, user, info) => {
        if (err) {
          res.status(400).send(info);
        } else {
          if (!user) {
            res.status(403).send(info);
            return;
          }

          const errors = validationResult(req);

          const post = new Post({
            title: req.body.title,
            text: req.body.text,
            user: user.id,
            timestamp: new Date(),
            published: req.body.published === 'ok' ? true : false,
          });

          if (!errors.isEmpty()) {
            // There are errors with validation. Return 400 and the messages.
            res.status(400);
            res.send(errors.errors);
            return;
          } else if (req.params.userId === user.id) {
            // No errors and verified, move on and create the post
            await post.save();
            res.status(200).send('Post successfully created');
          }
        }
      }
    )(req, res);
  },
];

exports.deletePost = asyncHandler(async (req, res) => {
  // Verify the user is authenticated and it's the user's post
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    if (err || !user) {
      res.status(400).send(info);
      return;
    } else {
      const postToDelete = await Post.findById(req.params.postId).exec();

      if (user.id === postToDelete.user.toString() || user.admin === true) {
        // The user is premitted to delete the post.
        await Post.findByIdAndRemove(req.params.postId);
        res.status(200).send(`Post ${req.params.postId} has been deleted.`);
        return;
      }

      // The user was not allowed to delete this post
      res.status(403).send('Forbidden');
      return;
    }
  })(req, res);
});

exports.getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId });

  res.json({ comments });
});

exports.getOneComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);

  res.json({ comment });
});

exports.createComment = [
  body('text').trim().isLength({ min: 1, max: 1000 }),
  function authenticationWrapper(req, res) {
    passport.authenticate(
      'jwt',
      { session: false },
      async (err, user, info) => {
        if (err) {
          res.status(400).send(info);
          return;
        }
        if (!user) {
          // User is not logged in
          res.status(403).send('Authentication failed. Forbidden.');
          return;
        }

        // User is authenticated, allow them to post the comment
        const comment = new Comment({
          text: req.body.text,
          post: req.params.postId,
          user: user.id,
          timestamp: new Date(),
        });

        await comment.save();
        res.status(200).send('Comment successfully posted');
      }
    )(req, res);
  },
];

exports.deleteComment = function authenticationWrapper(req, res) {
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    if (err) {
      res.status(400).send(info);
      return;
    }
    if (!user) {
      // Not logged in
      res.status(403).send('Authentication failed. Forbidden.');
    }

    const commentToDelete = await Comment.findById(req.params.commentId).exec();

    if (user.id === commentToDelete.user.toString() || user.admin === true) {
      // User is permitted to delete comment
      await Comment.findByIdAndRemove(req.params.commentId);
      res
        .status(200)
        .send(`Comment ${req.params.commentId} successfully deleted.`);
    }

    // User was not permitted to delete comment
    res.status(403).send('Forbidden');
  })(req, res);
};

exports.logIn = async (req, res) => {
  await passport.authenticate(
    'local',
    { session: false },
    (err, user, info) => {
      if (err || !user) {
        res.status(400).send(info);
      } else {
        const token = jwt.sign({ userId: user.id }, 'jdhblog', {
          expiresIn: '7d',
        });
        res.json({ user, token });
      }
    }
  )(req, res);
};
