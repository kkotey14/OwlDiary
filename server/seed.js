import "dotenv/config";
import postgres from "postgres";
import bcrypt from "bcrypt";

const sql = postgres(process.env.DATABASE_URL, {
    ssl: "require",
});

const saltRounds = 10;

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@owldiary.demo";
const adminPassword = process.env.ADMIN_PASSWORD?.trim() || null;
const adminName = process.env.ADMIN_NAME?.trim() || "Campus Admin";

const adminStudent = {
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    about_me:
        "Community admin, event organizer, and the person making sure this space feels alive and welcoming every day.",
    avatar_url:
        "https://ui-avatars.com/api/?name=Kingsley+Kotey&background=7c2d12&color=ffffff&size=300",
    role: "admin",
    approval_status: "approved",
    appearance_theme: "classic",
    font_family: "Georgia",
    accent_color: "#7c2d12",
    font_size: "medium",
    profile_background_url:
        "https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1200&q=80",
    social_links: [
        { platform: "Instagram", url: "https://instagram.com/owldiary.community" },
        { platform: "LinkedIn", url: "https://linkedin.com/in/owldiary-admin" },
    ],
    gallery: [
        {
            photo_url:
                "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80",
            title: "Welcome Portrait",
            description: "An illustrated owl-themed visual for the community admin account.",
        },
        {
            photo_url:
                "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
            title: "Community Night",
            description: "A snapshot that makes the admin profile feel active and present.",
        },
    ],
    posts: [
        {
            title: "Welcome to OwlDiary",
            content:
                "<p>This space is for campus life in all its forms: wins, doubts, projects, art, quiet reflections, and the messy middle of becoming someone new.</p><p>If you are here, write something honest. Someone else probably needed to read it.</p>",
            post_type: "text",
            post_font_family: "Georgia",
        },
        {
            title: "What I Hope This Community Becomes",
            content:
                "<p>I want OwlDiary to feel like the table everyone can sit at. Not perfect, not performative, just thoughtful and alive. Leave comments, respond generously, and help each other feel less alone.</p>",
            post_type: "text",
            post_font_family: "Georgia",
        },
    ],
};

