const { client } = require("./index");
const {
    createTableUsers,
    createInitialUsers,
    getAllUsers,
    updateUser,
    getUserbyID,
} = require("./users");

const {
    createTablePosts,
    createInitialPosts,
    updatePost,
    getAllposts,
    getPostsByUser,
} = require("./posts");

const { createTableTags, createTablePost_Tags, createTag, } = require("./tags");

async function testUsers() {
  try {
    console.log("4.  Testing User Functions")

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
    console.log('%c 5.  Testing Post Functions', 'color: orange; font-weight: bold');
    
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

async function testTags() {
  try {
    console.log("6.  Testing Tag Functions");
    const tags = await createTag(["#tag", "#othertag", "#moretag"]);
    console.log("Tags Created:", tags);
    // console.log("4.2 - Calling getAllusers from index.js");
    // const users = await getAllUsers();
    // console.log("#### - GetAllusers Result:", users);

    // console.log("4.3 - Calling updateUser (users[0]) from index.js");
    // const updateUserResult = await updateUser(users[0].id, {
    //   name: "newname Sogood",
    //   location: "Lesterville, KY",
    // });
    // console.log("updateUser Results: ", updateUserResult);

    // console.log("4.4 - Getting user data including posts");

    // const userData = await getUserbyID(1);
    // console.log("User Data:", userData);
    // console.log("####- Finished Testing User Functions - #####");
  } catch (error) {
    console.error("Error testing db");
    throw error;
  }
}
async function dropTables() {
    try{
        console.log("1. Droping Tables");
        await client.query(`
            DROP TABLE IF EXISTS posts CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
            DROP TABLE IF EXISTS tags CASCADE;
            DROP TABLE IF EXISTS post_tags CASCADE;`);
        console.log("#### - Finished dropping tables. - ####");

    } catch (error) {
        console.error("Error dropping tables!");
        throw error;
    }
}

async function rebuildDB() {
    try {
        client.connect();
        
        await dropTables();
        //Create Tables
        await createTableUsers();
        await createTablePosts();
        await createTableTags();
        await createTablePost_Tags();
        //Populate initial data
        await createInitialUsers();
        await createInitialPosts();
        
    } catch (error) {
        console.error(error);
        throw error;
    } 
}

rebuildDB()
  .then(testUsers)
  .then(testPosts)
  .then(testTags)
  .catch(console.error)
  .finally(() => client.end());