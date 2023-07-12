const express = require('express');//Import express
const apiRouter = express.Router(); //create an express router object.

//Define the router object
const usersRouter = require('./users');
const postsRouter = require('./posts');//


//Define the default path to the router object?????
apiRouter.use('/users', usersRouter);
apiRouter.use('/posts', postsRouter);

//export the router object.
module.exports = apiRouter