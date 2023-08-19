import joi from "joi";

export const updateSchema = joi.object({
  description: joi.string()
});
