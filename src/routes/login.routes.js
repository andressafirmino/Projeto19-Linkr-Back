import { Router } from "express";
import validateSchema from "../middlewares/validationSchemas.middleswares.js";
import { loginSchema } from "../schemas/login.schemas.js";
import { signupSchema } from "../schemas/signup.schemas.js";    
import { login, signUp } from "../controllers/login.controllers.js";

const loginRouter = Router();

loginRouter.post("/sign-up", validateSchema(signupSchema), signUp);
loginRouter.post("/", validateSchema(loginSchema), login);

export default loginRouter;
