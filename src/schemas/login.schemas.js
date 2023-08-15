import joi from "joi";

export const loginSchema = joi.object({
  email: joi.string().required().email(),
  password: joi.string().required().min(8),
});
