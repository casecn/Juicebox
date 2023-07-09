const { client } = require("./index");
const { getPostTags, createTags, createPostTag } = require("./tags");

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

    await createPost({
      authorID: 1,
      title: "first post",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      tags: ["#happy", "#youcandoanything"],
    });
    console.log("passed #1");

    await createPost({
      authorID: 2,
      title: "First Post",
      content:
        "This is my first post. I hope I love writing blogs as much as I love writing them.",
      tags: ["#happy", "#youcantdoanything"],
    });
    console.log("passed #2");
    await createPost({
      authorID: 3,
      title: "second post",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      tags: ["#sad", "#firsttag"],
    });
    console.log("passed #3");
    await createPost({
      authorID: 2,
      title: "third post",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      tags: ["#happy", "#youcandoanything"],
    });
    console.log("passed #4");
    console.log("Finished creating posts!");
  } catch (error) {
    console.error("Error creating Posts!");
    throw error;
  }
}

/**** Posts Functions ****/
async function createPost({ authorID, title, content, tags = [] }) {
  //console.log("AuthorID:", authorID, "Title:", title, "Content:", content, "Tags:", tags)
  const sql =
    'INSERT INTO posts ("authorID", title, content) VALUES ($1, $2, $3) RETURNING *';
  const data = [authorID, title, content];

  try {
    const {
      rows: [posts],
    } = await client.query(sql, data);

    const tagList = await createTags(tags);

    return await addTagsToPost(posts.id, tagList);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getPostsByUser(userID) {
  //console.log("Posts by User #", userID)
  //  console.log(typeof userID)
  let sql = `SELECT id FROM posts WHERE "authorID" = $1`;

  try {
    const { rows: postIds } = await client.query(sql, [userID]);

    if (!postIds.length) {
      return null;
    }
const posts = await Promise.all(postIds.map((post) => getPostById(post.id)));
    return posts;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getPostsByTagName(tagName) {
    try{
        let sql = `SELECT posts.id FROM posts
        JOIN post_tags ON posts.id=post_tags."postId"
        JOIN tags on tags.id=post_tags."tagId"
        WHERE tags.name = $1;`
        const { rows: postIds } = await client.query(sql , [tagName]);
        //somehow tags are being lost coming throug the following line.
   const posts = await Promise.all(postIds.map((post) => getPostById(post.id)));
        // console.log("TEMP: ", temp)
        return posts;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


async function updatePost(postId, fields = {}) {
  const { tags } = fields;
  delete fields.tags;
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  try {
    if (setString) {
      let sql = `UPDATE posts SET ${setString} 
            WHERE id=${postId}
            RETURNING *;`;
      await client.query(sql, Object.values(fields));
      if (tags === undefined) {
        return await getPostById(postId);
      }
    }
    const tagList = await createTags(tags);
    const tagListIdString = tagList.map((tag) => `${tag.id}`).join(", ");

    await client.query(`
      DELETE FROM post_tags
      WHERE "tagId"
      NOT IN (${ tagListIdString })
      AND "postId"=$1;`,
      [postId]
    );

    await addTagsToPost(postId, tagList);

    return await getPostById(postId);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getAllPosts() {
  try {
    const { rows: postIds } = await client.query(`SELECT id FROM posts;`);
    
    const posts = await Promise.all(
      postIds.map((post) => getPostById(post.id))
    );
    return posts;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getPostById(postId) {
  //console.log("GETPOSTSBYID:", postId)
  try {
    //get the post it's self
    let sql = `SELECT * FROM posts WHERE id = $1;`;
    const { rows: [post], } = await client.query(sql, [postId]);
   // console.log("GETPOSTSBYID-POST:", post);
      //grab the author info
      
      sql = `SELECT username, name, location
            FROM users
            WHERE id=$1;`;
      const { rows: [author], } = await client.query( sql, [post.authorID]);
      //add author info to post object
      post.author = author;
      //Get tags
      const postTags = await getPostTags(postId);
      console.log("GETPOSTSBYID-POST_TAGS:", postTags);
      //add tags to the post object.
      post.tags = postTags;
      console.log("GETPOSTSBYID-POST_TAGS_POSTS:", post);
      delete post.authorID;
      return post;
    
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function addTagsToPost(postId, tagList) {
  try {
    //console.log(tagList)
    const createPostTagPromises = tagList.map((tag) =>
      createPostTag(postId, tag)
    );

    await Promise.all(createPostTagPromises);

    return await getPostById(postId);
  } catch (error) {
    throw error;
  }
}
/**** Export Functions *******/
module.exports = {
  createTablePosts,
  createInitialPosts,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getPostById,
  addTagsToPost,
  getPostsByTagName,
};
