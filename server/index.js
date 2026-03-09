import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import postgres from "postgres";
import { RequireAdmin } from "./middleware/RequireAdmin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SCHEMA_PATH = path.join(__dirname, "../Database/schema.sql");

// Database setup
const sql = postgres(process.env.DATABASE_URL, {
    ssl: "require",
});

// Helper functions
const executeQuery = async (query, params = []) => {
    if (typeof query === "string") {
        return sql.unsafe(query, params);
    }
    return query;
};

const dbGet = async (query, params = []) => {
    const result = await executeQuery(query, params);
    return Array.isArray(result) ? result[0] || null : null;
};

const dbAll = async (query, params = []) => {
    try {
        const result = await executeQuery(query, params);
        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error("Error in dbAll:", error);
        throw error;
    }
};

const dbRun = async (query, params = []) => {
    const result = await executeQuery(query, params);
    return {
        lastID: Array.isArray(result) ? result[0]?.id || null : null,
        changes:
            typeof result?.count === "number"
                ? result.count
                : Array.isArray(result)
                  ? result.length
                  : 0,
    };
};

const initializeDatabase = async () => {
    const tableExists = await sql`
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = 'students'
        )
    `;

    if (tableExists[0].exists) {
        console.log("Database schema already exists. Skipping initialization.");
        return;
    }

    console.log("Initializing database schema...");

    const schema = fs.readFileSync(SCHEMA_PATH, "utf8");

    const cleanedSchema = schema
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n");

    const statements = cleanedSchema
        .split(/;\s*(?:\n|$)/g)
        .map((statement) => statement.trim())
        .filter(Boolean);

    for (const statement of statements) {
        await sql.unsafe(statement);
    }

    console.log("Database schema initialized successfully.");
};

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "uploads"));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype.startsWith("image/") ||
        file.mimetype.startsWith("video/")
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only image and video files are allowed!"), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "uploads"));
    },
    filename: function (req, file, cb) {
        const userId = req.user ? req.user.id : "unknown";
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
        cb(null, `profile-${userId}-${Date.now()}-${safeName}`);
    },
});

const avatarUpload = multer({
    storage: avatarStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed for avatars."), false);
        }
    },
});
const galleryStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "uploads"));
    },
    filename: function (req, file, cb) {
        const userId = req.user ? req.user.id : "unknown";
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
        cb(null, `gallery-${userId}-${Date.now()}-${safeName}`);
    },
});
const galleryUpload = multer({
    storage: galleryStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(
                new Error("Only image files are allowed for gallery uploads."),
                false,
            );
        }
    },
});

const authenticateToken = (req, res, next) => {
    console.log("Inside authenticateToken middleware");
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res
            .status(401)
            .json({ error: "Authentication token required." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token." });
        }
        console.log("Token verified for user:", user);
        req.user = user;
        next();
    });
};

app.post("/api/signup", async (req, res) => {
    console.log("Signup request received");
    // Added 'code' to the destructuring
    const { name, email, password, code } = req.body;

    if (!name || !email || !password || !code) {
        return res.status(400).json({
            error: "All fields including registration code are required.",
        });
    }

    try {
        // 1. Verify the registration code is active and correct
        const validCode = await dbGet(sql`
            SELECT * FROM registration_codes 
            WHERE code = ${code.toUpperCase()} AND is_active = true
        `);

        if (!validCode) {
            return res
                .status(401)
                .json({ error: "Invalid or expired registration code." });
        }

        // 2. Proceed with existing signup logic
        const hashedPassword = await bcrypt.hash(password, 10);
        const avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
        const about_me = "New community member";

        await dbRun(sql`
INSERT INTO students (name, email, password, avatar_url, about_me, approval_status)
VALUES (${name}, ${email}, ${hashedPassword}, ${avatar_url}, ${about_me}, 'pending')
RETURNING id
`);

        return res.status(201).json({ message: "User created successfully." });
    } catch (error) {
        console.error("Signup error:", error);
        if (
            error.message.includes("unique constraint") ||
            error.message.includes("duplicate key")
        ) {
            return res.status(409).json({ error: "Email already exists." });
        }
        return res
            .status(500)
            .json({ error: "Server error during signup request processing." });
    }
});

