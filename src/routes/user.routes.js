import { Router } from "express";
import {
  follow,
  getPostsFromUser,
  unfollow,
  usersFollowing,
} from "../controllers/user.controllers.js";

const userRouter = Router();

userRouter.get("/user/:id", getPostsFromUser);
userRouter.post("/follow", follow);
userRouter.delete("/unfollow", unfollow);
userRouter.get("/following/:id", usersFollowing);

export default userRouter;
