import { addComment } from "../repositories/comments.repository.js";

export async function postComment(req, res) {
    const { comment, postId, userId } = req.body;

    try {
        await addComment(comment, postId, userId);
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
}