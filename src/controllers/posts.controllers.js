import {
  postTags,
  publicHasthtag,
  publicPost,
  getTagByName,
  searchUserRepository,
} from "../repositories/posts.repository.js";

export async function postHashtag(req, res) {
  const { link, description, userId } = req.body;

  try {
    const idPost = await publicPost(link, description, userId);
    const words = description.split(/\s+/);
    const hashtagPromises = words.map(async (word) => {
      if (word.startsWith("#")) {
        try {
          const noHashtag = word.replace(/^#/, "");
          const insertHash = await publicHasthtag(noHashtag);
          console.log(noHashtag);
          await postTags(idPost.rows[0].id, insertHash.rows[0].id);
        } catch (err) {
          res.status(500).send(err.message);
        }
      }
    });
    await Promise.all(hashtagPromises);
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function searchUser(req, res) {
  const { user } = req.query;

  try {
    const users = await searchUserRepository(user);
    res.send(users.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function getPostByTag(req, res) {
  const { hashtag } = req.params;
  const { id } = req.params;

  try {
    const result = await getTagByName(id, hashtag);

    res.status(200).send(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
