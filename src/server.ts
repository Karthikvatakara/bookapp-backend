import express,{ Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize'
import { bookRouter } from './routes/books.routes';
import errorHandler from './middlewares/errorHandler';

dotenv.config();


const app: Application = express();
const PORT : number = Number(process.env.PORT) || 4001


app.use(express.json());
app.use(express.urlencoded({extended:true}));

const allowedOrigin = process.env.CLIENT_URL as string;
const corsOptions = {
    origin: allowedOrigin,
    methods: ["GET,HEAD,PUT,POST,DELETE"],
    credentials: true
}

app.use(cors(corsOptions));
app.use(mongoSanitize());

app.use("/api", bookRouter)

app.use("*", (req: Request, res: Response) => {
    res.status(404).json({ success: false, status: 404, message: "API NOT FOUND"})
})

app.use(errorHandler)

app.listen(PORT,() => {
    console.log(`connected succesfully to ${PORT}`);
})

export default app;