const students = [
    adminStudent,
    {
        name: "Maya Thompson",
        email: "maya.thompson@owldiary.demo",
        password: "Password123!",
        about_me:
            "Film club lead, late-night journaler, and the person who always has a campus coffee recommendation ready.",
        avatar_url: "https://i.pravatar.cc/300?img=11",
        role: "user",
        approval_status: "approved",
        appearance_theme: "aurora",
        font_family: "Georgia",
        accent_color: "#1d4ed8",
        font_size: "medium",
        profile_background_url:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        social_links: [
            { platform: "Instagram", url: "https://instagram.com/maya.afterhours" },
            { platform: "Letterboxd", url: "https://letterboxd.com/mayaafterhours" },
        ],
        gallery: [
            {
                photo_url:
                    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
                title: "Sunrise Walk",
                description: "The quiet path behind the arts building before my 8 a.m. class.",
            },
            {
                photo_url:
                    "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=1200&q=80",
                title: "Editing Corner",
                description: "Where most of my film notes and diary drafts happen.",
            },
        ],
        posts: [
            {
                title: "The Semester Finally Feels Real",
                content:
                    "<p>I spent the first two weeks pretending I had everything under control. Today was the first day I admitted I need structure, rest, and fewer dramatic all-nighters. Small win: I mapped out my deadlines and took a walk before sunset instead of staring at my laptop.</p><p>That might be enough for one day.</p>",
                post_type: "text",
                post_font_family: "Georgia",
            },
            {
                title: "Five Movies I Rewatch When I Need My Brain Back",
                content:
                    "<p>When classes get loud, I come back to familiar stories. Not because they solve anything, but because they remind me that pacing matters and silence can still say a lot.</p><p>Current rotation: <strong>Before Sunrise</strong>, <strong>Lady Bird</strong>, <strong>Moonlight</strong>, <strong>Past Lives</strong>, and <strong>Frances Ha</strong>.</p>",
                post_type: "text",
                post_font_family: "Georgia",
            },
        ],
    },
    {
        name: "Jordan Ellis",
        email: "jordan.ellis@owldiary.demo",
        password: "Password123!",
        about_me:
            "Computer science major, intramural soccer midfielder, and serial builder of tiny tools that probably should have stayed in my notes app.",
        avatar_url: "https://i.pravatar.cc/300?img=12",
        role: "user",
        approval_status: "approved",
        appearance_theme: "midnight",
        font_family: "Arial",
        accent_color: "#0f766e",
        font_size: "medium",
        profile_background_url:
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        social_links: [
            { platform: "GitHub", url: "https://github.com/jordan-ellis-demo" },
            { platform: "LinkedIn", url: "https://linkedin.com/in/jordan-ellis-demo" },
        ],
        gallery: [
            {
                photo_url:
                    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
                title: "Hack Night",
                description: "Three energy drinks, one whiteboard, and a surprisingly useful prototype.",
            },
            {
                photo_url:
                    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
                title: "Team Standup",
                description: "The moment before everyone realizes the bug was one missing line.",
            },
        ],
        posts: [
            {
                title: "I Shipped a Small Feature and It Felt Huge",
                content:
                    "<p>I keep waiting for milestones to look impressive from the outside. Usually they do not. Today’s win was a cleaner dashboard filter and one fewer confusing error state. Still counts.</p><p>I am trying to respect incremental progress instead of only celebrating launch days.</p>",
                post_type: "text",
                post_font_family: "Arial",
            },
            {
                title: "On Building Things Before You Feel Ready",
                content:
                    "<p>I used to think confidence came first. It does not. Repetition comes first. Shipping ugly first drafts comes first. Asking better questions comes first.</p><p>Confidence is mostly what happens after you survive enough imperfect attempts.</p>",
                post_type: "text",
                post_font_family: "Arial",
            },
        ],
    },
    {
        name: "Avery Chen",
        email: "avery.chen@owldiary.demo",
        password: "Password123!",
        about_me:
            "Design student, campus magazine contributor, and collector of oddly specific playlists for every possible mood.",
        avatar_url: "https://i.pravatar.cc/300?img=13",
        role: "user",
        approval_status: "approved",
        appearance_theme: "paper",
        font_family: "Trebuchet MS",
        accent_color: "#b45309",
        font_size: "large",
        profile_background_url:
            "https://images.unsplash.com/photo-1518972559570-0d2873e5f3f2?auto=format&fit=crop&w=1200&q=80",
        social_links: [
            { platform: "Behance", url: "https://behance.net/avery-chen-demo" },
            { platform: "Pinterest", url: "https://pinterest.com/avery-chen-demo" },
        ],
        gallery: [
            {
                photo_url:
                    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
                title: "Sketchbook Spread",
                description: "Messy ideas always look better the next day.",
            },
            {
                photo_url:
                    "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
                title: "Reading Table",
                description: "My favorite corner to reset after critique sessions.",
            },
        ],
        posts: [
            {
                title: "What Critique Taught Me This Week",
                content:
                    "<p>Half of design school is learning not to collapse every time someone says, “What if this were simpler?” The other half is realizing they are often right.</p><p>I trimmed one poster layout by almost a third today. It got quieter, clearer, and somehow more like me.</p>",
                post_type: "text",
                post_font_family: "Trebuchet MS",
            },
            {
                title: "Playlist for Recovering From a Hard Week",
                content:
                    "<p>I made a playlist for the walk home after studio: soft synths, warm vocals, and exactly one dramatic instrumental track for emotional range.</p><p>Sometimes curation is just another form of self-respect.</p>",
                post_type: "text",
                post_font_family: "Trebuchet MS",
            },
        ],
    },
    {
        name: "Noah Ramirez",
        email: "noah.ramirez@owldiary.demo",
        password: "Password123!",
        about_me:
            "Biology major, greenhouse volunteer, and chronic note-taker who turns every walk into a reflection session.",
        avatar_url: "https://i.pravatar.cc/300?img=14",
        role: "user",
        approval_status: "approved",
        appearance_theme: "forest",
        font_family: "Verdana",
        accent_color: "#166534",
        font_size: "medium",
        profile_background_url:
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
        social_links: [
            { platform: "X", url: "https://x.com/noah-ramirez-demo" },
            { platform: "Goodreads", url: "https://goodreads.com/noah-ramirez-demo" },
        ],
        gallery: [
            {
                photo_url:
                    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80",
                title: "Greenhouse Morning",
                description: "Quiet work, damp air, and the best part of my week.",
            },
            {
                photo_url:
                    "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1200&q=80",
                title: "Field Notes",
                description: "A page from the notebook I carry everywhere.",
            },
        ],
        posts: [
            {
                title: "The Greenhouse Has Better Time Management Than I Do",
                content:
                    "<p>Plants are embarrassingly good at consistency. Same light. Same water. Same patience. Meanwhile I am still bargaining with my calendar like it is optional.</p><p>I am borrowing some of that steadiness this week.</p>",
                post_type: "text",
                post_font_family: "Verdana",
            },
            {
                title: "Small Things I Noticed on Today’s Walk",
                content:
                    "<p>A crow hopping sideways across the sidewalk. New buds on the hedge outside the science building. Someone practicing trumpet badly but earnestly through an open window.</p><p>It was a good reminder that attention is its own kind of gratitude.</p>",
                post_type: "text",
                post_font_family: "Verdana",
            },
        ],
    },
];

