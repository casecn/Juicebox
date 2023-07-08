const { client } = require("./index");

const { getPostById } = require("./posts");

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
async function createInitialTags() {
  try {
    console.log("Starting to create tags...");

    const [happy, sad, inspo, catman] = await createTags([
      "#happy",
      "#worst-day-ever",
      "#youcandoanything",
      "#catmandoeverything",
    ]);

    const [postOne, postTwo, postThree] = await getAllPosts();

    await addTagsToPost(postOne.id, [happy, inspo]);
    await addTagsToPost(postTwo.id, [sad, inspo]);
    await addTagsToPost(postThree.id, [happy, catman, inspo]);

    console.log("Finished creating tags!");
  } catch (error) {
    console.log("Error creating tags!");
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
  const sql = `INSERT INTO post_tags ("postId", "tagId")
    VALUES ($1, $2) 
    ON CONFLICT ("postId", "tagId") DO NOTHING`;
  try {
    await client.query(sql, [postId, tagID.id]);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**** Export Functions *******/
module.exports = {
  createTableTags,
  createTablePost_Tags,
  createTags,
  getAllTags,
  createPostTag,
  getPostTags,
  createInitialTags,
};
