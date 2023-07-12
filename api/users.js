const express = require('express');
const usersRouter = express.Router();

usersRouter.use((req, res, next) => {
  console.log("A request is bing made to /users");

  res.send({ message: 'hello from /users!' });
});

module.exports = usersRouter;