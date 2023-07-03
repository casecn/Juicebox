const { Client } = require("pg");


const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'juicebox-dev',
    password: 'Dustyrats_22',
    port: 5433,
})

async function getAllUsers() {
    const { rows } = await client.query(`SELECT id, username FROM users;`);
    return rows;
}

async function createUser({ username, password }) {
    try {
        const { rows } = await client.query(`INSERT INTO users (username, password) VALUES ($1, $2);
        `, [ username, password ]);
        return rows;
    } catch (error) {
        throw error;
    }
}

module.exports = {
  client, getAllUsers, createUser
};



