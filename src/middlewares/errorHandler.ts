import { Request, Response, NextFunction } from "express";

const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: error.message || "Something went wrong",
    });
};

export default errorHandler;
