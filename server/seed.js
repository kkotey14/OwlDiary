import "dotenv/config";
import pkg from "pg";
import bcrypt from "bcrypt";

const { Pool } = pkg;

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function seedDatabase() {
    try {
        const row = await db.query("SELECT COUNT(*) AS count FROM students");
        const count = parseInt(row.rows[0]?.count ?? 0);

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
            await db.query(
                "INSERT INTO students (name, email, password, about_me, avatar_url) VALUES ($1, $2, $3, $4, $5)",
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
            await db.query(
                "INSERT INTO posts (student_id, title, content, post_type) VALUES ($1, $2, $3, $4)",
                [p.student_id, p.title, p.content, p.type],
            );
        }

        // Seed starter quotes
        const quotesRow = await db.query("SELECT COUNT(*) AS count FROM quotes");
        if (parseInt(quotesRow.rows[0]?.count ?? 0) === 0) {
            const starterQuotes = [
                { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
                { text: "It always seems impossible until it is done.", author: "Nelson Mandela" },
                { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
                { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
                { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
            ];
            for (const q of starterQuotes) {
                await db.query(
                    "INSERT INTO quotes (text, author, is_manual) VALUES ($1, $2, 0)",
                    [q.text, q.author],
                );
            }
            console.log("Quotes seeded.");
        }

        console.log("Database seeded.");
    } catch (error) {
        console.error("Error while seeding database", error.message);
    } finally {
        await db.end();
    }
}

seedDatabase();
