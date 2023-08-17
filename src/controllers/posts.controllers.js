import {
  postTags,
  publicHasthtag,
  publicPost,
  deletePostsRepository,
  updatePostsRepository
} from "../repositories/posts.repository.js";

export async function postHashtag(req, res) {
  const { link, description, userId } = req.body;

  try {
    const idPost = await publicPost(link, description, userId);
    const words = description.split(/\s+/);
    words.forEach(async (word) => {
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

