
const { client } = require("./index");
const { getPostTags } = require("./tags");

/* Initialization Functions */
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

/**** Posts Functions ****/
async function createPosts({ authorID, title, content }) {
    //console.log("AuthorID:", authorID, "Title:", title, "Content:", content)
    const sql = 'INSERT INTO posts (\"authorID\", title, content) VALUES ($1, $2, $3) RETURNING *'
    const data = [authorID, title, content]
    //console.log(data);
    try {
    const { rows: [posts], } = await client.query(sql, data);
    return posts;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getPostsByUser(userID) {
  // console.log("Posts by User #", userID)
  //  console.log(typeof userID)
  let sql = `SELECT * FROM posts WHERE "authorID" = $1`;

  try {
    const { rows } = await client.query(sql, [userID]);
    //  console.log({ rows, line: 125 })
    if (!rows.length) {
      //  console.log({rows, line: 125});
      return null;
    }
    //console.log({rows, line: 129})
    return rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function updatePost(id, fields = {}) {
  let keyList = [];
  const setString = Object.keys(fields)
    .map((key, index, value) => {
      let setString = `"${key}"=$${index + 1}`;
      keyList.push(fields[key]);
      return setString;
    })
    .join(", ");
  if (setString.length === 0) {
    return;
  }

  let sql = `
        UPDATE posts
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
        `;
  try {
    const {
      rows: [post],
    } = await client.query(sql, keyList);

    return post;
  } catch (error) {
    throw error;
  }
}

async function getAllposts() {
  const { rows } = await client.query(`SELECT * FROM posts;`);
  return rows;
}

async function getPostById(postId) {
  let sql = `SELECT * FROM posts WHERE id = $1;`;
  try {
    const {
      rows: [post],
    } = await client.query(sql, [postId]);

    if (post) {
      //Get post tags
      const postTags = await getPostTags(postId);
      //add posts to user objects
      //posts.tags = postTags;
      return post;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**** Export Functions *******/
module.exports = {
  createTablePosts,
  createInitialPosts,
  createPosts,
  updatePost,
  getAllposts,
  getPostsByUser,
  getPostById,
};