import { userPosts, userInfo } from "../repositories/posts.repository.js";
import {
  checkFollowUser,
  followUser,
  getFollowing,
  unfollowUser,
} from "../repositories/user.repository.js";
import { getPostsRefactor } from "../repositories/posts.repository.js";

export async function getPostsFromUser(req, res) {
  const { id } = req.params;
  const { userId, page } = req.query;

  const viewingPage = page ? Number(page) : 1;

  try {
    const postsFromUser = await getPostsRefactor(userId);

    const response = postsFromUser.slice(
      (viewingPage - 1) * 10,
      viewingPage * 10
    );

    if (response.length === 0) {
      return res.status(204).send("No more posts to show");
    }

    const userResult = await userInfo(id);

    if (userResult.rowCount === 0) {
      return res.status(404).send("Usuário não encontrado");
    }

    const isFollowing = await checkFollowUser(id, userId);

    const userData = {
      id: userResult.rows[0].id,
      username: userResult.rows[0].username,
      image: userResult.rows[0].image,
      posts: postsFromUser.rows,
      isFollowing: isFollowing,
    };

    res.status(200).send({ userData, response });
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

export async function usersFollowing(req, res) {
  const { id } = req.params;

  try {
    const following = await getFollowing(id);
    res.status(200).json({ following });
  } catch (error) {
    console.error("Erro ao obter os usuários que o usuário segue:", error);
    res
      .status(500)
      .json({ message: "Erro ao obter os usuários que o usuário segue." });
  }
}
