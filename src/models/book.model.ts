import mongoose,{ Schema, Document, model } from "mongoose";
import { IBook } from "../interfaces/IBook";


const bookSchema : Schema = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    publicationYear: {
        type: Number,
        required: true
    },
    isbn: {
        type: String,
        required: true,
        unique: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    description: {
        type: String
    }

});

export const Book = model<IBook>("Book",bookSchema)