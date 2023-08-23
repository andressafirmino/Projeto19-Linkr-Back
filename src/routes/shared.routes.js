import { Router } from "express";
import { addRepost } from "../controllers/shared.controllers.js";

const sharedRouter = Router();

sharedRouter.put("/repost/:postId/:userId", addRepost);

export default sharedRouter;
