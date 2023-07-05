
const { client } = require("./index");
const { getPostsByUser } = require("./posts");

//Initialize Users Functions
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


  /**** Export Functions *******/
  module.exports = {
    createTableUsers,
    createInitialUsers,
    getAllUsers,
    updateUser,
    getUserByID,
  };