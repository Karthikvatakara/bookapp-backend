import { Router } from "express";
import { createBook, getAllBooks, getBooksById, deleteBookById, updateBookById, searchBooks } from "../controllers/book.controller";

const router = Router();

router.route("/books/search")
        .get(searchBooks)

router.route("/books")
        .post(createBook)
        .get(getAllBooks);



router.route("/books/:bookId")
        .get(getBooksById)
        .delete(deleteBookById)
        .put(updateBookById);

export { router as bookRouter }
