import {Request, Response, NextFunction} from "express";

export function logger(req: Request, _res: Response, next: NextFunction) {
    console.log(`🦓🦓🦓 [INCOMING_REQUEST]: ${req.method} ${req.originalUrl}`);
    next();
}