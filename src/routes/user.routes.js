import { Router } from "express";
import {
  follow,
  getPostsFromUser,
  unfollow,
} from "../controllers/user.controllers.js";

const userRouter = Router();

userRouter.get("/user/:id", getPostsFromUser);
userRouter.post("/follow", follow);
userRouter.delete("/unfollow", unfollow);

export default userRouter;
