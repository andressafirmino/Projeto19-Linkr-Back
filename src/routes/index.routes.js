import { Router } from "express";
import loginRouter from "./login.routes.js";
import postsRouter from "./post.routes.js";

const router = Router();

router.use(loginRouter);
router.use(postsRouter)

export default router;
