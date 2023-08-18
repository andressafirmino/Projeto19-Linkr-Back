import { Router } from "express";
import { postHashtag, searchUser } from "../controllers/posts.controllers.js";
import validateSchema from "../middlewares/validationSchemas.middleswares.js";
import { postsSchema } from "../schemas/posts.schemas.js";
import {
  checkUserLikedPost,
  getPosts,
  likePost,
  unlikePost,
} from "../repositories/posts.repository.js";
import { authenticateToken } from "../middlewares/validationToken.middlewares.js";

const postsRouter = Router();

postsRouter.get("/posts", getPosts);
postsRouter.get("/checkLike", checkUserLikedPost);
postsRouter.post("/like/:postId", likePost);
postsRouter.delete("/unlike/:postId", unlikePost);
postsRouter.post(
  "/timeline",
  authenticateToken,
  validateSchema(postsSchema),
  postHashtag
);
postsRouter.get("/search", searchUser);

export default postsRouter;
