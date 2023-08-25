import joi from "joi";

export const commentSchema = joi.object({
    comment: joi.string().required(),
    userId: joi.number().required(),
    postId: joi.number().required()
})