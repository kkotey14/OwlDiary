import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import pkg from "pg";

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Database setup
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});



// Helper functions
const dbGet = async (sql, params = []) => {
    const { rows } = await db.query(sql, params);
    return rows[0] || null;
};

const dbAll = async (sql, params = []) => {
    const { rows } = await db.query(sql, params);
    return rows;
};

const dbRun = async (sql, params = []) => {
    const result = await db.query(sql, params);
    return {
        lastID: result.rows[0]?.id || null,
        changes: result.rowCount,
    };
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
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
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

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Authentication token required." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token." });
        }
        req.user = user;
        next();
    });
};

app.post("/api/signup", async (req, res) => {
    console.log("Signup request received");
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Please provide all required fields." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
        const about_me = "New community member";

        await dbRun(
            "INSERT INTO students (name, email, password, avatar_url, about_me) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [name, email, hashedPassword, avatar_url, about_me],
        );

        return res.status(201).json({ message: "User created successfully." });
    } catch (error) {
        console.error("Signup error:", error);
        if (error.message.includes("unique constraint") || error.message.includes("duplicate key")) {
            return res.status(409).json({ error: "Email already exists." });
        }
        return res.status(500).json({ error: "Server error during signup request processing." });
    }
});

app.post("/api/login", async (req, res) => {
    console.log("Login request received");
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Please provide email and password." });
        }

        const user = await dbGet("SELECT * FROM students WHERE email = $1", [email]);

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
        return res.status(500).json({ error: "Server error during login request processing." });
    }
});

app.get("/api/user-stats/:userId", authenticateToken, async (req, res) => {
    const { userId } = req.params;

    if (req.user.id != userId) {
        return res.status(403).json({ message: "Forbidden: Unauthorized to view these stats." });
    }

    try {
        const postsCount = await dbGet("SELECT COUNT(*) as count FROM posts WHERE student_id = $1", [userId]);
        const commentsCount = await dbGet("SELECT COUNT(*) as count FROM comments WHERE user_id = $1", [userId]);
        const likesCountResult = await dbGet("SELECT COUNT(*) as count FROM likes WHERE user_id = $1", [userId]);
        const receivedLikesCount = await dbGet("SELECT SUM(likes) as count FROM posts WHERE student_id = $1", [userId]);
        const userProfile = await dbGet("SELECT name, avatar_url, about_me FROM students WHERE id = $1", [userId]);

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
        return res.status(500).json({ message: "Server error while fetching user stats." });
    }
});

app.post("/api/posts", authenticateToken, upload.single("media"), async (req, res) => {
    const { title, content, post_type, font_family } = req.body;
    const student_id = req.user.id;
    const media_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!student_id || !title || !content || !post_type) {
        return res.status(400).json({ message: "All fields are required to create a post." });
    }

    try {
        const result = await db.query(
            "INSERT INTO posts (student_id, title, content, post_type, media_url, likes, created_at, is_hidden, display_order, post_font_family) VALUES ($1, $2, $3, $4, $5, 0, CURRENT_TIMESTAMP, 0, NULL, $6) RETURNING id",
            [student_id, title, content, post_type, media_url, font_family || null],
        );
        const newPostId = result.rows[0].id;

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
});