app.post("/api/login", async (req, res) => {
    console.log("Login request received");
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Please provide email and password." });
        }

        const user = await dbGet(sql`
            SELECT * FROM students WHERE email = ${email}
        `);

        if (user.approval_status !== "approved") {
            return res.status(403).json({
                error: "Your account is awaiting admin approval.",
            });
        }

        if (!user) {
            return res.status(401).json({ error: "User not found." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role || "user" },
            JWT_SECRET,
            { expiresIn: "1h" },
        );
        return res.json({ token });
    } catch (error) {
        console.error("Login error:", error);
        return res
            .status(500)
            .json({ error: "Server error during login request processing." });
    }
});

app.get("/api/user-stats/:userId", authenticateToken, async (req, res) => {
    const { userId } = req.params;

    if (req.user.id != userId) {
        return res
            .status(403)
            .json({ message: "Forbidden: Unauthorized to view these stats." });
    }

    try {
        const postsCount = await dbGet(sql`
            SELECT COUNT(*) as count FROM posts WHERE student_id = ${userId}
        `);

        const commentsCount = await dbGet(sql`
            SELECT COUNT(*) as count FROM comments WHERE user_id = ${userId}
        `);

        const likesCountResult = await dbGet(sql`
            SELECT COUNT(*) as count FROM likes WHERE user_id = ${userId}
        `);

        const receivedLikesCount = await dbGet(sql`
            SELECT SUM(likes) as count FROM posts WHERE student_id = ${userId}
        `);

        const userProfile = await dbGet(sql`
            SELECT name, avatar_url, about_me FROM students WHERE id = ${userId}
        `);

        return res.json({
            posts: parseInt(postsCount?.count) || 0,
            comments: parseInt(commentsCount?.count) || 0,
            likes: parseInt(likesCountResult?.count) || 0,
            receivedLikes: parseInt(receivedLikesCount?.count) || 0,
            avatar_url: userProfile?.avatar_url || null,
            name: userProfile?.name || null,
            about_me: userProfile?.about_me || null,
        });
    } catch (error) {
        console.error(`Error fetching user stats for ID ${userId}:`, error);
        return res
            .status(500)
            .json({ message: "Server error while fetching user stats." });
    }
});

app.post(
    "/api/posts",
    authenticateToken,
    upload.single("media"),
    async (req, res) => {
        const { title, content, post_type, font_family } = req.body;
        const student_id = req.user.id;
        const media_url = req.file ? `/uploads/${req.file.filename}` : null;

        if (!student_id || !title || !content || !post_type) {
            return res
                .status(400)
                .json({ message: "All fields are required to create a post." });
        }

        try {
            const result = await dbRun(
                "INSERT INTO posts (student_id, title, content, post_type, media_url, likes, created_at, is_hidden, display_order, post_font_family) VALUES ($1, $2, $3, $4, $5, 0, CURRENT_TIMESTAMP, 0, NULL, $6) RETURNING id",
                [
                    student_id,
                    title,
                    content,
                    post_type,
                    media_url,
                    font_family || null,
                ],
            );
            const newPostId = result.lastID;

            const newPost = await dbGet(
                `SELECT 
                p.id, p.title, p.content, p.post_type, p.likes, p.created_at, p.media_url,
                p.is_hidden, p.display_order, p.post_font_family,
                s.name as student_name, s.avatar_url as student_avatar
            FROM posts p
            JOIN students s ON p.student_id = s.id
            WHERE p.id = $1`,
                [newPostId],
            );

            return res.status(201).json({ success: true, post: newPost });
        } catch (error) {
            console.error("Error creating post:", error);
            return res.status(500).json({ message: "Error creating post." });
        }
    },
);

