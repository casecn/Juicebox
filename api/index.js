const express = require('express');//Import express
const apiRouter = express.Router(); //create an express router object.

//Define the router object
const usersRouter = require('./users');
const postsRouter = require('./posts');//
const tagsRouter = require("./tags");
//#### JWT STUFF #####
const jwt = require("jsonwebtoken");
const { getUserById } = require("../db");
const { JWT_SECRET } = process.env;

// set `req.user` if possible
apiRouter.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");

  if (!auth) {
    // nothing to see here
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

//Define the default path to the router object?????
apiRouter.use('/users', usersRouter);
apiRouter.use('/posts', postsRouter);apiRouter.use("/tags", tagsRouter);
apiRouter.use((error, req, res, next) => {
  res.send({
    name: error.name,
    message: error.message,
  });
});

//export the router object.
module.exports = apiRouter