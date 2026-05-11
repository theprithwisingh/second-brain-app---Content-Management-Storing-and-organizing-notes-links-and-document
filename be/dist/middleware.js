"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const userMiddleware = (req, res, next) => {
    const header = req.headers["authorization"];
    const token = header?.split(" ")[1];
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        if (decoded) {
            req.userId = decoded.id;
            next();
        }
        else {
            return res.status(403).json({ message: "You are not logged in" });
        }
    }
    catch (e) {
        return res.status(403).json({ message: "Invalid token" });
    }
};
exports.userMiddleware = userMiddleware;
