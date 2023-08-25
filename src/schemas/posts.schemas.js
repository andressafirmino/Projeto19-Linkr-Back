import joi from "joi";

export const postsSchema = joi.object({
  link: joi.string().uri().required(),
  description: joi.string().allow(""),
  userId: joi.number().required()
});
