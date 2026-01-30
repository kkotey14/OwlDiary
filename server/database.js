import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'classroom_blog.db');
const SCHEMA_PATH = path.join(__dirname, '../Database/schema.sql');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    console.log('Attempting to initialize database schema from:', SCHEMA_PATH);
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error initializing database schema', err.message);
        } else {
            console.log('Database schema initialized successfully.');
            seedDatabase();
        }
    });
}

async function seedDatabase() {
    const checkStudentsSql = 'SELECT COUNT(*) AS count FROM students';
    db.get(checkStudentsSql, async (err, row) => {
        if (err) {
            console.error('Error checking students table', err.message);
            return;
        }

        console.log('Current student count:', row.count); // Added console log
        if (row.count === 0) {
            console.log('Seeding initial student and post data...');
            
            const saltRounds = 10;
            const students = [
                {
                    name: 'Admin User',
                    email: 'admin@test.com',
                    password: 'password123',
                    about: 'I am the admin.',
                    avatar: 'https://i.pravatar.cc/150?img=1'
                },
                {
                    name: 'Mike Example',
                    email: 'mike@example.com',
                    password: 'password456',
                    about: 'Just a regular user.',
                    avatar: 'https://i.pravatar.cc/150?img=2'
                }
            ];

            const insertStudent = db.prepare('INSERT INTO students (name, email, password, about_me, avatar_url) VALUES (?, ?, ?, ?, ?)');
            
            for (const s of students) {
                const hashedPassword = await bcrypt.hash(s.password, saltRounds);
                insertStudent.run(s.name, s.email, hashedPassword, s.about, s.avatar);
            }
            
            insertStudent.finalize();

            const insertPost = db.prepare('INSERT INTO posts (student_id, title, content, post_type) VALUES (?, ?, ?, ?)');
            const posts = [
                { student_id: 1, title: 'Admin Post', content: 'This is a post from the admin.', type: 'text' },
                { student_id: 2, title: 'Mike\'s Musings', content: 'Hello world!', type: 'text' },
            ];
            posts.forEach(p => insertPost.run(p.student_id, p.title, p.content, p.type));
            insertPost.finalize(err => {
                 if (!err) console.log('Database seeded.');
            });
        } else {
            console.log('Database already contains data.');
        }
    });
}

export default db;