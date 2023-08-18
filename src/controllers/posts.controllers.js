import {
  postTags,
  publicHasthtag,
  publicPost,
  searchUserRepository,
  deletePostsRepository,
  updatePostsRepository
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
          console.log(noHashtag)
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

export async function updatePost(req, res){
  const { id: postId } = req.params;
  const {link, description} = req.body;
  try {
      await updatePostsRepository(postId, link, description);
      const existingHashtags = await getHashtagsForPost(postId);

      const words = description.split(/\s+/);
      for (const word of words) {
        if (word.startsWith("#")) {
          const noHashtag = word.replace(/^#/, "");

          //verificar se a hashtag ja existe
          const existingHashtags = existingHashtags.find(tag => tag.name === noHashtag );

          if (existingHashtags){
            //atualizar a hashtag existente se necessario
            //check aqui
            // criar algo no tipo await updateHashtag(existingHashtag.id, noHashtag)
          } else {
            // criar a nova 
          }
        }
      }

      // deletar as hastags que sairam nessa update


    
      res.sendStatus(204);
    } catch (err) {
      res.status(500).send(err.message);
    }
}

export async function searchUser(req, res) {
    const {user} = req.query;

    try {
        const users = await searchUserRepository(user);
        res.send(users.rows);
    } catch (err) {
        res.status(500).send(err.message);
      }
}