app.post("/api/posts/:id/like", authenticateToken, async (req, res) => {
    const { id: postId } = req.params;
    const userId = req.user.id;

    try {
        const existingLike = await dbGet(
            "SELECT * FROM likes WHERE user_id = $1 AND post_id = $2",
            [userId, postId],
        );

        if (existingLike) {
            await dbRun(
                "DELETE FROM likes WHERE user_id = $1 AND post_id = $2",
                [userId, postId],
            );
            await dbRun("UPDATE posts SET likes = likes - 1 WHERE id = $1", [
                postId,
            ]);
        } else {
            await dbRun(
                "INSERT INTO likes (user_id, post_id) VALUES ($1, $2)",
                [userId, postId],
            );
            await dbRun("UPDATE posts SET likes = likes + 1 WHERE id = $1", [
                postId,
            ]);
        }

        const updatedPost = await dbGet(
            `SELECT 
                p.id, p.title, p.content, p.post_type, p.likes, p.created_at, p.media_url,
                p.is_hidden, p.display_order, p.post_font_family,
                s.name as student_name, s.avatar_url as student_avatar,
                CASE WHEN EXISTS (SELECT 1 FROM likes WHERE user_id = $1 AND post_id = p.id) THEN 1 ELSE 0 END AS isLiked,
                (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
            FROM posts p
            JOIN students s ON p.student_id = s.id
            LEFT JOIN likes l ON p.id = l.post_id AND l.user_id = $2
            WHERE p.id = $3`,
            [userId, userId, postId],
        );

        if (!updatedPost) {
            return res
                .status(404)
                .json({ message: "Post not found after update." });
        }

        return res.json(updatedPost);
    } catch (error) {
        console.error("Error toggling like:", error);
        return res.status(500).json({ message: "Error toggling like." });
    }
});

app.put("/api/posts/:id", authenticateToken, async (req, res) => {
    const { id: postId } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
        return res
            .status(400)
            .json({ message: "Title and content are required." });
    }

    try {
        const existingPost = await dbGet("SELECT * FROM posts WHERE id = $1", [
            postId,
        ]);
        if (!existingPost) {
            return res.status(404).json({ message: "Post not found." });
        }
        if (existingPost.student_id !== userId) {
            return res.status(403).json({
                message: "Forbidden: You can only edit your own posts.",
            });
        }

        await dbRun("UPDATE posts SET title = $1, content = $2 WHERE id = $3", [
            title,
            content,
            postId,
        ]);

        const updatedPost = await dbGet(
            `SELECT 
                p.id, p.title, p.content, p.post_type, p.likes, p.created_at, p.media_url,
                p.is_hidden, p.display_order, p.post_font_family,
                s.name as student_name, s.avatar_url as student_avatar,
                CASE WHEN EXISTS (SELECT 1 FROM likes WHERE user_id = $1 AND post_id = p.id) THEN 1 ELSE 0 END AS isLiked,
                (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
            FROM posts p
            JOIN students s ON p.student_id = s.id
            WHERE p.id = $2`,
            [userId, postId],
        );

        return res.json(updatedPost);
    } catch (error) {
        console.error("Error updating post:", error);
        return res.status(500).json({ message: "Error updating post." });
    }
});

app.put("/api/posts/:id/visibility", authenticateToken, async (req, res) => {
    const { id: postId } = req.params;
    const { is_hidden } = req.body;
    const userId = req.user.id;
    let isAdmin = req.user && req.user.role === "admin";
    const hiddenValue =
        is_hidden === true ||
        is_hidden === 1 ||
        is_hidden === "1" ||
        is_hidden === "true"
            ? 1
            : 0;

    try {
        const existingPost = await dbGet("SELECT * FROM posts WHERE id = $1", [
            postId,
        ]);
        if (!existingPost) {
            return res.status(404).json({ message: "Post not found." });
        }
        if (!isAdmin) {
            const roleRow = await dbGet(
                "SELECT role FROM students WHERE id = $1",
                [userId],
            );
            isAdmin = roleRow && roleRow.role === "admin";
        }
        if (!isAdmin && existingPost.student_id !== userId) {
            return res.status(403).json({
                message: "Forbidden: You can only hide your own posts.",
            });
        }

        await dbRun("UPDATE posts SET is_hidden = $1 WHERE id = $2", [
            hiddenValue,
            postId,
        ]);

        const updatedPost = await dbGet(
            `SELECT 
                p.id, p.student_id, p.title, p.content, p.post_type, p.likes, p.created_at, p.media_url,
                p.is_hidden, p.display_order, p.post_font_family,
                s.name as student_name, s.avatar_url as student_avatar,
                CASE WHEN EXISTS (SELECT 1 FROM likes WHERE user_id = $1 AND post_id = p.id) THEN 1 ELSE 0 END AS isLiked,
                (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
            FROM posts p
            JOIN students s ON p.student_id = s.id
            WHERE p.id = $2`,
            [userId, postId],
        );

        return res.json(updatedPost);
    } catch (error) {
        console.error("Error updating post visibility:", error);
        return res
            .status(500)
            .json({ message: "Error updating post visibility." });
    }
});

