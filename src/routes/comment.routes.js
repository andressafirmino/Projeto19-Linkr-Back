import { Router } from "express";
import { postComment } from "../controllers/comments.controllers.js";
import { authenticateToken } from "../middlewares/validationToken.middlewares.js";
import validateSchema from "../middlewares/validationSchemas.middleswares.js";
import { commentSchema } from "../schemas/comment.schemas.js";
import { getPostsTimeLine } from "../repositories/posts.repository.js";

const commentsRouter = Router();

commentsRouter.post("/comments", authenticateToken, validateSchema(commentSchema), postComment);

export default commentsRouter;