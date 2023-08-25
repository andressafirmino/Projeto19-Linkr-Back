import { Router } from "express";
import loginRouter from "./login.routes.js";
import postsRouter from "./post.routes.js";
import userRouter from "./user.routes.js";
import sharedRouter from "./shared.routes.js";
import commentsRouter from "./comment.routes.js";

const router = Router();

router.use(loginRouter);
router.use(postsRouter);
router.use(userRouter);
router.use(sharedRouter);
router.use(commentsRouter);

export default router;
