const { Client } = require("pg");

/***** Connect to the `juicebox-dev` database ********/
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "juicbox-dev",
  password: "Dustyrats_22",
  port: 5433,
});


/**** Export Functions *******/
module.exports = {
  client,
};



