import { publicHasthtag, publicPost } from "../repositories/posts.repository.js";

export async function postHashtag(req, res) {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    const { link, description } = req.body;

    try {
        
        const idPost = await publicPost(link, description, userId);
        const words = description.split(/\s+/);
        //const wordWithHashtag = [];
        console.log(words);
        words.forEach(async (word) => {
            if (word.startsWith("#")) {
                try {
                    const noHashtag = word.replace(/^#/, "");
                    console.log(noHashtag)
                    await publicHasthtag(idPost.rows[0].id, noHashtag);
                }
                catch (err) {
                    res.status(500).send(err.message);
                }
            }
        });

        res.send("foi");
     } catch (err) {
        res.status(500).send(err.message);
    }
}