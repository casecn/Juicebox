const { client, getAllUsers, createUser, updateUser } = require("./index");

async function createInitialUsers() {
    try{
        console.log("Starting to create users. . .");

        const albert = await createUser ({
            username: 'albert',
            password: 'bertie99',
            name: 'al Bert',
            location: 'Sidney, Australia' });
        const sandra = await createUser({
            username: "sandra",
            password: "kdiekkdi",
            name: "Just Sandra",
            location: "Ain't tellin",
        });
        const glamgal = await createUser({
            username: "glamgal",
            password: "kljsldfj",
            name: "Jan",
            location: "Upper East Side",
        });
    } catch(error) {
        console.error("Error creating users!");
        throw error;
    }
}
async function testDB() {
  try {
    console.log("#### - STARTING TO TEST THE DATABASE! - ####")
    console.log("**** - Calling getAllusers - ****");
    const users = await getAllUsers();
    console.log("**** - Result:", users);

    console.log("**** - Calling updateUser on users[0] - ****")
    const updateUserResult = await updateUser(users[0].id, {
        name: "newname Sogood",
        location: "Lesterville, KY"
    });
    console.log("Result: ", updateUserResult);
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
        await client.query(`DROP TABLE posts, users CASCADE;`);
        console.log("Finished dropping tables.");

    } catch (error) {
        console.error("Error dropping tables!");
        throw error;
    }
}

async function createTableUsers() {
    try {
        console.log("Creating 'user' table");
      await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true
      );
      `);
      console.log("Finished creating 'user' table");
    } catch (error) {
        console.error("Error creating 'user'tables!");
        throw error;
    }
} 

async function createTablePosts() {
  try {
    console.log("**** - Creating 'posts' table - ****");
    await client.query(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        "authorID" INTEGER REFERENCES users(id) NOT NULL,
        title varchar(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );
      `);

    console.log("**** - Finished creating 'posts' table - ****");
  } catch (error) {
    console.error("Error creating 'posts'tables!");
    throw error;
  }
} 
async function rebuildDB() {
    try {
        client.connect();

        await dropTables();
        await createTableUsers();
        await createTablePosts();
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