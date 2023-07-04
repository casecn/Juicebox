const { Client } = require("pg");

/***** Connect to the `juicebox-dev` database ********/
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'juicebox-dev',
    password: 'Dustyrats_22',
    port: 5433,
})

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
        sql = `INSERT INTO users (username, password, name, location) VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING id, username, name, location, active;
        `;
        data = [username, password, name, location];
        //console.log(data);
    try {
        const { rows: [ user ] } = await client.query(sql, data);
        return user;
    } catch (error) {
        throw error;
    }
}

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
/**** Posts Functions ****/
async function createPosts({ authorID, title, content }) {
    //console.log("AuthorID:", authorID, "Title:", title, "Content:", content)
    const sql = 'INSERT INTO posts (\"authorID\", title, content) VALUES ($1, $2, $3) RETURNING *'
    const data = [authorID, title, content]
    //console.log(data);
    try {
    const {
      rows: [posts],
    } = await client.query(sql, data);
    return posts;
  } catch (error) {
    throw error;
  }
}

async function getAllposts() {
    const { rows } = await client.query(`SELECT * FROM posts;`);
    return rows;
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

  sql = `
        UPDATE posts
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
        `
  try {
    const {
      rows: [post],
    } = await client.query( sql, keyList); 
 
    return post;
  } catch (error) {
    throw error;
  }
}

async function getPostsByUser(userID) {
    console.log("Posts by User #", userID)
  sql = `
        SELECT * FROM posts WHERE "authorID" = $1;`
  try {
    const {rows } = await client.query(sql, [userID]);

    return rows;
  } catch (error) {
    throw error;
  }
}

/**** Export Functions *******/
module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPosts,
  updatePost,
  getAllposts,
  getPostsByUser,
};



