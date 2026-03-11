-- Create the students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    about_me TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    appearance_theme TEXT,
    font_family TEXT,
    accent_color TEXT,
    font_size TEXT,
    profile_background_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_status TEXT DEFAULT 'pending'
);

-- Create the posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT NOT NULL CHECK(post_type IN ('text', 'image', 'video')),
    media_url TEXT,
    is_hidden INTEGER DEFAULT 0,
    display_order INTEGER,
    post_font_family TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the likes table
CREATE TABLE IF NOT EXISTS likes (
    user_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, post_id)
);

-- Create the comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the profile gallery table
CREATE TABLE IF NOT EXISTS profile_gallery (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    display_order INTEGER,
    title TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    link_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the social_links table
CREATE TABLE IF NOT EXISTS social_links (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    author TEXT DEFAULT 'Unknown',
    date_for TEXT UNIQUE,
    is_manual INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES students(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registration_codes (
    code_id SERIAL PRIMARY KEY,
    code VARCHAR(5) NOT NULL UNIQUE,
    semester TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);