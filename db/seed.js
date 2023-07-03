const { client, getAllUsers, createUser
} = require("./index");

async function createInitialUsers() {
    try{
        console.log("Starting to create users. . .");

        const albert = await createUser({ username: 'albert', password: 'bertie99'});
    } catch(error) {
        console.error("Error creating users!");
        throw error;
    }
}
async function testDB() {
  try {
    console.log("starting to test the database . . .")
    const users = await getAllUsers();
    console.log(users);
    console.log("Finished testing the database . . .");
  } catch (error) {
        console.error("Error testing db");
        throw error;
//   } finally {
//     client.end();
//   }
}
}

//testDB();

async function dropTables() {
    try{
        console.log("starting to drop tables ...");
        await client.query(`DROP TABLE IF EXISTS users;`)
        console.log("Finished dropping tables.");

    } catch (error) {
        console.error("Error dropping tables!");
        throw error;
    }
}

async function createTables() {
    try {
        console.log("Creating table");
      await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL
      );
      `);
      console.log("Finished creating table");
    } catch (error) {
        console.error("Error creating tables!");
        throw error;
    }
} 

async function rebuildDB() {
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
    } catch (error) {
        console.error(error);
        throw error;
    } 
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());;