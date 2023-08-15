import Joi from "joi";

export const signupSchema = Joi.object({
    username: Joi.string().required(),
    email: joi.string().required().email(),
    image: joi.string().required(),
    password: joi.string().required().min(8)
});