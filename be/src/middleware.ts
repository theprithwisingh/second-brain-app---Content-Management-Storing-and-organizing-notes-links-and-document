import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];
    const token = header?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        if (decoded) {
            req.userId = decoded.id;
            next();
        } else {
            return res.status(403).json({ message: "You are not logged in" });
        }
    } catch (e) {
        return res.status(403).json({ message: "Invalid token" });
    }
};

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}
