const { Client } = require("pg");

/***** Connect to the `juicebox-dev` database ********/
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "juicbox-dev",
  password: "Dustyrats_22",
  port: 5433,
});


//Initialize Users Functions
async function createTableUsers() {
  try {
    console.log("2.  Creating 'user' table");
    await client.query(`CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true
    );
      `);
    // username varchar(255) UNIQUE NOT NULL,
    // password varchar(255) NOT NULL,
    // name VARCHAR(255) NOT NULL,
    // location VARCHAR(255) NOT NULL,
    // active BOOLEAN DEFAULT true
    console.log("#### - Finished creating 'user' table - ####");
  } catch (error) {
    console.error("Error creating 'user'tables!");
    throw error;
  }
} 

async function createInitialUsers() {
  try {
    console.log("4.1 - Populating initial users ");

    await createUser({
      username: "albert",
      password: "bertie99",
      name: "al Bert",
      location: "Sidney, Australia",
    });
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

    console.log("#### - Finished Populating Users - ####");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

/***** User Functions ********/
async function getAllUsers() {
    const { rows } = await client.query(`SELECT 
        id, 
        username, 
        name,
        location 
    FROM users;`);
    return rows;
}

async function createUser({ 
    username, 
    password, 
    name,
    location }) {
        let sql = `INSERT INTO users (username, password, name, location) VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        ;
        `;
        data = [username, password, name, location];
        //console.log(data);
    try {
        const { rows: [ user ] } = await client.query(sql, data);
        return user;
    } catch (error) {
        throw error;
    }
}//RETURNING id, username, name, location, active

async function updateUser(id, fields = {}) {
    const setString = Object.keys(fields).map((key, index) => `"${ key }"=$${ index +1 }`
    ).join(', ');
    if(setString.length === 0) { 
        return; 
    }
    try {

      const { rows: [user] } = await client.query(
        `
        UPDATE users
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
        `, [fields.name, fields.location]); //Object.values(fields))
      //id, username, name, location, active
      //return rows;
      return user;
    } catch (error) {
        throw error;

    }
}

async function getUserByID(userID) {
  let sql = `
        SELECT * FROM users WHERE id = $1;`;
  try {
    const {rows: [users]} = await client.query(sql, [userID]);

    if (users){
        //delete the 'password' key
        delete users.password;        
        //Get posts
              const userPosts = await getPostsByUser(userID);
        // add posts to user objects
        users.posts = userPosts; 
        return users;
     }
    else {
         return null;
    }
} catch (error) {
     throw error;
   }
}

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
    const posts = await Promise.all(
      postIds.map((post) => getPostById(post.id))
    );
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
        //somehow tags are being lost coming through the following line.
   const posts = await Promise.all(postIds.map((post) => getPostById(post.id)));
        // console.log("TEMP: ", posts)
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

/***** ADD TAG Functions *****/
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

async function createTableTags() {
  try {
    console.log("3.1  Creating 'tags' table");
    await client.query(
      `CREATE TABLE tags (
        id SERIAL PRIMARY KEY,
        name varchar(255) UNIQUE NOT NULL);
      `
    );
    console.log("#### - Finished creating 'tags' table - ####");
  } catch (error) {
    console.error("Error creating 'tags' tables!");
    throw error;
  }
}

async function createTablePost_Tags() {
  try {
    console.log("3.2  Creating 'post_tags' table");
    await client.query(
      `CREATE TABLE post_tags (
        id SERIAL PRIMARY KEY,
        "postId" INTEGER REFERENCES posts(id), 
        "tagId" INTEGER REFERENCES tags(id) ,
        UNIQUE("postId", "tagId")
        );`
    );
    console.log("#### - Finished creating 'post_tags' table - ####");
  } catch (error) {
    console.error("Error creating 'post_tags' tables!");
    throw error;
  }
}

/**** Functions *******/
async function createTags(tagData) {
  let insertResults = [];
  let i = 1;
  const placeHolderString = Object.keys(tagData)
    .map(() => {
      let placeHolder = `($${i})`;
      i = i + 1;
      return placeHolder;
    })
    .join(", ");
  let sql = `INSERT INTO tags(name)
    VALUES ${placeHolderString} 
    ON CONFLICT (name) DO NOTHING RETURNING *`;

  let selectSQL = `Select * from tags WHERE name IN (${placeHolderString})`;

  try {
    const { rows } = await client.query(sql, tagData);
    if (!rows.length) {
      return [];
    }

    try {
      const { rows } = await client.query(selectSQL, tagData);
      if (!rows) {
        return null;
      }
      insertResults = rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
    return insertResults;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getAllTags() {
  const { rows } = await client.query(`SELECT * FROM tags;`);
  return rows;
}

async function getPostTags(postID) {
  const sql = `
    SELECT tags.* 
    FROM tags
    LEFT JOIN post_tags ON tags.id=post_tags."tagId"
    WHERE post_tags."postId" = $1`;

  try {
    const { rows: tags } = await client.query(sql, [postID]);
    if (!tags) {
      return null;
    }
    return tags;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function createPostTag(postId, tagID) {
  const sql = `INSERT INTO post_tags("postId", "tagId")
    VALUES ($1, $2)
ON CONFLICT ("postId", "tagId") DO NOTHING;`;
  try {
    await client.query(sql, [postId, tagID.id]);
  } catch (error) {
    console.error(error);
    throw error;
  }
}




/**** Export Functions *******/
module.exports = {
  client,
  createTableUsers,
  createInitialUsers,
  getAllUsers,
  updateUser,
  getUserByID,
  createTablePosts,
  createInitialPosts,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getPostById,
  addTagsToPost,
  getPostsByTagName,
  createTableTags,
  createTablePost_Tags,
  createTags,
  getAllTags,
  createPostTag,
  getPostTags,
};



