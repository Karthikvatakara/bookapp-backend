import mongoose,{ Schema, Document, model } from "mongoose";

interface IBook extends Document {
    title: string,
    author: string,
    publicationYear: number,
    isbn: string,
    description?: string;
}

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
    description: {
        type: String
    }

});

export const Book = model<IBook>("Book",bookSchema)