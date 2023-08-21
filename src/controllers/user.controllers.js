import { db } from "../database/database.connection.js";
import { userPosts, userInfo } from "../repositories/posts.repository.js";

export async function getPostsFromUser(req, res) {
  const { id } = req.params;

  try {
    const postsResult = await userPosts(id);

    const userResult = await userInfo(id);

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
