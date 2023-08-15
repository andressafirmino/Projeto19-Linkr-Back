import Joi from "joi";

export const signupSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().required().email(),
    image: Joi.string().required(),
    password: Joi.string().required().min(8)
});