import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cors from 'cors';
import { z } from 'zod';
import crypto from 'crypto';

import { User, Content, Tag, Link } from './db';
import { JWT_SECRET } from './config';
import { userMiddleware } from './middleware';

const app = express();
app.use(express.json());
app.use(cors());

const signupSchema = z.object({
    username: z.string().min(3).max(10),
    password: z.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/)
});

// 1. Signup
app.post('/api/v1/signup', async (req, res) => {
    try {
        const parsedBody = signupSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(411).json({ message: "Error in inputs" });
        }
        const { username, password } = parsedBody.data;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(403).json({ message: "User already exists with this username" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword });
        res.status(200).json({ message: "Signed up" });
    } catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});

// 2 & 3. Signin + JWT token issued
app.post('/api/v1/signin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(403).json({ message: "Invalid credentials" });
        }
        const passwordMatch = await bcrypt.compare(password, user.password as string);
        if (!passwordMatch) {
            return res.status(403).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET);
        res.status(200).json({ token });
    } catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});

// 4 & 5. Save content (authenticated via userMiddleware)
app.post('/api/v1/content', userMiddleware, async (req, res) => {
    try {
        const { link, type, title, tags } = req.body;

        let tagIds = [];
        if (tags && tags.length > 0) {
            for (const tagTitle of tags) {
                let tag = await Tag.findOne({ title: tagTitle });
                if (!tag) {
                    tag = await Tag.create({ title: tagTitle });
                }
                tagIds.push(tag._id);
            }
        }

        await Content.create({ link, type, title, tags: tagIds, userId: req.userId });
        res.status(200).json({ message: "Content added" });
    } catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});

// 6. Read content (authenticated)
app.get('/api/v1/content', userMiddleware, async (req, res) => {
    try {
        const content = await Content.find({ userId: req.userId })
            .populate('tags', 'title')
            .populate('userId', 'username');

        const formattedContent = content.map((c: any) => ({
            id: c._id,
            type: c.type,
            link: c.link,
            title: c.title,
            tags: c.tags.map((t: any) => t.title)
        }));

        res.status(200).json({ content: formattedContent });
    } catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});

// Delete content (authenticated)
app.delete('/api/v1/content', userMiddleware, async (req, res) => {
    try {
        const { contentId } = req.body;
        const content = await Content.findOne({ _id: contentId });

        if (!content) {
            return res.status(404).json({ message: "Content not found" });
        }
        if (content.userId.toString() !== req.userId) {
            return res.status(403).json({ message: "Trying to delete a doc you don't own" });
        }

        await Content.deleteOne({ _id: contentId });
        res.status(200).json({ message: "Delete succeeded" });
    } catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});

// 7. Share brain — toggle public share link
app.post('/api/v1/brain/share', userMiddleware, async (req, res) => {
    try {
        const { share } = req.body;
        if (share) {
            const existingLink = await Link.findOne({ userId: req.userId });
            if (existingLink) {
                return res.status(200).json({ link: existingLink.hash });
            }
            const hash = crypto.randomBytes(16).toString('hex');
            await Link.create({ userId: req.userId, hash });
            res.status(200).json({ link: hash });
        } else {
            await Link.deleteOne({ userId: req.userId });
            res.status(200).json({ message: "Share link disabled" });
        }
    } catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});

// 7. View shared brain (public — no auth)
app.get('/api/v1/brain/:shareLink', async (req, res) => {
    try {
        const shareLink = req.params.shareLink as string;
        const link = await Link.findOne({ hash: shareLink }).populate('userId', 'username');

        if (!link) {
            return res.status(404).json({ message: "Share link is invalid or sharing is disabled" });
        }

        const content = await Content.find({ userId: link.userId })
            .populate('tags', 'title');

        const formattedContent = content.map((c: any) => ({
            id: c._id,
            type: c.type,
            link: c.link,
            title: c.title,
            tags: c.tags.map((t: any) => t.title)
        }));

        res.status(200).json({
            username: (link.userId as any).username,
            content: formattedContent
        });
    } catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});

const PORT = process.env.PORT || 3001;
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/brain").then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

//Prithwi