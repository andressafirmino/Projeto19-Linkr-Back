import { Router } from "express";
import { deletePost, postHashtag } from "../controllers/posts.controllers.js";
import validateSchema from "../middlewares/validationSchemas.middleswares.js";
import { postsSchema } from "../schemas/posts.schemas.js";
import { authenticateToken } from "../middlewares/validationToken.middlewares.js";

const postsRouter = Router();

postsRouter.post("/timeline", validateSchema(postsSchema), postHashtag);
postsRouter.delete("/timeline/:id", deletePost)

export default postsRouter;
