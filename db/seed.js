const {
  client,
  getAllUsers,
  createUser,
  updateUser,
  getUserbyID,
  createPosts,
  updatePost,
  getAllposts,
  getPostsByUser,
} = require("./index");

async function createInitialUsers() {
    try{
        console.log("4.1 - Populating initial users ");

        await createUser ({
            username: 'albert',
            password: 'bertie99',
            name: 'al Bert',
            location: 'Sidney, Australia' });
        await createUser({
            username: "sandra",
            password: "kdiekkdi",
            name: "Just Sandra",
            location: "Ain't tellin",
        });
        await createUser({
            username: "glamgal",
            password: "kljsldfj",
            name: "Jan",
            location: "Upper East Side",
        });

        console.log("#### - Finished Populating Users - ####")
    } catch(error) {
        console.error("Error creating users!");
        throw error;
    }
}
async function testUsers() {
  try {
    console.log("4.  Testing User Functions")
    await createInitialUsers();
    console.log("4.2 - Calling getAllusers from index.js");
    const users = await getAllUsers();
    console.log("#### - GetAllusers Result:", users);

    console.log("4.3 - Calling updateUser (users[0]) from index.js")
    const updateUserResult = await updateUser(users[0].id, {
        name: "newname Sogood",
        location: "Lesterville, KY"
    });
    console.log("updateUser Results: ", updateUserResult);

    console.log("4.4 - Getting user data including posts");

    const userData = await getUserbyID(1);
    console.log("User Data:", userData);
    console.log("####- Finished Testing User Functions - #####");
  } catch (error) {
        console.error("Error testing db");
        throw error;
    }
}

async function testPosts() {
  try {
    console.log("5.  Testing Post Functions");
    await createInitialPosts();
    console.log("5.2 - Calling getAllposts from index.js");
    const posts = await getAllposts();
    console.log("GetAllposts Result:", posts);

    console.log("5.3 - Calling updatePosts (post[0]) from index.js");
    const updatePostResult = await updatePost(posts[0].id, {
        title: "updated content",
        content: "New update content "
    });
  console.log("updatePosts Result:", updatePostResult);
  console.log("5.4 - Retrieving all posts by user with id #2 from index.js");
  const userPosts = await getPostsByUser(1);
  console.log("Posts by User #2:", userPosts)
    console.log("####- Finished Testing Post Functions - #####");
  } catch (error) {
    console.error("Error testing db");
    throw error;
  }
}
async function createInitialPosts() {
  try {
    console.log("5.1 - Creating Initial Posts.");

    const albert = await createPosts({
      authorID: 1,
      title: "first post",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    });
    const sandra = await createPosts({
      authorID: 2,
      title: "second post",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    });
    const glamgal = await createPosts({
      authorID: 2,
      title: "third post",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    });
  } catch (error) {
    console.error("Error creating Posts!");
    throw error;
  }
}

async function dropTables() {
    try{
        console.log("1. Droping Tables");
        await client.query(`DROP TABLE posts, users CASCADE;`);
        console.log("#### - Finished dropping tables. - ####");

    } catch (error) {
        console.error("Error dropping tables!");
        throw error;
    }
}

async function createTableUsers() {
    try {
        console.log("2.  Creating 'user' table");
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
      console.log("#### - Finished creating 'user' table - ####");
    } catch (error) {
        console.error("Error creating 'user'tables!");
        throw error;
    }
} 

async function createTablePosts() {
  try {
    console.log("3.  Creating 'posts' table");
    await client.query(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        "authorID" INTEGER REFERENCES users(id) NOT NULL,
        title varchar(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );
      `);

    console.log("#### - Finished creating 'posts' table - ####");
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
        
    } catch (error) {
        console.error(error);
        throw error;
    } 
}

rebuildDB()
    .then(testUsers)
    .then(testPosts)
    .catch(console.error)
    .finally(() => {
        client.end();
        console.log("FINISHED!!!!!!!!!")});