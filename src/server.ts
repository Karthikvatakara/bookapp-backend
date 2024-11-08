import express,{ Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize'
import { bookRouter } from './routes/books.routes';
import errorHandler from './middlewares/errorHandler';
import { elasticsearchService   } from './services/elasticSearch.service';

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

app.use(errorHandler);

app.use("*", (req: Request, res: Response) => {
    res.status(404).json({ success: false, status: 404, message: "API NOT FOUND"})
})

const startServer = async () => {
    try {
        await elasticsearchService.initIndex();
        app.listen(PORT, () => {
            console.log(`Server connected successfully on port ${PORT}`);
            console.log('Elasticsearch initialized');
        });
    } catch (error) {
        console.error('Failed to initialize Elasticsearch:', error);
        process.exit(1);
    }
};

startServer();


export default app;