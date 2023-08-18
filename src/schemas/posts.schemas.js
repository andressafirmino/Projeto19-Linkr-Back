import joi from "joi";

export const postsSchema = joi.object({
  link: joi.string().uri().required(),
  description: joi.string(),
  userId: joi.number().required(),
});
