import util from "util";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer"; // Import multer
import sqlite3 from "sqlite3"; // Import sqlite3
import fs from "fs"; // Import fs

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Database setup
const DB_PATH = path.join(__dirname, "classroom_blog.db");
const SCHEMA_PATH = path.join(__dirname, "../Database/schema.sql");

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error("Error opening database", err.message);
    } else {
        console.log("Connected to the SQLite database.");
        initializeDatabase();
    }
});

// Promisify db methods (keep lastID/changes for run)
const dbGet = db.get.bind(db);
const dbAll = db.all.bind(db);
const dbRun = db.run.bind(db);
db.get = util.promisify(dbGet);
db.all = util.promisify(dbAll);
db.run = (sql, params = []) =>
    new Promise((resolve, reject) => {
        dbRun(sql, params, function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });

async function ensureStudentColumns() {
    try {
        const columns = await db.all("PRAGMA table_info(students)");
        const existing = new Set(columns.map((col) => col.name));

        if (!existing.has("role")) {
            await db.run(
                "ALTER TABLE students ADD COLUMN role TEXT DEFAULT 'user'",
            );
        }
        if (!existing.has("appearance_theme")) {
            await db.run(
                "ALTER TABLE students ADD COLUMN appearance_theme TEXT",
            );
        }

        if (!existing.has("font_family")) {
            await db.run("ALTER TABLE students ADD COLUMN font_family TEXT");
        }
        if (!existing.has("accent_color")) {
            await db.run("ALTER TABLE students ADD COLUMN accent_color TEXT");
        }
        if (!existing.has("font_size")) {
            await db.run("ALTER TABLE students ADD COLUMN font_size TEXT");
        }
        if (!existing.has("profile_background_url")) {
            await db.run(
                "ALTER TABLE students ADD COLUMN profile_background_url TEXT",
            );
        }
    } catch (error) {
        console.error(
            "Error ensuring student appearance columns",
            error.message,
        );
    }
}

async function ensureAdminAccount() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || "Admin";

    if (!adminEmail || !adminPassword) {
        return;
    }

    try {
        const existingAdmin = await db.get(
            "SELECT id FROM students WHERE role = ?",
            ["admin"],
        );
        const existingByEmail = await db.get(
            "SELECT id, role FROM students WHERE email = ?",
            [adminEmail],
        );

        if (existingByEmail) {
            if (existingByEmail.role !== "admin") {
                await db.run("UPDATE students SET role = ? WHERE id = ?", [
                    "admin",
                    existingByEmail.id,
                ]);
            }
            return;
        }

        if (existingAdmin) {
            return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=random`;
        const about_me = "Administrator account";
        await db.run(
            "INSERT INTO students (name, email, password, avatar_url, about_me, role) VALUES (?, ?, ?, ?, ?, ?)",
            [
                adminName,
                adminEmail,
                hashedPassword,
                avatar_url,
                about_me,
                "admin",
            ],
        );
    } catch (error) {
        console.error("Error ensuring admin account", error.message);
    }
}

async function ensurePostColumns() {
    try {
        const columns = await db.all("PRAGMA table_info(posts)");
        const existing = new Set(columns.map((col) => col.name));

        if (!existing.has("is_hidden")) {
            await db.run(
                "ALTER TABLE posts ADD COLUMN is_hidden INTEGER DEFAULT 0",
            );
        }
        if (!existing.has("display_order")) {
            await db.run("ALTER TABLE posts ADD COLUMN display_order INTEGER");
        }
        if (!existing.has("post_font_family")) {
            await db.run("ALTER TABLE posts ADD COLUMN post_font_family TEXT");
        }
    } catch (error) {
        console.error("Error ensuring post visibility column", error.message);
    }
}

function initializeDatabase() {
    const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
    console.log("Attempting to initialize database schema from:", SCHEMA_PATH);
    db.exec(schema, async (err) => {
        if (err) {
            console.error("Error initializing database schema", err.message);
        } else {
            console.log("Database schema initialized successfully.");
            await ensureStudentColumns();
            await ensurePostColumns();
            await ensureAdminAccount();
            seedDatabase();
        }
    });
}

async function seedDatabase() {
    try {
        const checkStudentsSql = "SELECT COUNT(*) AS count FROM students";
        const row = await db.get(checkStudentsSql);
        const count = row?.count ?? 0;

        console.log("Current student count:", count);
        if (count !== 0) {
            console.log("Database already contains data.");
            return;
        }

        console.log("Seeding initial student and post data...");

        const saltRounds = 10;
        const students = [
            {
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                about: "I am the admin.",
                avatar: "https://i.pravatar.cc/150?img=1",
            },
            {
                name: "Mike Example",
                email: "mike@example.com",
                password: "password456",
                about: "Just a regular user.",
                avatar: "https://i.pravatar.cc/150?img=2",
            },
        ];

        for (const s of students) {
            const hashedPassword = await bcrypt.hash(s.password, saltRounds);
            await db.run(
                "INSERT INTO students (name, email, password, about_me, avatar_url) VALUES (?, ?, ?, ?, ?)",
                [s.name, s.email, hashedPassword, s.about, s.avatar],
            );
        }

        const posts = [
            {
                student_id: 1,
                title: "Admin Post",
                content: "This is a post from the admin.",
                type: "text",
            },
            {
                student_id: 2,
                title: "Mike's Musings",
                content: "Hello world!",
                type: "text",
            },
        ];

        for (const p of posts) {
            await db.run(
                "INSERT INTO posts (student_id, title, content, post_type) VALUES (?, ?, ?, ?)",
                [p.student_id, p.title, p.content, p.type],
            );
        }

        console.log("Database seeded.");
    } catch (error) {
        console.error("Error while seeding database", error.message);
    }
}

app.use(cors());
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "uploads"));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

// File filter to accept only images and videos
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
            cb(new Error("Only image files are allowed for gallery uploads."), false);
        }
    },
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
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
        req.user = user;
        next();
    });
};

// API Endpoints
app.post("/api/signup", async (req, res) => {
    console.log("Signup request received");
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res
            .status(400)
            .json({ error: "Please provide all required fields." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
        const about_me = "New community member";

        const sql =
            "INSERT INTO students (name, email, password, avatar_url, about_me) VALUES (?, ?, ?, ?, ?)";

        await db.run(sql, [name, email, hashedPassword, avatar_url, about_me]);

        return res.status(201).json({ message: "User created successfully." });
    } catch (error) {
        console.error("Signup error:", error);
        if (error.message.includes("UNIQUE constraint failed")) {
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
        console.log("Login route: Starting processing for login request.");
        const { email, password } = req.body;
        console.log("Login attempt for:", email);

        if (!email || !password) {
            console.error("Login route: Missing email or password.");
            return res
                .status(400)
                .json({ error: "Please provide email and password." });
        }

        const sql = "SELECT * FROM students WHERE email = ?";
        const user = await db.get(sql, [email]);
        console.log("User found:", user);

        if (!user) {
            console.error("Login route: User not found for email:", email);
            return res.status(401).json({ error: "User not found." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error("Login route: Invalid credentials for email:", email);
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role || "user" },
            JWT_SECRET,
            {
                expiresIn: "1h",
            },
        );
        console.log("Login route: User authenticated, sending token.");
        return res.json({ token });
    } catch (error) {
        console.error("Login error (catch block):", error);
        return res
            .status(500)
            .json({ error: "Server error during login request processing." });
    }
});

app.get("/api/user-stats/:userId", authenticateToken, async (req, res) => {
    const { userId } = req.params;

    if (!req.user) {
        console.error(
            "API /user-stats: Unauthorized - User not authenticated.",
        );
        return res
            .status(401)
            .json({ message: "Unauthorized: User not authenticated." });
    }

    if (!userId) {
        console.error("API /user-stats: Bad Request - User ID is required.");
        return res.status(400).json({ message: "User ID is required." });
    }

    // Ensure the user is requesting their own stats if a token is present
    if (req.user.id != userId) {
        console.error(
            `API /user-stats: Forbidden - User ${req.user.id} attempted to view stats for user ${userId}.`,
        );
        return res
            .status(403)
            .json({ message: "Forbidden: Unauthorized to view these stats." });
    }

    try {
        const postsCount = await db.get(
            "SELECT COUNT(*) as count FROM posts WHERE student_id = ?",
            [userId],
        );
        const commentsCount = await db.get(
            "SELECT COUNT(*) as count FROM comments WHERE user_id = ?",
            [userId],
        );
        const likesCountResult = await db.get(
            "SELECT COUNT(*) as count FROM likes WHERE user_id = ?",
            [userId],
        );
        const receivedLikesCount = await db.get(
            "SELECT SUM(likes) as count FROM posts WHERE student_id = ?",
            [userId],
        );
        const userProfile = await db.get(
            "SELECT name, avatar_url, about_me FROM students WHERE id = ?",
            [userId],
        );

        return res.json({
            posts: postsCount ? postsCount.count : 0,
            comments: commentsCount ? commentsCount.count : 0,
            likes: likesCountResult ? likesCountResult.count : 0, // Likes given by this user
            receivedLikes:
                receivedLikesCount && receivedLikesCount.count
                    ? receivedLikesCount.count
                    : 0, // Likes on this user's posts
            avatar_url: userProfile ? userProfile.avatar_url : null,
            name: userProfile ? userProfile.name : null,
            about_me: userProfile ? userProfile.about_me : null,
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
        const student_id = req.user.id; // Get student_id from authenticated token
        const media_url = req.file ? `/uploads/${req.file.filename}` : null; // Get media URL if file uploaded

        if (!student_id || !title || !content || !post_type) {
            console.error(
                "Error creating post: Missing required fields (student_id, title, content, post_type).",
            );
            return res
                .status(400)
                .json({ message: "All fields are required to create a post." });
        }

        try {
            const insertSql =
                "INSERT INTO posts (student_id, title, content, post_type, media_url, likes, created_at, is_hidden, display_order, post_font_family) VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, 0, NULL, ?)";
            const result = await db.run(insertSql, [
                student_id,
                title,
                content,
                post_type,
                media_url,
                font_family || null,
            ]);
            const newPostId = result.lastID;

            // Fetch the newly created post with all its data, including student info
            const fetchSql = `
      SELECT 
        p.id, p.title, p.content, p.post_type, p.likes, p.created_at, p.media_url,
        p.is_hidden, p.display_order, p.post_font_family,
        s.name as student_name, s.avatar_url as student_avatar
      FROM posts p
      JOIN students s ON p.student_id = s.id
      WHERE p.id = ?`;
            const newPost = await db.get(fetchSql, [newPostId]);

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
        const existingLike = await db.get(
            "SELECT * FROM likes WHERE user_id = ? AND post_id = ?",
            [userId, postId],
        );

        if (existingLike) {
            // User already liked, so unlike
            await db.run(
                "DELETE FROM likes WHERE user_id = ? AND post_id = ?",
                [userId, postId],
            );
            await db.run("UPDATE posts SET likes = likes - 1 WHERE id = ?", [
                postId,
            ]);
        } else {
            // User has not liked, so like
            await db.run("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [
                userId,
                postId,
            ]);
            await db.run("UPDATE posts SET likes = likes + 1 WHERE id = ?", [
                postId,
            ]);
        }

        // Fetch the updated post with all its data, including joined student info and current like status
        const updatedPost = await db.get(
            `SELECT 
        p.id, p.title, p.content, p.post_type, p.likes, p.created_at, p.media_url,
        p.is_hidden, p.display_order, p.post_font_family,
        s.name as student_name, s.avatar_url as student_avatar,
        CASE WHEN EXISTS (SELECT 1 FROM likes WHERE user_id = ? AND post_id = p.id) THEN 1 ELSE 0 END AS isLiked,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
       FROM posts p
       JOIN students s ON p.student_id = s.id
       LEFT JOIN likes l ON p.id = l.post_id AND l.user_id = ?
       WHERE p.id = ?`,
            [userId, userId, postId], // userId for EXISTS and LEFT JOIN, postId for WHERE
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
        const existingPost = await db.get("SELECT * FROM posts WHERE id = ?", [
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

        await db.run("UPDATE posts SET title = ?, content = ? WHERE id = ?", [
            title,
            content,
            postId,
        ]);

        const updatedPost = await db.get(
            `SELECT 
        p.id, p.title, p.content, p.post_type, p.likes, p.created_at, p.media_url,
        p.is_hidden, p.display_order, p.post_font_family,
        s.name as student_name, s.avatar_url as student_avatar,
        CASE WHEN EXISTS (SELECT 1 FROM likes WHERE user_id = ? AND post_id = p.id) THEN 1 ELSE 0 END AS isLiked,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
       FROM posts p
       JOIN students s ON p.student_id = s.id
       WHERE p.id = ?`,
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
        const existingPost = await db.get("SELECT * FROM posts WHERE id = ?", [
            postId,
        ]);
        if (!existingPost) {
            return res.status(404).json({ message: "Post not found." });
        }
        if (!isAdmin) {
            const roleRow = await db.get(
                "SELECT role FROM students WHERE id = ?",
                [userId],
            );
            isAdmin = roleRow && roleRow.role === "admin";
        }
        if (!isAdmin && existingPost.student_id !== userId) {
            return res.status(403).json({
                message: "Forbidden: You can only hide your own posts.",
            });
        }

        await db.run("UPDATE posts SET is_hidden = ? WHERE id = ?", [
            hiddenValue,
            postId,
        ]);

        const updatedPost = await db.get(
            `SELECT 
        p.id, p.student_id, p.title, p.content, p.post_type, p.likes, p.created_at, p.media_url, p.is_hidden, p.display_order, p.post_font_family,
        s.name as student_name, s.avatar_url as student_avatar,
        CASE WHEN EXISTS (SELECT 1 FROM likes WHERE user_id = ? AND post_id = p.id) THEN 1 ELSE 0 END AS isLiked,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
       FROM posts p
       JOIN students s ON p.student_id = s.id
       WHERE p.id = ?`,
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
        await db.run("BEGIN TRANSACTION");
        for (let i = 0; i < postIds.length; i += 1) {
            const postId = postIds[i];
            const existingPost = await db.get(
                "SELECT student_id FROM posts WHERE id = ?",
                [postId],
            );
            if (!existingPost || existingPost.student_id !== userId) {
                await db.run("ROLLBACK");
                return res
                    .status(403)
                    .json({ message: "Forbidden: Invalid post ownership." });
            }
            await db.run("UPDATE posts SET display_order = ? WHERE id = ?", [
                i,
                postId,
            ]);
        }
        await db.run("COMMIT");
        return res.json({ success: true });
    } catch (error) {
        await db.run("ROLLBACK");
        console.error("Error reordering posts:", error);
        return res.status(500).json({ message: "Error reordering posts." });
    }
});

app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
    const { id: postId } = req.params;
    const userId = req.user.id;

    try {
        const existingPost = await db.get("SELECT * FROM posts WHERE id = ?", [
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

        await db.run("DELETE FROM comments WHERE post_id = ?", [postId]);
        await db.run("DELETE FROM likes WHERE post_id = ?", [postId]);
        await db.run("DELETE FROM posts WHERE id = ?", [postId]);

        return res.json({ success: true });
    } catch (error) {
        console.error("Error deleting post:", error);
        return res.status(500).json({ message: "Error deleting post." });
    }
});

app.get("/api/posts/:id/comments", authenticateToken, async (req, res) => {
    const { id: postId } = req.params;

    try {
        const comments = await db.all(
            `SELECT 
        c.id, c.content, c.created_at,
        s.name AS user_name, s.avatar_url AS user_avatar
       FROM comments c
       JOIN students s ON c.user_id = s.id
       WHERE c.post_id = ?
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
        const insertSql =
            "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)";
        const result = await db.run(insertSql, [
            postId,
            userId,
            content.trim(),
        ]);

        const newComment = await db.get(
            `SELECT 
        c.id, c.content, c.created_at,
        s.name AS user_name, s.avatar_url AS user_avatar
       FROM comments c
       JOIN students s ON c.user_id = s.id
       WHERE c.id = ?`,
            [result.lastID],
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
        const avatar_url = avatarFile ? `/uploads/${avatarFile.filename}` : null;
        const profile_background_url = backgroundFile
            ? `/uploads/${backgroundFile.filename}`
            : null;

        const updates = [];
        const params = [];

        if (typeof about_me === "string") {
            updates.push("about_me = ?");
            params.push(about_me.trim());
        }
        if (typeof name === "string" && name.trim()) {
            updates.push("name = ?");
            params.push(name.trim());
        }
        if (typeof appearance_theme === "string") {
            updates.push("appearance_theme = ?");
            params.push(appearance_theme.trim() || null);
        }
        if (typeof font_family === "string") {
            updates.push("font_family = ?");
            params.push(font_family.trim() || null);
        }
        if (typeof accent_color === "string") {
            updates.push("accent_color = ?");
            params.push(accent_color.trim() || null);
        }
        if (typeof font_size === "string") {
            updates.push("font_size = ?");
            params.push(font_size.trim() || null);
        }
        if (avatar_url) {
            updates.push("avatar_url = ?");
            params.push(avatar_url);
        }
        if (profile_background_url) {
            updates.push("profile_background_url = ?");
            params.push(profile_background_url);
        }

        if (updates.length === 0) {
            return res
                .status(400)
                .json({ message: "No profile updates provided." });
        }

        try {
            params.push(userId);
            await db.run(
                `UPDATE students SET ${updates.join(", ")} WHERE id = ?`,
                params,
            );

            const updatedUser = await db.get(
                "SELECT id, name, email, about_me, avatar_url, appearance_theme, font_family, accent_color, font_size, profile_background_url FROM students WHERE id = ?",
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

        const user = await db.get(
            `SELECT name, email, about_me FROM students WHERE id = ?`,
            [userId],
        );

        const posts = await db.all(
            `SELECT 
                id,
                title,
                content,
                post_type        AS type,
                media_url        AS mediaUrl,
                likes,
                created_at       AS createdAt
                FROM posts 
                WHERE student_id = ? AND is_hidden = 0
                ORDER BY display_order, created_at DESC`,
            [userId],
        );

        const comments = await db.all(
            `SELECT 
                c.id,
                c.content,
                c.created_at     AS createdAt,
                p.title          AS postTitle,
                p.id             AS postId
                FROM comments c
                JOIN posts p ON c.post_id = p.id
                WHERE c.user_id = ?
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
            posts: posts,
            comments: comments,
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

app.get("/api/posts", authenticateToken, async (req, res) => {
    if (!req.user) {
        console.error("API /posts: Unauthorized - User not authenticated.");
        return res
            .status(401)
            .json({ message: "Unauthorized: User not authenticated." });
    }

    const userId = req.user.id; // Get current user ID from token
    try {
        const sql = `
      SELECT 
        p.id, p.student_id, p.title, p.content, p.post_type, p.likes, p.created_at, p.media_url, p.is_hidden, p.display_order, p.post_font_family,
        s.name as student_name, s.avatar_url as student_avatar,
        CASE WHEN l.user_id IS NOT NULL THEN 1 ELSE 0 END AS isLiked,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
      FROM posts p
      JOIN students s ON p.student_id = s.id
      LEFT JOIN likes l ON p.id = l.post_id AND l.user_id = ?
      WHERE p.is_hidden = 0
      ORDER BY p.created_at DESC
    `;
        const posts = await db.all(sql, [userId]);
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
        const rows = await db.all(
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
        const row = await db.get("SELECT * FROM students WHERE id = ?", [id]);
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
        const rows = await db.all(
            "SELECT id, student_id, photo_url, created_at FROM profile_gallery WHERE student_id = ? ORDER BY created_at DESC, id DESC",
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
            const result = await db.run(
                "INSERT INTO profile_gallery (student_id, photo_url) VALUES (?, ?)",
                [userId, photoUrl],
            );
            const photo = await db.get(
                "SELECT id, student_id, photo_url, created_at FROM profile_gallery WHERE id = ?",
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
      p.id, p.title, p.content, p.post_type, p.likes, p.created_at, p.media_url, p.is_hidden, p.display_order, p.post_font_family,
      s.name as student_name, s.avatar_url as student_avatar,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
    FROM posts p
    JOIN students s ON p.student_id = s.id
    WHERE p.student_id = ?
    ${isOwner ? "" : "AND p.is_hidden = 0"}
    ORDER BY (p.display_order IS NULL) ASC,
             p.display_order ASC,
             p.created_at DESC
  `;
    try {
        const rows = await db.all(sql, [id]);
        return res.json(rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });
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
