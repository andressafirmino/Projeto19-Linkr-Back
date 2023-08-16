import { Router } from "express";
import { postHashtag } from "../controllers/posts.controllers.js";
import validateSchema from "../middlewares/validationSchemas.middleswares.js";
import { postsSchema } from "../schemas/posts.schemas.js";

const postsRouter = Router();

postsRouter.post("/timeline", validateSchema(postsSchema), postHashtag);

export default postsRouter;