app.put("/api/posts/reorder", authenticateToken, async (req, res) => {
    const { postIds } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(postIds) || postIds.length === 0) {
        return res.status(400).json({ message: "postIds array is required." });
    }

    try {
        await sql.begin(async (transaction) => {
            for (let i = 0; i < postIds.length; i += 1) {
                const postId = postIds[i];
                const existingRows = await transaction.unsafe(
                    "SELECT student_id FROM posts WHERE id = $1",
                    [postId],
                );
                const existingPost = existingRows[0];
                if (
                    !existingPost ||
                    Number(existingPost.student_id) !== Number(userId)
                ) {
                    throw new Error("Forbidden: Invalid post ownership.");
                }

                await transaction.unsafe(
                    "UPDATE posts SET display_order = $1 WHERE id = $2",
                    [i, postId],
                );
            }
        });
        return res.json({ success: true });
    } catch (error) {
        if (error.message === "Forbidden: Invalid post ownership.") {
            return res.status(403).json({ message: error.message });
        }
        console.error("Error reordering posts:", error);
        return res.status(500).json({ message: "Error reordering posts." });
    }
});

app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
    const { id: postId } = req.params;
    const userId = req.user.id;

    try {
        const existingPost = await dbGet("SELECT * FROM posts WHERE id = $1", [
            postId,
        ]);
        if (!existingPost) {
            return res.status(404).json({ message: "Post not found." });
        }
        if (existingPost.student_id !== userId) {
            return res.status(403).json({
                message: "Forbidden: You can only delete your own posts.",
            });
        }

        await dbRun("DELETE FROM comments WHERE post_id = $1", [postId]);
        await dbRun("DELETE FROM likes WHERE post_id = $1", [postId]);
        await dbRun("DELETE FROM posts WHERE id = $1", [postId]);

        return res.json({ success: true });
    } catch (error) {
        console.error("Error deleting post:", error);
        return res.status(500).json({ message: "Error deleting post." });
    }
});

app.get("/api/posts/:id/comments", authenticateToken, async (req, res) => {
    const { id: postId } = req.params;

    try {
        const comments = await dbAll(
            `SELECT 
                c.id, c.user_id, c.content, c.created_at,
                s.name AS user_name, s.avatar_url AS user_avatar
            FROM comments c
            JOIN students s ON c.user_id = s.id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC`,
            [postId],
        );

        return res.json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return res.status(500).json({ message: "Error fetching comments." });
    }
});

app.post("/api/posts/:id/comments", authenticateToken, async (req, res) => {
    const { id: postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
        return res
            .status(400)
            .json({ message: "Comment content is required." });
    }

    try {
        const result = await dbRun(
            "INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING id",
            [postId, userId, content.trim()],
        );

        const newCommentId = result.lastID;

        const newComment = await dbGet(
            `SELECT 
                c.id, c.user_id, c.content, c.created_at,
                s.name AS user_name, s.avatar_url AS user_avatar
            FROM comments c
            JOIN students s ON c.user_id = s.id
            WHERE c.id = $1`,
            [newCommentId],
        );

        return res.status(201).json({ comment: newComment });
    } catch (error) {
        console.error("Error creating comment:", error);
        return res.status(500).json({ message: "Error creating comment." });
    }
});

