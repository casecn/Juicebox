const { client } = require("./index");

async function createTableTags() {
  try {
    console.log("3.1  Creating 'tags' table");
    await client.query(
        `CREATE TABLE tags (
        id SERIAL PRIMARY KEY,
        name varchar(255) UNIQUE NOT NULL);
      `);
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
        "postId" INTEGER REFERENCES posts(id) UNIQUE,
        "tagId" INTEGER REFERENCES tags(id) UNIQUE);`
    );
    console.log("#### - Finished creating 'post_tags' table - ####");
  } catch (error) {
    console.error("Error creating 'post_tags' tables!");
    throw error;
  }
}
/**** Functions *******/
async function createTag( tagData ) {
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
  try {
    const { rows } = await client.query(sql, tagData);
    if (!rows.length) 
    {
        return null;
    }
    return rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**** Export Functions *******/
module.exports = {
  createTableTags,
  createTablePost_Tags,
  createTag,
};
