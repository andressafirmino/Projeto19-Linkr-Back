import { Router } from "express";
import { postHashtag, searchUser, deletePost, updatePost } from "../controllers/posts.controllers.js";
import validateSchema from "../middlewares/validationSchemas.middleswares.js";
import { postsSchema } from "../schemas/posts.schemas.js";
import { getPosts } from "../repositories/posts.repository.js";
import { authenticateToken } from "../middlewares/validationToken.middlewares.js";

const postsRouter = Router();

postsRouter.post("/timeline", authenticateToken, validateSchema(postsSchema), postHashtag);
postsRouter.delete("/timeline/:id", deletePost)
postsRouter.put("/timeline/:id", validateSchema(postsSchema), updatePost);
postsRouter.get("/", getPosts);
postsRouter.get("/search", searchUser);

export default postsRouter;
