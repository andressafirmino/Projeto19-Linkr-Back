import { Router } from "express";
import loginRouter from "./login.routes.js";

const router = Router();

router.use(loginRouter);

export default router;
