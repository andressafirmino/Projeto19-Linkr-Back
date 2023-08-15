import { Router } from "express";
import { postHashtag } from "../controllers/posts.controllers.js";

const postsRouter = Router();

postsRouter.post("/timeline", postHashtag);

export default postsRouter;