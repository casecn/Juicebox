const { Client } = require("pg");


const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'juicebox-dev',
    password: 'Dustyrats_22',
    port: 5433,
})

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
    try {
        const { rows: [ user ] } = await client.query(
          `INSERT INTO users (username, password, name, location) VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING id, username, name, location, active;
        `,
          [username, password, name, location]
        );
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
module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
};



