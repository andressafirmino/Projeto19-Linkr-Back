import { userPosts, userInfo } from "../repositories/posts.repository.js";
import {
  checkFollowUser,
  followUser,
  unfollowUser,
} from "../repositories/user.repository.js";

export async function getPostsFromUser(req, res) {
  const { id } = req.params;
  const { userId } = req.query;
  const { page } = req.query;

  try {
    const postsResult = await userPosts(id, page);

    const userResult = await userInfo(id);

    if (userResult.rowCount === 0) {
      return res.status(404).send("Usuário não encontrado");
    }

    const isFollowing = await checkFollowUser(id, userId);

    const userData = {
      id: userResult.rows[0].id,
      username: userResult.rows[0].username,
      image: userResult.rows[0].image,
      posts: postsResult.rows,
      isFollowing: isFollowing,
    };

    res.status(200).json(userData);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function follow(req, res) {
  const { userId, followerId } = req.body;

  try {
    const result = await followUser(userId, followerId);
    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    console.error("Erro ao seguir o usuário:", error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro ao seguir o usuário." });
  }
}

export async function unfollow(req, res) {
  const { userId, followerId } = req.body;

  try {
    const result = await unfollowUser(userId, followerId);
    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    console.error("Erro ao deixar de seguir o usuário:", error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro ao deixar de seguir o usuário." });
  }
}
