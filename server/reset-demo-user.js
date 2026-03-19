import "dotenv/config";
import bcrypt from "bcrypt";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, {
    ssl: "require",
});

const DEMO_EMAIL = "maya.thompson@owldiary.demo";
const DEMO_PASSWORD = "Password123!";
const SALT_ROUNDS = 10;

const demoProfile = {
    name: "Maya Thompson",
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
};

const demoSocialLinks = [
    {
        platform: "Instagram",
        url: "https://instagram.com/maya.afterhours",
    },
    {
        platform: "Letterboxd",
        url: "https://letterboxd.com/mayaafterhours",
    },
];

const demoGallery = [
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
];

const demoPosts = [
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
];

const baselineComments = [
    {
        from: process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@owldiary.demo",
        postTitle: "The Semester Finally Feels Real",
        content: "This is exactly the kind of honest post that makes the space feel real. Keep writing.",
    },
    {
        from: "jordan.ellis@owldiary.demo",
        postTitle: "The Semester Finally Feels Real",
        content: "This reads like the exact conversation I needed to have with myself last week.",
    },
    {
        from: "avery.chen@owldiary.demo",
        postTitle: "Five Movies I Rewatch When I Need My Brain Back",
        content: "This is a perfect comfort list. Adding two of these to my weekend.",
    },
    {
        from: "noah.ramirez@owldiary.demo",
        postTitle: "Five Movies I Rewatch When I Need My Brain Back",
        content: "This is a very convincing case for building emotional recovery lists on purpose.",
    },
];

const baselineLikes = [
    {
        from: process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@owldiary.demo",
        postTitle: "The Semester Finally Feels Real",
    },
    {
        from: process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@owldiary.demo",
        postTitle: "Five Movies I Rewatch When I Need My Brain Back",
    },
    {
        from: "jordan.ellis@owldiary.demo",
        postTitle: "The Semester Finally Feels Real",
    },
    {
        from: "avery.chen@owldiary.demo",
        postTitle: "Five Movies I Rewatch When I Need My Brain Back",
    },
    {
        from: "noah.ramirez@owldiary.demo",
        postTitle: "The Semester Finally Feels Real",
    },
];

async function resetDemoUser() {
    try {
        const demoUser = await sql`
            SELECT id
            FROM students
            WHERE email = ${DEMO_EMAIL}
        `;

        if (!demoUser.length) {
            throw new Error(`Demo user ${DEMO_EMAIL} not found.`);
        }

        const demoUserId = demoUser[0].id;
        const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

        await sql.begin(async (tx) => {
            await tx`
                UPDATE students
                SET name = ${demoProfile.name},
                    password = ${hashedPassword},
                    about_me = ${demoProfile.about_me},
                    avatar_url = ${demoProfile.avatar_url},
                    role = ${demoProfile.role},
                    approval_status = ${demoProfile.approval_status},
                    appearance_theme = ${demoProfile.appearance_theme},
                    font_family = ${demoProfile.font_family},
                    accent_color = ${demoProfile.accent_color},
                    font_size = ${demoProfile.font_size},
                    profile_background_url = ${demoProfile.profile_background_url}
                WHERE id = ${demoUserId}
            `;

            await tx`DELETE FROM notifications WHERE user_id = ${demoUserId}`;
            await tx`DELETE FROM likes WHERE user_id = ${demoUserId}`;
            await tx`DELETE FROM comments WHERE user_id = ${demoUserId}`;
            await tx`DELETE FROM social_links WHERE student_id = ${demoUserId}`;
            await tx`DELETE FROM profile_gallery WHERE student_id = ${demoUserId}`;
            await tx`DELETE FROM posts WHERE student_id = ${demoUserId}`;

            for (const link of demoSocialLinks) {
                await tx`
                    INSERT INTO social_links (student_id, platform, url)
                    VALUES (${demoUserId}, ${link.platform}, ${link.url})
                `;
            }

            for (const [index, item] of demoGallery.entries()) {
                await tx`
                    INSERT INTO profile_gallery (
                        student_id,
                        photo_url,
                        display_order,
                        title,
                        description
                    )
                    VALUES (
                        ${demoUserId},
                        ${item.photo_url},
                        ${index},
                        ${item.title},
                        ${item.description}
                    )
                `;
            }

            const postIdsByTitle = new Map();
            for (const [index, post] of demoPosts.entries()) {
                const inserted = await tx`
                    INSERT INTO posts (
                        student_id,
                        title,
                        content,
                        post_type,
                        media_url,
                        display_order,
                        post_font_family,
                        likes
                    )
                    VALUES (
                        ${demoUserId},
                        ${post.title},
                        ${post.content},
                        ${post.post_type},
                        ${null},
                        ${index},
                        ${post.post_font_family},
                        0
                    )
                    RETURNING id, title
                `;
                postIdsByTitle.set(inserted[0].title, inserted[0].id);
            }

            for (const comment of baselineComments) {
                const author = await tx`
                    SELECT id FROM students WHERE email = ${comment.from}
                `;
                const postId = postIdsByTitle.get(comment.postTitle);
                if (!author.length || !postId) {
                    continue;
                }
                await tx`
                    INSERT INTO comments (post_id, user_id, content)
                    VALUES (${postId}, ${author[0].id}, ${comment.content})
                `;
            }

            for (const like of baselineLikes) {
                const liker = await tx`
                    SELECT id FROM students WHERE email = ${like.from}
                `;
                const postId = postIdsByTitle.get(like.postTitle);
                if (!liker.length || !postId) {
                    continue;
                }
                await tx`
                    INSERT INTO likes (user_id, post_id)
                    VALUES (${liker[0].id}, ${postId})
                    ON CONFLICT DO NOTHING
                `;
            }

            await tx`
                UPDATE posts p
                SET likes = COALESCE(counts.like_count, 0)
                FROM (
                    SELECT post_id, COUNT(*)::int AS like_count
                    FROM likes
                    GROUP BY post_id
                ) counts
                WHERE p.id = counts.post_id
            `;

            await tx`
                UPDATE posts
                SET likes = 0
                WHERE id NOT IN (SELECT DISTINCT post_id FROM likes)
            `;
        });

        console.log(`Demo user ${DEMO_EMAIL} reset successfully.`);
        console.log("Suggested schedule: run this script every 12 hours.");
    } catch (error) {
        console.error("Error resetting demo user:", error.message);
        process.exitCode = 1;
    } finally {
        await sql.end();
    }
}

resetDemoUser();
