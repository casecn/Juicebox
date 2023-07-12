const express = require('express');//Import express
const apiRouter = express.Router(); //create an express router object.

const usersRouter = require('./users');//Define the router object
apiRouter.use('/users', usersRouter);//Define the default path to the router object?????

module.exports = apiRouter;//export the router object.