app.put(
    "/api/profile",
    authenticateToken,
    avatarUpload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "profile_background", maxCount: 1 },
    ]),
    async (req, res) => {
        const {
            about_me,
            name,
            appearance_theme,
            font_family,
            accent_color,
            font_size,
        } = req.body;
        const userId = req.user.id;
        const avatarFile = req.files?.avatar?.[0];
        const backgroundFile = req.files?.profile_background?.[0];
        const avatar_url = avatarFile
            ? `/uploads/${avatarFile.filename}`
            : null;
        const profile_background_url = backgroundFile
            ? `/uploads/${backgroundFile.filename}`
            : null;

        const updates = [];
        const params = [];
        let paramCount = 1;

        if (typeof about_me === "string") {
            updates.push(`about_me = $${paramCount++}`);
            params.push(about_me.trim());
        }
        if (typeof name === "string" && name.trim()) {
            updates.push(`name = $${paramCount++}`);
            params.push(name.trim());
        }
        if (typeof appearance_theme === "string") {
            updates.push(`appearance_theme = $${paramCount++}`);
            params.push(appearance_theme.trim() || null);
        }
        if (typeof font_family === "string") {
            updates.push(`font_family = $${paramCount++}`);
            params.push(font_family.trim() || null);
        }
        if (typeof accent_color === "string") {
            updates.push(`accent_color = $${paramCount++}`);
            params.push(accent_color.trim() || null);
        }
        if (typeof font_size === "string") {
            updates.push(`font_size = $${paramCount++}`);
            params.push(font_size.trim() || null);
        }
        if (avatar_url) {
            updates.push(`avatar_url = $${paramCount++}`);
            params.push(avatar_url);
        }
        if (profile_background_url) {
            updates.push(`profile_background_url = $${paramCount++}`);
            params.push(profile_background_url);
        }

        if (updates.length === 0) {
            return res
                .status(400)
                .json({ message: "No profile updates provided." });
        }

        try {
            params.push(userId);
            await dbRun(
                `UPDATE students SET ${updates.join(", ")} WHERE id = $${paramCount}`,
                params,
            );

            const updatedUser = await dbGet(
                "SELECT id, name, email, about_me, avatar_url, appearance_theme, font_family, accent_color, font_size, profile_background_url FROM students WHERE id = $1",
                [userId],
            );

            return res.json(updatedUser);
        } catch (error) {
            console.error("Error updating profile:", error);
            return res.status(500).json({ message: "Error updating profile." });
        }
    },
);

