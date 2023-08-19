import { db } from "../database/database.connection.js";

export async function getPostsFromUser(req, res) {
  const { id } = req.params;

  try {
    const postsQuery = `SELECT * FROM posts WHERE "userId" = $1`;
    const postsResult = await db.query(postsQuery, [id]);

    const userQuery = `SELECT username, image FROM users WHERE id = $1`;
    const userResult = await db.query(userQuery, [id]);

    if (userResult.rowCount === 0) {
      return res.status(404).send("Usuário não encontrado");
    }

    const userData = {
      username: userResult.rows[0].username,
      image: userResult.rows[0].image,
      posts: postsResult.rows,
    };

    res.status(200).json(userData);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
