
/****** Imports *****/
require("dotenv").config();

const express = require('express');
const apiRouter = require("./api");
const morgan = require('morgan');
const { client } = require("./db");

//***** Constants & Connections *****/
const PORT = 3000;
const server = express();
client.connect();

//***** Listen for requests to different routs */
server.listen(PORT, () => {
  console.log('The server is up on port', PORT)
});

//***** Middle Ware ????????******/
server.use(morgan('dev'));
server.use(express.json());

server.use((req, res, next) => {
  console.log("<____Body Logger START____>");
  console.log(req.body);
  console.log("<_____Body Logger END_____>");
  
  next();
  
});

server.use("/api", apiRouter);
