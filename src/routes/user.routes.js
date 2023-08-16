import { Router } from "express";
import { getPostsFromUser} from "../controllers/user.controllers.js";

const userRouter = Router();

userRouter.get("/user/:id", getPostsFromUser);

export default userRouter;