const comments = [
    {
        from: adminEmail,
        postOwner: "maya.thompson@owldiary.demo",
        postTitle: "The Semester Finally Feels Real",
        content: "This is exactly the kind of honest post that makes the space feel real. Keep writing.",
    },
    {
        from: adminEmail,
        postOwner: "jordan.ellis@owldiary.demo",
        postTitle: "I Shipped a Small Feature and It Felt Huge",
        content: "Incremental wins deserve airtime. Nice work on shipping instead of waiting for perfect.",
    },
    {
        from: adminEmail,
        postOwner: "avery.chen@owldiary.demo",
        postTitle: "What Critique Taught Me This Week",
        content: "The reflection and restraint in this one are strong. You should keep posting design notes like this.",
    },
    {
        from: adminEmail,
        postOwner: "noah.ramirez@owldiary.demo",
        postTitle: "Small Things I Noticed on Today’s Walk",
        content: "This is calm in the best way. Posts like this slow the feed down productively.",
    },
    {
        from: "jordan.ellis@owldiary.demo",
        postOwner: "maya.thompson@owldiary.demo",
        postTitle: "The Semester Finally Feels Real",
        content: "This reads like the exact conversation I needed to have with myself last week.",
    },
    {
        from: "avery.chen@owldiary.demo",
        postOwner: "jordan.ellis@owldiary.demo",
        postTitle: "I Shipped a Small Feature and It Felt Huge",
        content: "Incremental progress is still progress. The cleaner error state point is real.",
    },
    {
        from: "noah.ramirez@owldiary.demo",
        postOwner: "avery.chen@owldiary.demo",
        postTitle: "What Critique Taught Me This Week",
        content: "Quiet and clear is such a strong direction. I like this reflection a lot.",
    },
    {
        from: "maya.thompson@owldiary.demo",
        postOwner: "noah.ramirez@owldiary.demo",
        postTitle: "Small Things I Noticed on Today’s Walk",
        content: "The trumpet detail made this feel very alive.",
    },
    {
        from: "maya.thompson@owldiary.demo",
        postOwner: "jordan.ellis@owldiary.demo",
        postTitle: "I Shipped a Small Feature and It Felt Huge",
        content: "This made me want to celebrate smaller wins more often.",
    },
    {
        from: "jordan.ellis@owldiary.demo",
        postOwner: "avery.chen@owldiary.demo",
        postTitle: "What Critique Taught Me This Week",
        content: "The simpler version winning is the most believable design-school story possible.",
    },
    {
        from: "avery.chen@owldiary.demo",
        postOwner: "noah.ramirez@owldiary.demo",
        postTitle: "Small Things I Noticed on Today’s Walk",
        content: "You make observation feel like its own art form here.",
    },
    {
        from: "noah.ramirez@owldiary.demo",
        postOwner: "maya.thompson@owldiary.demo",
        postTitle: "Five Movies I Rewatch When I Need My Brain Back",
        content: "This is a very convincing case for building emotional recovery lists on purpose.",
    },
    {
        from: "maya.thompson@owldiary.demo",
        postOwner: adminEmail,
        postTitle: "Welcome to OwlDiary",
        content: "This makes the site feel warmer already. I like the tone you set here.",
    },
    {
        from: "jordan.ellis@owldiary.demo",
        postOwner: adminEmail,
        postTitle: "What I Hope This Community Becomes",
        content: "The table everyone can sit at line is strong. Good north star for the platform.",
    },
    {
        from: "avery.chen@owldiary.demo",
        postOwner: "maya.thompson@owldiary.demo",
        postTitle: "Five Movies I Rewatch When I Need My Brain Back",
        content: "This is a perfect comfort list. Adding two of these to my weekend.",
    },
    {
        from: "noah.ramirez@owldiary.demo",
        postOwner: "jordan.ellis@owldiary.demo",
        postTitle: "On Building Things Before You Feel Ready",
        content: "Repetition before confidence is painfully accurate.",
    },
    {
        from: "jordan.ellis@owldiary.demo",
        postOwner: "avery.chen@owldiary.demo",
        postTitle: "Playlist for Recovering From a Hard Week",
        content: "Curating your own recovery plan is a good way to put it.",
    },
    {
        from: "avery.chen@owldiary.demo",
        postOwner: "noah.ramirez@owldiary.demo",
        postTitle: "The Greenhouse Has Better Time Management Than I Do",
        content: "This title alone earned the click. Also annoyingly true.",
    },
    {
        from: "noah.ramirez@owldiary.demo",
        postOwner: adminEmail,
        postTitle: "Welcome to OwlDiary",
        content: "The tone here feels generous without being forced. Good start.",
    },
];

