import { NextFunction, Request, Response } from "express";
import { Book } from "../models/book.model";
import { bookValidationSchema } from "../validations/bookValidationSchema";
import ErrorResponse from "../middlewares/ErrorResponse";
import { error } from "console";
import { elasticsearchService } from "../services/elasticSearch.service";

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

        const indexResult = await elasticsearchService.indexBook(newBook);

        res.status(200).json({ success: true, data: newBook, message: "book created succesfully"})
    }catch(error){
        next(error)
    }
}

export const getAllBooks = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const books = await elasticsearchService.getAllBooks();
        
        res.status(200).json({ 
            success: true, 
            data: books, 
            message: "Books fetched successfully"
        });
    } catch(error) {
        next(error);
    }
}

export const searchBooks = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            res.status(400).json({
                success: false,
                message: "Search query is required"
            });
            return; 
        }

        const books = await elasticsearchService.searchBooks(q as string);
        
        res.status(200).json({ 
            success: true, 
            data: books, 
            message: "Search results fetched successfully"
        });
    } catch(error) {
        next(error);
    }
}

// export const getAllBooks = async( req: Request, res: Response, next: NextFunction ) => {
//     try{

//         const { q } = req.query;

//         const books = await elasticsearchService.getBooks(q as string)
//         // const filter : any = {} ;

//         // if(q) {
//         //     filter.$or = [
//         //         { title: { $regex: q, $options: 'i'}},
//         //         { author: { $regex: q, $options: 'i'}},
//         //         { description: { $regex: q, $options: 'i'}}
//         //     ]
//         // }
//         // const books = await Book.find(filter);

//         res.status(200).json({ success: true, data: books, message: "books fetched succesfully"})
//     }catch(error){
//         next(error)
//     }
// }

export const getBooksById = async( req: Request, res: Response, next: NextFunction ) => {
    try{
        const { bookId } = req.params;

        const book = await elasticsearchService.getBookById(bookId);
        // const book = await Book.findById(bookId);

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
        console.log("🚀 ~ deleteBookById ~ bookId:", bookId)

        const deleteBook = await Book.findByIdAndDelete(bookId);

        if(!deleteBook) {
            return next(ErrorResponse.notFound("book not found"));
        }

        await elasticsearchService.deleteBook(bookId);

        res.status(200).json({ success: true, message:  "book deleted succesfully"})
    }catch(error){
        next(error)
    }
}



  

export const updateBookById = async( req: Request, res: Response, next: NextFunction ) => {
    try{
        const { bookId } = req.params;

        const data = req.body;

        const { error, value } = bookValidationSchema.validate(data,{ abortEarly: false });

        if(error){
            throw new Error((error as Error)?.message);
        }

        const updatedBook = await Book.findByIdAndUpdate(bookId, value,{ new: true });

        if(!updatedBook) {  
            return next(ErrorResponse.notFound("book not found"))
        }

        await elasticsearchService.updateBook(bookId,updatedBook);

        res.status(200).json({ success: true, data: updatedBook, message: "book updated succesfully"})
    }catch{
        next(error)
    }
}