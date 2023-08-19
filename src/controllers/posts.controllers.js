import {
  postTags,
  publicHasthtag,
  publicPost,
  getTagByName,
  searchUserRepository,
  deletePostsRepository,
  updatePostRepository,
  getPostHashtags,
  getPostHashtagsNames,
  deleteInPostHashtags,
  deleteHashtags,
  getHashtags,getCountPostHashtags
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

export async function deletePost(req, res){
  const { id } = req.params;
  try {
    await deletePostsRepository(id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function updatePost(req, res) {
  const { id: postId } = req.params;
  const { link, description } = req.body;
  try {
    const currentHashtagsId = await getPostHashtags(postId);
    const words = description.split(/\s+/);
    const newHashtags = [];
    
    words.forEach((word) => {
      if (word.startsWith("#")) {
        const noHashtag = word.replace(/^#/, "");
        newHashtags.push(noHashtag);
      }
    });
    const currentHashtagsName = await getPostHashtagsNames(currentHashtagsId)

    const itensInNewHashtags = newHashtags.filter(item => !currentHashtagsName.includes(item));
    const itensInCurrentHashtagsName = currentHashtagsName.filter(item => !newHashtags.includes(item));

    for (const hashtag of itensInNewHashtags) {
      const result = await publicHasthtag(hashtag);
      const hashtagId = result.rows[0].id;
      await postTags(postId, hashtagId);
    }   

    for (const hashtagName of itensInCurrentHashtagsName) {

      const hashtagIdQuery = await getHashtags(hashtagName); 
      const hashtagId = hashtagIdQuery.rows[0].id;
      const postHashtagsCountQuery = await getCountPostHashtags(hashtagId, postId)
      const postHashtagsCount = postHashtagsCountQuery.rows[0].count;
    
      if (postHashtagsCount === "0") {
        await deleteInPostHashtags(hashtagId, postId)
        await deleteHashtags(hashtagId)
      } else {
        await deleteInPostHashtags(hashtagId, postId)
      }
    }

    await updatePostRepository(postId, link, description);
    res.sendStatus(200);
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
