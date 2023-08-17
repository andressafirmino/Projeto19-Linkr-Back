import { Router } from "express";
import loginRouter from "./login.routes.js";
import postsRouter from "./post.routes.js";
import userRouter from "./user.routes.js";

const router = Router();

router.use(loginRouter);
router.use(postsRouter);
router.use(userRouter);

export default router;
