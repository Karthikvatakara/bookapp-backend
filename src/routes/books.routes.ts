import { Router } from "express";
import { createBook, getAllBooks, getBooksById } from "../controllers/book.controller";

const router = Router();

// Route for creating a new book
router.route("/books").post(createBook)
                      .get(getAllBooks);

router.route("/books/:bookId").get(getBooksById);

export { router as bookRouter }
