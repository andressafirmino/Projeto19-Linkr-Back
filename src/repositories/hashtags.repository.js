import { db } from "../database/database.connection.js";

export async function getHashtags(hashtagName){
  return await db.query(`SELECT "id" FROM hashtags WHERE "name" = $1`, [hashtagName]);
}

export async function deleteHashtags(hashtagId){
  await db.query(`DELETE FROM hashtags WHERE "id" = $1`, [hashtagId]);
}

export async function getPostHashtagsNames(currentHashtagsId) {
  const hashtagsNames = [];
  for (const id of currentHashtagsId) {
    const result = await db.query(`SELECT "name" FROM hashtags WHERE "id" = $1;`, [id]);
    hashtagsNames.push(result.rows[0].name);
  }
  return hashtagsNames;
}

export async function getHashtagIdByName(hashtagName) {
  const result = await db.query(
    `SELECT "id" FROM hashtags WHERE "name" = $1`,
    [hashtagName]
  );

  if (result.rows.length > 0) {
    return result.rows[0].id;
  } else {
    return null; 
  }
}
