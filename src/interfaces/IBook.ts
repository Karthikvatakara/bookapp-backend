import { Document , Types } from "mongoose";

export interface IBook extends Document {
    _id: Types.ObjectId;
    title: string;
    author: string;
    publicationYear: number;
    isbn: string;
    thumbnail: string;
    description?: string;
}
