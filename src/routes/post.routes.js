import { Router } from "express";
import { postHashtag } from "../controllers/posts.controllers.js";
import validateSchema from "../middlewares/validationSchemas.middleswares.js";
import { postsSchema } from "../schemas/posts.schemas.js";
import { getPosts } from "../repositories/posts.repository.js";

const postsRouter = Router();

postsRouter.post("/timeline", validateSchema(postsSchema), postHashtag);
postsRouter.get("/", getPosts);

export default postsRouter;