app.post("/api/posts/:id/like", authenticateToken, async (req, res) => {
    const { id: postId } = req.params;
    const userId = req.user.id;

    try {
        const existingLike = await dbGet(
            "SELECT * FROM likes WHERE user_id = $1 AND post_id = $2",
            [userId, postId],
        );

        if (existingLike) {
            await dbRun("DELETE FROM likes WHERE user_id = $1 AND post_id = $2", [userId, postId]);
            await dbRun("UPDATE posts SET likes = likes - 1 WHERE id = $1", [postId]);
        } else {
            await dbRun("INSERT INTO likes (user_id, post_id) VALUES ($1, $2)", [userId, postId]);
            await dbRun("UPDATE posts SET likes = likes + 1 WHERE id = $1", [postId]);
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
            return res.status(404).json({ message: "Post not found after update." });
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
        return res.status(400).json({ message: "Title and content are required." });
    }

    try {
        const existingPost = await dbGet("SELECT * FROM posts WHERE id = $1", [postId]);
        if (!existingPost) {
            return res.status(404).json({ message: "Post not found." });
        }
        if (existingPost.student_id !== userId) {
            return res.status(403).json({ message: "Forbidden: You can only edit your own posts." });
        }

        await dbRun("UPDATE posts SET title = $1, content = $2 WHERE id = $3", [title, content, postId]);

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
    const hiddenValue = is_hidden === true || is_hidden === 1 || is_hidden === "1" || is_hidden === "true" ? 1 : 0;

    try {
        const existingPost = await dbGet("SELECT * FROM posts WHERE id = $1", [postId]);
        if (!existingPost) {
            return res.status(404).json({ message: "Post not found." });
        }
        if (!isAdmin) {
            const roleRow = await dbGet("SELECT role FROM students WHERE id = $1", [userId]);
            isAdmin = roleRow && roleRow.role === "admin";
        }
        if (!isAdmin && existingPost.student_id !== userId) {
            return res.status(403).json({ message: "Forbidden: You can only hide your own posts." });
        }

        await dbRun("UPDATE posts SET is_hidden = $1 WHERE id = $2", [hiddenValue, postId]);

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
        return res.status(500).json({ message: "Error updating post visibility." });
    }
});

app.put("/api/posts/reorder", authenticateToken, async (req, res) => {
    const { postIds } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(postIds) || postIds.length === 0) {
        return res.status(400).json({ message: "postIds array is required." });
    }

    const client = await db.connect();
    try {
        await client.query("BEGIN");
        for (let i = 0; i < postIds.length; i++) {
            const postId = postIds[i];
            const { rows } = await client.query("SELECT student_id FROM posts WHERE id = $1", [postId]);
            const existingPost = rows[0];
            if (!existingPost || existingPost.student_id !== userId) {
                await client.query("ROLLBACK");
                client.release();
                return res.status(403).json({ message: "Forbidden: Invalid post ownership." });
            }
            await client.query("UPDATE posts SET display_order = $1 WHERE id = $2", [i, postId]);
        }
        await client.query("COMMIT");
        client.release();
        return res.json({ success: true });
    } catch (error) {
        await client.query("ROLLBACK");
        client.release();
        console.error("Error reordering posts:", error);
        return res.status(500).json({ message: "Error reordering posts." });
    }
});

app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
    const { id: postId } = req.params;
    const userId = req.user.id;

    try {
        const existingPost = await dbGet("SELECT * FROM posts WHERE id = $1", [postId]);
        if (!existingPost) {
            return res.status(404).json({ message: "Post not found." });
        }
        if (existingPost.student_id !== userId) {
            return res.status(403).json({ message: "Forbidden: You can only delete your own posts." });
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
                c.id, c.content, c.created_at,
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
        return res.status(400).json({ message: "Comment content is required." });
    }

    try {
        const { lastID: newCommentId } = await dbRun(
            "INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING id",
            [postId, userId, content.trim()],
        );

        const newComment = await dbGet(
            `SELECT 
                c.id, c.content, c.created_at,
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

app.put("/api/profile", authenticateToken, avatarUpload.single("avatar"), async (req, res) => {
    const { about_me, name, appearance_theme, font_family, accent_color, font_size } = req.body;
    const userId = req.user.id;
    const avatar_url = req.file ? `/uploads/${req.file.filename}` : null;

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

    if (updates.length === 0) {
        return res.status(400).json({ message: "No profile updates provided." });
    }

    try {
        params.push(userId);
        await dbRun(`UPDATE students SET ${updates.join(", ")} WHERE id = $${paramCount}`, params);

        const updatedUser = await dbGet(
            "SELECT id, name, email, about_me, avatar_url, appearance_theme, font_family, accent_color, font_size FROM students WHERE id = $1",
            [userId],
        );

        return res.json(updatedUser);
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ message: "Error updating profile." });
    }
});

app.get("/api/export", authenticateToken, async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized access." });
    }

    try {
        const userId = req.user.id;

        const user = await dbGet("SELECT name, email, about_me FROM students WHERE id = $1", [userId]);

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
            user: { name: user.name, email: user.email, about_me: user.about_me },
            summary: {
                totalPosts: posts.length,
                totalComments: comments.length,
                totalLikesReceived: posts.reduce((sum, p) => sum + (p.likes || 0), 0),
            },
            posts,
            comments,
        };

        res.setHeader("Content-Disposition", `attachment; filename="export-${userId}.json"`);
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error exporting data:", error);
        res.status(500).json({ error: "Failed to export data." });
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
        return res.status(500).json({ message: "Server error while fetching posts." });
    }
});

app.get("/api/students", async (req, res) => {
    try {
        const rows = await dbAll("SELECT * FROM students ORDER BY name");
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
            "SELECT * FROM quotes WHERE date_for IS NULL ORDER BY RANDOM() LIMIT 1"
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
        return res.status(403).json({ message: "Forbidden: Only professors can schedule quotes." });
    }

    if (!text || !date_for) {
        return res.status(400).json({ message: "text and date_for are required." });
    }

    try {
        await dbRun(
            "INSERT INTO quotes (text, author, date_for, is_manual, created_by) VALUES ($1, $2, $3, 1, $4) RETURNING id",
            [text, author || "Unknown", date_for, req.user.id],
        );
        return res.status(201).json({ message: "Quote scheduled successfully." });
    } catch (error) {
        if (error.message.includes("unique constraint") || error.message.includes("duplicate key")) {
            return res.status(409).json({ message: "A quote is already scheduled for that date." });
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

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});