app.get("/api/export", authenticateToken, async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized access." });
    }

    try {
        const userId = req.user.id;

        const user = await dbGet(
            "SELECT name, email, about_me FROM students WHERE id = $1",
            [userId],
        );

        const posts = await dbAll(
            `SELECT 
                id, title, content,
                post_type AS type,
                media_url AS mediaUrl,
                likes,
                created_at AS createdAt
            FROM posts 
            WHERE student_id = $1 AND is_hidden = 0
            ORDER BY display_order, created_at DESC`,
            [userId],
        );

        const comments = await dbAll(
            `SELECT 
                c.id, c.content,
                c.created_at AS createdAt,
                p.title AS postTitle,
                p.id AS postId
            FROM comments c
            JOIN posts p ON c.post_id = p.id
            WHERE c.user_id = $1
            ORDER BY c.created_at DESC`,
            [userId],
        );

        const data = {
            exportedAt: new Date().toISOString(),
            user: {
                name: user.name,
                email: user.email,
                about_me: user.about_me,
            },
            summary: {
                totalPosts: posts.length,
                totalComments: comments.length,
                totalLikesReceived: posts.reduce(
                    (sum, p) => sum + (p.likes || 0),
                    0,
                ),
            },
            posts,
            comments,
        };

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="export-${userId}.json"`,
        );
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error exporting data:", error);
        res.status(500).json({ error: "Failed to export data." });
    }
});

app.get("/api/posts/:id", authenticateToken, async (req, res) => {
    const { id: postId } = req.params;
    const userId = req.user.id;

    try {
        const post = await dbGet(
            `SELECT 
                p.id, p.student_id, p.title, p.content, p.post_type, p.likes, p.created_at, p.media_url,
                p.is_hidden, p.display_order, p.post_font_family,
                s.name as student_name, s.avatar_url as student_avatar,
                CASE WHEN EXISTS (SELECT 1 FROM likes WHERE user_id = $1 AND post_id = p.id) THEN 1 ELSE 0 END AS isLiked,
                (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
            FROM posts p
            JOIN students s ON p.student_id = s.id
            WHERE p.id = $2`,
            [userId, postId],
        );

        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        return res.json(post);
    } catch (error) {
        console.error("Error fetching post:", error);
        return res.status(500).json({ message: "Error fetching post." });
    }
});

app.get("/api/posts", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const posts = await dbAll(
            `SELECT 
                p.id, p.student_id, p.title, p.content, p.post_type, p.likes, p.created_at, p.media_url,
                p.is_hidden, p.display_order, p.post_font_family,
                s.name as student_name, s.avatar_url as student_avatar,
                CASE WHEN l.user_id IS NOT NULL THEN 1 ELSE 0 END AS isLiked,
                (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
            FROM posts p
            JOIN students s ON p.student_id = s.id
            LEFT JOIN likes l ON p.id = l.post_id AND l.user_id = $1
            WHERE p.is_hidden = 0
            ORDER BY p.created_at DESC`,
            [userId],
        );
        return res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res
            .status(500)
            .json({ message: "Server error while fetching posts." });
    }
});

// Student directory routes
app.get("/api/students", async (req, res) => {
    try {
        const rows = await dbAll(
            `SELECT
              s.*,
              MAX(p.created_at) AS latest_post_at
            FROM students s
            LEFT JOIN posts p ON p.student_id = s.id AND p.is_hidden = 0
            GROUP BY s.id
            ORDER BY s.name`,
        );
        return res.json(rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.get("/api/students/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const row = await dbGet("SELECT * FROM students WHERE id = $1", [id]);
        if (!row) {
            return res.status(404).json({ error: "Student not found" });
        }
        return res.json(row);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.get("/api/students/:id/gallery", async (req, res) => {
    const { id } = req.params;
    try {
        const rows = await dbAll(
            "SELECT id, student_id, photo_url, created_at FROM profile_gallery WHERE student_id = $1 ORDER BY created_at DESC, id DESC",
            [id],
        );
        return res.json(rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.post(
    "/api/profile/gallery",
    authenticateToken,
    galleryUpload.single("photo"),
    async (req, res) => {
        const userId = req.user.id;
        if (!req.file) {
            return res.status(400).json({ error: "Photo file is required." });
        }

        try {
            const photoUrl = `/uploads/${req.file.filename}`;
            const result = await dbRun(
                "INSERT INTO profile_gallery (student_id, photo_url) VALUES ($1, $2) RETURNING id",
                [userId, photoUrl],
            );
            const photo = await dbGet(
                "SELECT id, student_id, photo_url, created_at FROM profile_gallery WHERE id = $1",
                [result.lastID],
            );
            return res.status(201).json(photo);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
);

app.get("/api/students/:id/posts", async (req, res) => {
    const { id } = req.params;
    let requesterId = null;
    const authHeader = req.headers["authorization"];
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            requesterId = decoded.id;
        } catch {
            requesterId = null;
        }
    }
    const isOwner = requesterId && String(requesterId) === String(id);
    const sql = `
        SELECT 
            p.id, p.title, p.content, p.post_type, p.likes, p.created_at, p.media_url,
            p.is_hidden, p.display_order, p.post_font_family,
            s.name as student_name, s.avatar_url as student_avatar,
            (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
        FROM posts p
        JOIN students s ON p.student_id = s.id
        WHERE p.student_id = $1
        ${isOwner ? "" : "AND p.is_hidden = 0"}
        ORDER BY (p.display_order IS NULL) ASC,
                 p.display_order ASC,
                 p.created_at DESC
    `;
    try {
        const rows = await dbAll(sql, [id]);
        return res.json(rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Edit a comment
app.put("/api/comments/:id", authenticateToken, async (req, res) => {
    const { id: commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
        return res
            .status(400)
            .json({ message: "Comment content is required." });
    }

    try {
        const existing = await dbGet("SELECT * FROM comments WHERE id = $1", [
            commentId,
        ]);
        if (!existing)
            return res.status(404).json({ message: "Comment not found." });
        if (existing.user_id !== userId)
            return res.status(403).json({
                message: "Forbidden: You can only edit your own comments.",
            });

        await dbRun("UPDATE comments SET content = $1 WHERE id = $2", [
            content.trim(),
            commentId,
        ]);

        const updated = await dbGet(
            `SELECT c.id, c.content, c.created_at,
                s.name AS user_name, s.avatar_url AS user_avatar
            FROM comments c
            JOIN students s ON c.user_id = s.id
            WHERE c.id = $1`,
            [commentId],
        );

        return res.json({ comment: updated });
    } catch (error) {
        console.error("Error editing comment:", error);
        return res.status(500).json({ message: "Error editing comment." });
    }
});

// Delete a comment
app.delete("/api/comments/:id", authenticateToken, async (req, res) => {
    const { id: commentId } = req.params;
    const userId = req.user.id;

    try {
        const existing = await dbGet("SELECT * FROM comments WHERE id = $1", [
            commentId,
        ]);
        if (!existing)
            return res.status(404).json({ message: "Comment not found." });
        if (existing.user_id !== userId)
            return res.status(403).json({
                message: "Forbidden: You can only delete your own comments.",
            });

        await dbRun("DELETE FROM comments WHERE id = $1", [commentId]);

        return res.json({ success: true });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return res.status(500).json({ message: "Error deleting comment." });
    }
});

//Like a comment
app.post("/api/comments/:id/like", authenticateToken, async (req, res) => {
    const { id: commentId } = req.params;
    const userId = req.user.id;

    try {
        const existingLike = await dbGet(
            "SELECT * FROM comment_likes WHERE user_id = $1 AND comment_id = $2",
            [userId, commentId],
        );

        if (existingLike) {
            await dbRun(
                "DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2",
                [userId, commentId],
            );
            await dbRun("UPDATE comments SET likes = likes - 1 WHERE id = $1", [
                commentId,
            ]);
        } else {
            await dbRun(
                "INSERT INTO comment_likes (user_id, comment_id) VALUES ($1, $2)",
                [userId, commentId],
            );
            await dbRun("UPDATE comments SET likes = likes + 1 WHERE id = $1", [
                commentId,
            ]);
        }

        const updatedComment = await dbGet(
            `SELECT 
                c.id, c.user_id, c.content, c.created_at, c.likes,
                s.name AS user_name, s.avatar_url AS user_avatar,
                CASE WHEN EXISTS (
                    SELECT 1 FROM comment_likes WHERE user_id = $1 AND comment_id = c.id
                ) THEN 1 ELSE 0 END AS isLiked
            FROM comments c
            JOIN students s ON c.user_id = s.id
            WHERE c.id = $2`,
            [userId, commentId],
        );

        if (!updatedComment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        return res.json(updatedComment);
    } catch (error) {
        console.error("Error toggling comment like:", error);
        return res
            .status(500)
            .json({ message: "Error toggling comment like." });
    }
});

//create admine route
app.post(
    "/api/create-admin",
    authenticateToken,
    RequireAdmin,
    async (req, res) => {
        const { name, email, password } = req.body;

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
            const about_me = "Admin account";

            await dbRun(sql`
            INSERT INTO students (name, email, password, avatar_url, about_me, role)
            VALUES (${name}, ${email}, ${hashedPassword}, ${avatar_url}, ${about_me}, 'admin')
        `);

            res.json({ message: "Admin created" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to create admin" });
        }
    },
);
// make codes
app.post(
    "/api/generate-registration-code",
    authenticateToken,
    RequireAdmin,
    async (req, res) => {
        const { code, semester } = req.body;

        if (!code || !semester) {
            return res
                .status(400)
                .json({ error: "Code and semester are required." });
        }

        try {
            // Use a transaction to ensure we only have one active code at a time
            await sql.begin(async (tx) => {
                // 1. Deactivate all previous codes
                await tx`UPDATE registration_codes SET is_active = false WHERE is_active = true`;

                // 2. Insert the new code
                await tx`
                INSERT INTO registration_codes (code, semester, is_active)
                VALUES (${code.toUpperCase()}, ${semester}, true)
            `;
            });

            return res.status(201).json({
                message: "Registration code generated and activated.",
            });
        } catch (error) {
            console.error("Error generating registration code:", error);
            return res
                .status(500)
                .json({ error: "Failed to generate registration code." });
        }
    },
);

// get codes
app.get(
    "/api/registration-codes",
    authenticateToken,
    RequireAdmin,
    async (req, res) => {
        try {
            const codes = await dbAll(sql`
            SELECT code_id, code, semester, is_active, created_at 
            FROM registration_codes 
            ORDER BY created_at DESC
        `);
            return res.json(codes);
        } catch (error) {
            console.error("Error fetching codes:", error);
            return res.status(500).json({ error: "Failed to fetch codes." });
        }
    },
);

// validate codes
app.get("/api/validate-code/:code", async (req, res) => {
    try {
        const { code } = req.params;
        const validCode = await dbGet(sql`
            SELECT 1 FROM registration_codes 
            WHERE code = ${code.toUpperCase()} AND is_active = true
        `);

        return res.json({ isValid: !!validCode });
    } catch (error) {
        console.error("Error validating code:", error);
        return res.status(500).json({ error: "Validation error" });
    }
});

// student approval routes
app.get(
    "/api/students/pending",
    authenticateToken,
    RequireAdmin,
    (req, res) => {
        console.log("Inside /api/students/pending route handler");
        dbAll("SELECT id, name, email FROM students WHERE approval_status = 'pending'")
            .then(students => {
                res.json(students);
            })
            .catch(error => {
                console.log("Caught error in /api/students/pending:", error);
                console.error("Error fetching pending students:", error);
                res.status(500).json({ error: error.message });
            });
    },
);

app.post(
    "/api/students/:id/approve",
    authenticateToken,
    RequireAdmin,
    async (req, res) => {
        const { id } = req.params;

        try {
            await dbRun(
                "UPDATE students SET approval_status = $1 WHERE id = $2",
                ["approved", id],
            );

            res.json({ message: "Student approved." });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to approve student." });
        }
    },
);

app.post(
    "/api/students/:id/deny",
    authenticateToken,
    RequireAdmin,
    async (req, res) => {
        const { id } = req.params;

        try {
            await dbRun(
                "UPDATE students SET approval_status = $1 WHERE id = $2",
                ["denied", id],
            );

            res.json({ message: "Student denied." });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to deny student." });
        }
    },
);

app.post(
    "/api/students/approve-all",
    authenticateToken,
    RequireAdmin,
    async (req, res) => {
        try {
            await dbRun(
                "UPDATE students SET approval_status = $1 WHERE approval_status = $2",
                ["approved", "pending"],
            );

            res.json({ message: "All pending students approved." });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to approve students." });
        }
    },
);

//api/me
app.get("/api/me", authenticateToken, RequireAdmin, async (req, res) => {
    try {
        const user = await dbGet(
            "SELECT id, name, email, role FROM students WHERE id = $1",
            [req.user.id],
        );

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch user." });
    }
});

// GET /api/quote/today
app.get("/api/quote/today", authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);

        const scheduled = await dbGet(
            "SELECT * FROM quotes WHERE date_for = $1",
            [today],
        );

        if (scheduled) {
            return res.json({ quote: scheduled, source: "manual" });
        }

        const random = await dbGet(
            "SELECT * FROM quotes WHERE date_for IS NULL ORDER BY RANDOM() LIMIT 1",
        );

        if (!random) {
            return res.status(404).json({ message: "No quotes available." });
        }

        return res.json({ quote: random, source: "random" });
    } catch (error) {
        console.error("Error fetching quote:", error);
        return res.status(500).json({ message: "Error fetching quote." });
    }
});

// POST /api/quote
app.post("/api/quote", authenticateToken, async (req, res) => {
    const { text, author, date_for } = req.body;

    if (req.user.role !== "admin" && req.user.role !== "professor") {
        return res.status(403).json({
            message: "Forbidden: Only professors can schedule quotes.",
        });
    }

    if (!text || !date_for) {
        return res
            .status(400)
            .json({ message: "text and date_for are required." });
    }

    try {
        await dbRun(
            "INSERT INTO quotes (text, author, date_for, is_manual, created_by) VALUES ($1, $2, $3, 1, $4) RETURNING id",
            [text, author || "Unknown", date_for, req.user.id],
        );
        return res
            .status(201)
            .json({ message: "Quote scheduled successfully." });
    } catch (error) {
        if (
            error.message.includes("unique constraint") ||
            error.message.includes("duplicate key")
        ) {
            return res.status(409).json({
                message: "A quote is already scheduled for that date.",
            });
        }
        console.error("Error scheduling quote:", error);
        return res.status(500).json({ message: "Error scheduling quote." });
    }
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../dist/index.html"));
    });
} else {
    app.use((req, res) => {
        res.status(404).send("API Route Not Found");
    });
}

const startServer = async () => {
    try {
        await initializeDatabase();
        console.log("Database schema initialization complete.");
    } catch (error) {
        console.error("Database schema initialization failed:", error.message);
    }

    app.listen(port, "0.0.0.0", () => {
        console.log(`Server listening on port ${port}`);
    });
};

startServer();

export default sql;
