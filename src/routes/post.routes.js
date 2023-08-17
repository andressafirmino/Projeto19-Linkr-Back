import { Router } from "express";
import { postHashtag } from "../controllers/posts.controllers.js";
import validateSchema from "../middlewares/validationSchemas.middleswares.js";
import { postsSchema } from "../schemas/posts.schemas.js";
import {
  checkUserLikedPost,
  getPosts,
  likePost,
  unlikePost,
} from "../repositories/posts.repository.js";

const postsRouter = Router();

postsRouter.post("/timeline", validateSchema(postsSchema), postHashtag);
postsRouter.get("/", getPosts);
postsRouter.get("/checkLike", checkUserLikedPost);
postsRouter.post("/like/:postId", likePost);
postsRouter.delete("/unlike/:postId", unlikePost);

export default postsRouter;