const likes = [
    { from: adminEmail, postOwner: "maya.thompson@owldiary.demo", postTitle: "The Semester Finally Feels Real" },
    { from: adminEmail, postOwner: "maya.thompson@owldiary.demo", postTitle: "Five Movies I Rewatch When I Need My Brain Back" },
    { from: adminEmail, postOwner: "jordan.ellis@owldiary.demo", postTitle: "I Shipped a Small Feature and It Felt Huge" },
    { from: adminEmail, postOwner: "avery.chen@owldiary.demo", postTitle: "What Critique Taught Me This Week" },
    { from: adminEmail, postOwner: "noah.ramirez@owldiary.demo", postTitle: "Small Things I Noticed on Today’s Walk" },
    { from: "maya.thompson@owldiary.demo", postOwner: adminEmail, postTitle: "Welcome to OwlDiary" },
    { from: "maya.thompson@owldiary.demo", postOwner: "jordan.ellis@owldiary.demo", postTitle: "On Building Things Before You Feel Ready" },
    { from: "maya.thompson@owldiary.demo", postOwner: "avery.chen@owldiary.demo", postTitle: "What Critique Taught Me This Week" },
    { from: "jordan.ellis@owldiary.demo", postOwner: adminEmail, postTitle: "What I Hope This Community Becomes" },
    { from: "jordan.ellis@owldiary.demo", postOwner: "maya.thompson@owldiary.demo", postTitle: "The Semester Finally Feels Real" },
    { from: "jordan.ellis@owldiary.demo", postOwner: "noah.ramirez@owldiary.demo", postTitle: "The Greenhouse Has Better Time Management Than I Do" },
    { from: "avery.chen@owldiary.demo", postOwner: adminEmail, postTitle: "Welcome to OwlDiary" },
    { from: "avery.chen@owldiary.demo", postOwner: "maya.thompson@owldiary.demo", postTitle: "Five Movies I Rewatch When I Need My Brain Back" },
    { from: "avery.chen@owldiary.demo", postOwner: "jordan.ellis@owldiary.demo", postTitle: "I Shipped a Small Feature and It Felt Huge" },
    { from: "avery.chen@owldiary.demo", postOwner: "noah.ramirez@owldiary.demo", postTitle: "Small Things I Noticed on Today’s Walk" },
    { from: "noah.ramirez@owldiary.demo", postOwner: adminEmail, postTitle: "What I Hope This Community Becomes" },
    { from: "noah.ramirez@owldiary.demo", postOwner: "maya.thompson@owldiary.demo", postTitle: "The Semester Finally Feels Real" },
    { from: "noah.ramirez@owldiary.demo", postOwner: "jordan.ellis@owldiary.demo", postTitle: "On Building Things Before You Feel Ready" },
    { from: "noah.ramirez@owldiary.demo", postOwner: "avery.chen@owldiary.demo", postTitle: "Playlist for Recovering From a Hard Week" },
];

