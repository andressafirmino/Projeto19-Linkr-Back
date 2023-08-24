import { Router } from "express";
import { postComment } from "../controllers/comments.controllers.js";

const commentsRouter = Router();

commentsRouter.post("/comments", postComment);

export default commentsRouter;