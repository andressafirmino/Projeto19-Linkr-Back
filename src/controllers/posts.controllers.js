import { postTags, publicHasthtag, publicPost } from "../repositories/posts.repository.js";

export async function postHashtag(req, res) {
    const { link, description, userId} = req.body;

    try {
        const idPost = await publicPost(link, description, userId);
        const words = description.split(/\s+/);
        words.forEach(async (word) => {
            if (word.startsWith("#")) {
                try {
                    const noHashtag = word.replace(/^#/, "");
                    const insertHash = await publicHasthtag(noHashtag);
                    await postTags(idPost.rows[0].id, insertHash.rows[0].id);
                }
                catch (err) {
                    res.status(500).send(err.message);
                }
            }
        });
        res.sendStatus(201);
     } catch (err) {
        res.status(500).send(err.message);
    }
}