const registrationCode = {
    code: "OWL26",
    semester: "Fall 2026",
};

const starterQuotes = [
    {
        text: "The secret of getting ahead is getting started.",
        author: "Mark Twain",
    },
    {
        text: "It always seems impossible until it is done.",
        author: "Nelson Mandela",
    },
    {
        text: "Start where you are. Use what you have. Do what you can.",
        author: "Arthur Ashe",
    },
];

async function upsertStudent(student) {
    const existing = await sql`
        SELECT id FROM students WHERE email = ${student.email}
    `;

    const hashedPassword = student.password
        ? await bcrypt.hash(student.password, saltRounds)
        : null;

    if (existing.length > 0) {
        if (hashedPassword) {
            await sql`
                UPDATE students
                SET name = ${student.name},
                    password = ${hashedPassword},
                    about_me = ${student.about_me},
                    avatar_url = ${student.avatar_url},
                    role = ${student.role},
                    approval_status = ${student.approval_status},
                    appearance_theme = ${student.appearance_theme},
                    font_family = ${student.font_family},
                    accent_color = ${student.accent_color},
                    font_size = ${student.font_size},
                    profile_background_url = ${student.profile_background_url}
                WHERE id = ${existing[0].id}
            `;
        } else {
            await sql`
                UPDATE students
                SET name = ${student.name},
                    about_me = ${student.about_me},
                    avatar_url = ${student.avatar_url},
                    role = ${student.role},
                    approval_status = ${student.approval_status},
                    appearance_theme = ${student.appearance_theme},
                    font_family = ${student.font_family},
                    accent_color = ${student.accent_color},
                    font_size = ${student.font_size},
                    profile_background_url = ${student.profile_background_url}
                WHERE id = ${existing[0].id}
            `;
        }
        return existing[0].id;
    }

    const inserted = await sql`
        INSERT INTO students (
            name,
            email,
            password,
            about_me,
            avatar_url,
            role,
            approval_status,
            appearance_theme,
            font_family,
            accent_color,
            font_size,
            profile_background_url
        )
        VALUES (
            ${student.name},
            ${student.email},
            ${hashedPassword},
            ${student.about_me},
            ${student.avatar_url},
            ${student.role},
            ${student.approval_status},
            ${student.appearance_theme},
            ${student.font_family},
            ${student.accent_color},
            ${student.font_size},
            ${student.profile_background_url}
        )
        RETURNING id
    `;

    return inserted[0].id;
}

async function seedLikes(studentIdsByEmail, postsByOwnerAndTitle) {
    for (const like of likes) {
        const userId = studentIdsByEmail.get(like.from);
        const postId = postsByOwnerAndTitle.get(`${like.postOwner}::${like.postTitle}`);

        if (!userId || !postId) {
            continue;
        }

        const existing = await sql`
            SELECT 1 FROM likes
            WHERE user_id = ${userId} AND post_id = ${postId}
        `;

        if (existing.length === 0) {
            await sql`
                INSERT INTO likes (user_id, post_id)
                VALUES (${userId}, ${postId})
            `;
        }
    }

    await sql`
        UPDATE posts p
        SET likes = counts.like_count
        FROM (
            SELECT post_id, COUNT(*)::int AS like_count
            FROM likes
            GROUP BY post_id
        ) counts
        WHERE p.id = counts.post_id
    `;

    await sql`
        UPDATE posts
        SET likes = 0
        WHERE id NOT IN (SELECT DISTINCT post_id FROM likes)
    `;
}

