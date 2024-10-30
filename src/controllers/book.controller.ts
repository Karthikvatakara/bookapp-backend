import { NextFunction, Request, Response } from "express";
import { Book } from "../models/book.model";
import { bookValidationSchema } from "../validations/bookValidationSchema";
import ErrorResponse from "../middlewares/ErrorResponse";

export const createBook = async( req: Request, res: Response, next: NextFunction ) => {
    try{
        const { error, value } = bookValidationSchema.validate(req.body, { abortEarly: false });

        if(error){
            throw new Error((error as Error)?.message);
        }

        const alreadyExistIsbn = await Book.findOne({ isbn: value.isbn });

        if(alreadyExistIsbn) {
            return next(ErrorResponse.conflict("isbn is already exist"));
        }
        
        const newBook = new Book(value);
        await newBook.save();

        res.status(200).json({ success: true, data: newBook, message: "book created succesfully"})
    }catch(error){
        next(error)
    }
}


export const getAllBooks = async( req: Request, res: Response, next: NextFunction ) => {
    try{
        const books = await Book.find();

        res.status(200).json({ success: true, data: books, message: "books fetched succesfully"})
    }catch(error){
        next(error)
    }
}

export const getBooksById = async( req: Request, res: Response, next: NextFunction ) => {
    try{
        const { bookId } = req.params;

        const book = await Book.findById(bookId);

        if(!book) {
            return next(ErrorResponse.notFound("book not found"));
        }

        res.status(200).json({success: true, data: book, message: " book detail fetched succesfully"})
    }catch(error){
        next(error)
    }
}

export const deleteBookById = async(req: Request, res: Response, next: NextFunction ) => {
    try{
        const { bookId } = req.params;

        const deleteBook = await Book.findByIdAndDelete(bookId);

        if(!deleteBook) {
            return next(ErrorResponse.notFound("book not found"));
        }

        res.status(200).json({ success: true, message:  "book deleted succesfully"})
    }catch(error){
        next(error)
    }
}