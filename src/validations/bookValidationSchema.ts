import Joi from "joi";

export const bookValidationSchema = Joi.object({
    title: Joi.string().trim().min(1).required(),
    author: Joi.string().trim().min(1).required(),
    publicationYear: Joi.number().integer().required(),
    isbn: Joi.string().trim().min(1).required(),
    thumbnail: Joi.required(),
    description: Joi.string().trim().optional()
});
