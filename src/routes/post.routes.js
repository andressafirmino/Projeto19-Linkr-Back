import { Router } from "express";
import {
  getPostByTag,
  postHashtag,
  searchUser,
  deletePost,
  updatePost,
  getTrendingHashtags,
  getPostsFromTimeline,
} from "../controllers/posts.controllers.js";
import validateSchema from "../middlewares/validationSchemas.middleswares.js";
import { postsSchema } from "../schemas/posts.schemas.js";
import {
  checkUserLikedPost,
  getPosts,
  getPostsRefactor,
  likePost,
  unlikePost,
} from "../repositories/posts.repository.js";
import { authenticateToken } from "../middlewares/validationToken.middlewares.js";
import { updateSchema } from "../schemas/update.schemas.js";

const postsRouter = Router();

postsRouter.get("/posts", getPostsRefactor); //!retorna todos os posts
postsRouter.get("/checkLike", checkUserLikedPost);
postsRouter.post("/like/:postId", likePost);
postsRouter.delete("/unlike/:postId", unlikePost);
postsRouter.post(
  "/timeline",
  authenticateToken,
  validateSchema(postsSchema),
  postHashtag
);
postsRouter.delete("/post/:id", authenticateToken, deletePost);
postsRouter.put(
  "/post/:id",
  authenticateToken,
  validateSchema(updateSchema),
  updatePost
);
postsRouter.get("/", getPosts);
postsRouter.get("/timeline", getPostsFromTimeline); //! retorna todos os posts que o usuário segue
postsRouter.get("/search", authenticateToken, searchUser);
postsRouter.get("/hashtag/:hashtag/:id", getPostByTag); //! retorna todos os posts pela hashtag em comum
postsRouter.get("/trending", getTrendingHashtags);

export default postsRouter;
