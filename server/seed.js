import "dotenv/config";
import postgres from "postgres";
import bcrypt from "bcrypt";

const sql = postgres(process.env.DATABASE_URL, {
    ssl: "require",
});

async function seedDatabase() {
    try {
        const row = await sql`SELECT COUNT(*) AS count FROM students`;
        const count = parseInt(row[0]?.count ?? 0);

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
                about_me: "I am the admin.",
                avatar_url: "https://i.pravatar.cc/150?img=1",
                role: "admin",
                approval_status: "approved"
            },
            {
                name: "Mike Example",
                email: "mike@example.com",
                password: "password456",
                about_me: "Just a regular user.",
                avatar_url: "https://i.pravatar.cc/150?img=2",
                role: "user",
                approval_status: "approved"
            },
        ];

        for (const s of students) {
            const hashedPassword = await bcrypt.hash(s.password, saltRounds);
            await sql`
                INSERT INTO students (name, email, password, about_me, avatar_url, role, approval_status) 
                VALUES (${s.name}, ${s.email}, ${hashedPassword}, ${s.about_me}, ${s.avatar_url}, ${s.role}, ${s.approval_status})
            `;
        }

        const posts = [
            {
                student_id: 1,
                title: "Admin Post",
                content: "This is a post from the admin.",
                post_type: "text",
            },
            {
                student_id: 2,
                title: "Mike's Musings",
                content: "Hello world!",
                post_type: "text",
            },
        ];

        for (const p of posts) {
            await sql`
                INSERT INTO posts (student_id, title, content, post_type) 
                VALUES (${p.student_id}, ${p.title}, ${p.content}, ${p.post_type})
            `;
        }

        // Seed starter quotes
        const quotesRow = await sql`SELECT COUNT(*) AS count FROM quotes`;
        if (parseInt(quotesRow[0]?.count ?? 0) === 0) {
            const starterQuotes = [
                { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
                { text: "It always seems impossible until it is done.", author: "Nelson Mandela" },
                { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
                { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
                { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
            ];
            for (const q of starterQuotes) {
                await sql`
                    INSERT INTO quotes (text, author, is_manual) 
                    VALUES (${q.text}, ${q.author}, 0)
                `;
            }
            console.log("Quotes seeded.");
        }

        console.log("Database seeded.");
    } catch (error) {
        console.error("Error while seeding database:", error.message);
    } finally {
        await sql.end();
    }
}

seedDatabase();