async function seedSocialLinks(studentId, links) {
    await sql`DELETE FROM social_links WHERE student_id = ${studentId}`;
    for (const link of links) {
        await sql`
            INSERT INTO social_links (student_id, platform, url)
            VALUES (${studentId}, ${link.platform}, ${link.url})
        `;
    }
}

async function seedGallery(studentId, gallery) {
    await sql`DELETE FROM profile_gallery WHERE student_id = ${studentId}`;
    for (const [index, item] of gallery.entries()) {
        await sql`
            INSERT INTO profile_gallery (
                student_id,
                photo_url,
                display_order,
                title,
                description
            )
            VALUES (
                ${studentId},
                ${item.photo_url},
                ${index},
                ${item.title},
                ${item.description}
            )
        `;
    }
}

async function seedPosts(studentId, posts) {
    await sql`DELETE FROM posts WHERE student_id = ${studentId}`;
    const insertedPosts = [];

    for (const [index, post] of posts.entries()) {
        const inserted = await sql`
            INSERT INTO posts (
                student_id,
                title,
                content,
                post_type,
                media_url,
                display_order,
                post_font_family
            )
            VALUES (
                ${studentId},
                ${post.title},
                ${post.content},
                ${post.post_type},
                ${post.media_url ?? null},
                ${index},
                ${post.post_font_family ?? null}
            )
            RETURNING id, title
        `;
        insertedPosts.push(inserted[0]);
    }

    return insertedPosts;
}

async function seedComments(studentIdsByEmail, postsByOwnerAndTitle) {
    for (const comment of comments) {
        const userId = studentIdsByEmail.get(comment.from);
        const postId =
            postsByOwnerAndTitle.get(`${comment.postOwner}::${comment.postTitle}`);

        if (!userId || !postId) {
            continue;
        }

        const existing = await sql`
            SELECT id
            FROM comments
            WHERE user_id = ${userId}
              AND post_id = ${postId}
              AND content = ${comment.content}
        `;

        if (existing.length === 0) {
            await sql`
                INSERT INTO comments (post_id, user_id, content)
                VALUES (${postId}, ${userId}, ${comment.content})
            `;
        }
    }
}

async function seedQuotes() {
    for (const quote of starterQuotes) {
        const existing = await sql`
            SELECT id FROM quotes
            WHERE text = ${quote.text} AND author = ${quote.author}
        `;

        if (existing.length === 0) {
            await sql`
                INSERT INTO quotes (text, author, is_manual)
                VALUES (${quote.text}, ${quote.author}, 0)
            `;
        }
    }
}

async function seedRegistrationCode() {
    const existing = await sql`
        SELECT code_id FROM registration_codes WHERE code = ${registrationCode.code}
    `;

    if (existing.length === 0) {
        await sql`
            INSERT INTO registration_codes (code, semester, is_active)
            VALUES (
                ${registrationCode.code},
                ${registrationCode.semester},
                true
            )
        `;
    }
}

async function seedDatabase() {
    try {
        console.log("Seeding demo community data...");

        const studentIdsByEmail = new Map();
        const postsByOwnerAndTitle = new Map();

        for (const student of students) {
            const studentId = await upsertStudent(student);
            studentIdsByEmail.set(student.email, studentId);

            await seedSocialLinks(studentId, student.social_links);
            await seedGallery(studentId, student.gallery);
            const insertedPosts = await seedPosts(studentId, student.posts);

            for (const post of insertedPosts) {
                postsByOwnerAndTitle.set(`${student.email}::${post.title}`, post.id);
            }
        }

        await seedComments(studentIdsByEmail, postsByOwnerAndTitle);
        await seedLikes(studentIdsByEmail, postsByOwnerAndTitle);
        await seedRegistrationCode();
        await seedQuotes();

        console.log("Demo data seeded.");
        console.log("Demo login password for seeded users: Password123!");
        console.log("Registration code created: OWL26");
    } catch (error) {
        console.error("Error while seeding database:", error.message);
        process.exitCode = 1;
    } finally {
        await sql.end();
    }
}

seedDatabase();
