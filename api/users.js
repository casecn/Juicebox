const express = require('express');
const usersRouter = express.Router();//define router
const { getAllUsers } = require("../db");

usersRouter.use((req, res, next) => {
  console.log("A request is bing made to /users");

  next();
});

usersRouter.get('/', async (req, res) =>{
  const users = await getAllUsers();
  res.send({ users });
});

module.exports = usersRouter;