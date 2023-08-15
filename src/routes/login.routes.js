import { Router } from "express";
import validateSchema from "../middlewares/validationSchemas.middleswares.js";
import { loginSchema } from "../schemas/login.schemas.js";
import { login } from "../controllers/login.controllers.js";

const loginRouter = Router();

loginRouter.post("/", validateSchema(loginSchema), login);

export default loginRouter;
