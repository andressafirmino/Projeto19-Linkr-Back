import { repost } from "../repositories/shared.repository.js";

export async function addRepost(req, res) {
  const { userId } = req.params;
  const { postId } = req.params;
  try {
    const result = await repost(userId, postId);
    res.status(201).send(result.rows);
  } catch (error) {
    res.status(500).send(err.message);
  }
}
