"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("./db");
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const signupSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(10),
    password: zod_1.z.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/)
});
// 1. Signup
app.post('/api/v1/signup', async (req, res) => {
    try {
        const parsedBody = signupSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(411).json({ message: "Error in inputs" });
        }
        const { username, password } = parsedBody.data;
        const existingUser = await db_1.User.findOne({ username });
        if (existingUser) {
            return res.status(403).json({ message: "User already exists with this username" });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        await db_1.User.create({ username, password: hashedPassword });
        res.status(200).json({ message: "Signed up" });
    }
    catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});
// 2 & 3. Signin + JWT token issued
app.post('/api/v1/signin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await db_1.User.findOne({ username });
        if (!user) {
            return res.status(403).json({ message: "Invalid credentials" });
        }
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(403).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, config_1.JWT_SECRET);
        res.status(200).json({ token });
    }
    catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});
// 4 & 5. Save content (authenticated via userMiddleware)
app.post('/api/v1/content', middleware_1.userMiddleware, async (req, res) => {
    try {
        const { link, type, title, tags } = req.body;
        let tagIds = [];
        if (tags && tags.length > 0) {
            for (const tagTitle of tags) {
                let tag = await db_1.Tag.findOne({ title: tagTitle });
                if (!tag) {
                    tag = await db_1.Tag.create({ title: tagTitle });
                }
                tagIds.push(tag._id);
            }
        }
        await db_1.Content.create({ link, type, title, tags: tagIds, userId: req.userId });
        res.status(200).json({ message: "Content added" });
    }
    catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});
// 6. Read content (authenticated)
app.get('/api/v1/content', middleware_1.userMiddleware, async (req, res) => {
    try {
        const content = await db_1.Content.find({ userId: req.userId })
            .populate('tags', 'title')
            .populate('userId', 'username');
        const formattedContent = content.map((c) => ({
            id: c._id,
            type: c.type,
            link: c.link,
            title: c.title,
            tags: c.tags.map((t) => t.title)
        }));
        res.status(200).json({ content: formattedContent });
    }
    catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});
// Delete content (authenticated)
app.delete('/api/v1/content', middleware_1.userMiddleware, async (req, res) => {
    try {
        const { contentId } = req.body;
        const content = await db_1.Content.findOne({ _id: contentId });
        if (!content) {
            return res.status(404).json({ message: "Content not found" });
        }
        if (content.userId.toString() !== req.userId) {
            return res.status(403).json({ message: "Trying to delete a doc you don't own" });
        }
        await db_1.Content.deleteOne({ _id: contentId });
        res.status(200).json({ message: "Delete succeeded" });
    }
    catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});
// 7. Share brain — toggle public share link
app.post('/api/v1/brain/share', middleware_1.userMiddleware, async (req, res) => {
    try {
        const { share } = req.body;
        if (share) {
            const existingLink = await db_1.Link.findOne({ userId: req.userId });
            if (existingLink) {
                return res.status(200).json({ link: existingLink.hash });
            }
            const hash = crypto_1.default.randomBytes(16).toString('hex');
            await db_1.Link.create({ userId: req.userId, hash });
            res.status(200).json({ link: hash });
        }
        else {
            await db_1.Link.deleteOne({ userId: req.userId });
            res.status(200).json({ message: "Share link disabled" });
        }
    }
    catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});
// 7. View shared brain (public — no auth)
app.get('/api/v1/brain/:shareLink', async (req, res) => {
    try {
        const shareLink = req.params.shareLink;
        const link = await db_1.Link.findOne({ hash: shareLink }).populate('userId', 'username');
        if (!link) {
            return res.status(404).json({ message: "Share link is invalid or sharing is disabled" });
        }
        const content = await db_1.Content.find({ userId: link.userId })
            .populate('tags', 'title');
        const formattedContent = content.map((c) => ({
            id: c._id,
            type: c.type,
            link: c.link,
            title: c.title,
            tags: c.tags.map((t) => t.title)
        }));
        res.status(200).json({
            username: link.userId.username,
            content: formattedContent
        });
    }
    catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});
const PORT = process.env.PORT || 3001;
mongoose_1.default.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/brain").then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
