import { DEMO_MODE } from "./config";

const DEMO_EMAIL = "maya.thompson@owldiary.demo";
const ADMIN_EMAIL = "admin@owldiary.demo";
const DEMO_PASSWORD = "Password123!";
const DEMO_USER_ID = 1;
const ADMIN_USER_ID = 11;
const PENDING_USER_ID = 12;

const jsonHeaders = {
    "Content-Type": "application/json",
};

const nowIso = () => new Date().toISOString();

const createJwtLikeToken = (payload) => {
    const encode = (value) =>
        btoa(JSON.stringify(value))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/g, "");

    return [
        encode({ alg: "none", typ: "JWT" }),
        encode(payload),
        "demo",
    ].join(".");
};

const avatarSvgDataUrl = (seed, label) => {
    const initials = String(label || "")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0] || "")
        .join("")
        .toUpperCase();
    const safeSeed = seed.replace("#", "");
    const secondary = `${safeSeed}cc`;
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" role="img" aria-label="${label}">
            <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#${safeSeed}" />
                    <stop offset="100%" stop-color="#${secondary.slice(0, 6)}" />
                </linearGradient>
            </defs>
            <rect width="300" height="300" rx="72" fill="url(#g)" />
            <circle cx="150" cy="115" r="58" fill="rgba(255,255,255,0.18)" />
            <path d="M78 244c13-39 42-58 72-58s59 19 72 58" fill="rgba(255,255,255,0.18)" />
            <text x="150" y="174" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="84" font-weight="700" fill="#ffffff">${initials}</text>
        </svg>
    `.replace(/\s+/g, " ").trim();
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const createInitialState = () => {
    const students = [
        {
            id: DEMO_USER_ID,
            name: "Maya Thompson",
            email: DEMO_EMAIL,
            password: DEMO_PASSWORD,
            about_me:
                "Film club lead, late-night journaler, and the person who always has a campus coffee recommendation ready.",
            avatar_url: avatarSvgDataUrl("1d4ed8", "Maya Thompson"),
            role: "user",
            appearance_theme: "aurora",
            font_family: "Georgia",
            accent_color: "#1d4ed8",
            font_size: "16px",
            profile_background_url:
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
            approval_status: "approved",
            created_at: "2026-05-18T13:00:00.000Z",
        },
        {
            id: 2,
            name: "Jordan Ellis",
            email: "jordan.ellis@owldiary.demo",
            password: DEMO_PASSWORD,
            about_me:
                "Computer science major, intramural soccer midfielder, and serial builder of tiny tools that probably should have stayed in my notes app.",
            avatar_url: avatarSvgDataUrl("0f766e", "Jordan Ellis"),
            role: "user",
            appearance_theme: "midnight",
            font_family: "Inter",
            accent_color: "#0f766e",
            font_size: "16px",
            profile_background_url:
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
            approval_status: "approved",
            created_at: "2026-05-12T13:00:00.000Z",
        },
        {
            id: 3,
            name: "Avery Chen",
            email: "avery.chen@owldiary.demo",
            password: DEMO_PASSWORD,
            about_me:
                "Design student, campus magazine contributor, and collector of oddly specific playlists for every possible mood.",
            avatar_url: avatarSvgDataUrl("b45309", "Avery Chen"),
            role: "user",
            appearance_theme: "paper",
            font_family: "Playfair Display",
            accent_color: "#b45309",
            font_size: "16px",
            profile_background_url:
                "https://images.unsplash.com/photo-1518972559570-0d2873e5f3f2?auto=format&fit=crop&w=1400&q=80",
            approval_status: "approved",
            created_at: "2026-05-08T13:00:00.000Z",
        },
        {
            id: 4,
            name: "Noah Ramirez",
            email: "noah.ramirez@owldiary.demo",
            password: DEMO_PASSWORD,
            about_me:
                "Biology major, greenhouse volunteer, and chronic note-taker who turns every walk into a reflection session.",
            avatar_url: avatarSvgDataUrl("166534", "Noah Ramirez"),
            role: "user",
            appearance_theme: "forest",
            font_family: "Inter",
            accent_color: "#166534",
            font_size: "16px",
            profile_background_url:
                "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
            approval_status: "approved",
            created_at: "2026-05-05T13:00:00.000Z",
        },
        {
            id: 5,
            name: "Priya Patel",
            email: "priya.patel@owldiary.demo",
            password: DEMO_PASSWORD,
            about_me:
                "Pre-med student, debate team strategist, and someone who schedules joy as aggressively as deadlines.",
            avatar_url: avatarSvgDataUrl("db2777", "Priya Patel"),
            role: "user",
            appearance_theme: "rose",
            font_family: "Inter",
            accent_color: "#db2777",
            font_size: "16px",
            profile_background_url:
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1400&q=80",
            approval_status: "approved",
            created_at: "2026-05-03T13:00:00.000Z",
        },
        {
            id: 6,
            name: "Elias Morgan",
            email: "elias.morgan@owldiary.demo",
            password: DEMO_PASSWORD,
            about_me:
                "Journalism student chasing better questions, cleaner sentences, and fewer open tabs.",
            avatar_url: avatarSvgDataUrl("0369a1", "Elias Morgan"),
            role: "user",
            appearance_theme: "classic",
            font_family: "Georgia",
            accent_color: "#0369a1",
            font_size: "16px",
            profile_background_url:
                "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=80",
            approval_status: "approved",
            created_at: "2026-05-02T13:00:00.000Z",
        },
        {
            id: 7,
            name: "Zuri Washington",
            email: "zuri.washington@owldiary.demo",
            password: DEMO_PASSWORD,
            about_me:
                "Theatre student, costume assistant, and defender of dramatic exits that are mostly for comic timing.",
            avatar_url: avatarSvgDataUrl("9333ea", "Zuri Washington"),
            role: "user",
            appearance_theme: "velvet",
            font_family: "Playfair Display",
            accent_color: "#9333ea",
            font_size: "16px",
            profile_background_url:
                "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1400&q=80",
            approval_status: "approved",
            created_at: "2026-05-01T13:00:00.000Z",
        },
        {
            id: 8,
            name: "Marcus Lee",
            email: "marcus.lee@owldiary.demo",
            password: DEMO_PASSWORD,
            about_me:
                "Business major, campus radio volunteer, and accidental archivist of every weird flyer on campus.",
            avatar_url: avatarSvgDataUrl("b45309", "Marcus Lee"),
            role: "user",
            appearance_theme: "classic",
            font_family: "Inter",
            accent_color: "#b45309",
            font_size: "16px",
            profile_background_url:
                "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80",
            approval_status: "approved",
            created_at: "2026-04-30T13:00:00.000Z",
        },
        {
            id: 9,
            name: "Samira A.",
            email: "lena.okafor@owldiary.demo",
            password: DEMO_PASSWORD,
            about_me:
                "Nursing student, wellness storyteller, and content creator who loves turning clinical lessons and everyday routines into calm, useful posts.",
            avatar_url: avatarSvgDataUrl("059669", "Samira A."),
            role: "user",
            appearance_theme: "sage",
            font_family: "Georgia",
            accent_color: "#059669",
            font_size: "16px",
            profile_background_url:
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80",
            approval_status: "approved",
            created_at: "2026-04-29T13:00:00.000Z",
        },
        {
            id: 10,
            name: "Sofia Alvarez",
            email: "sofia.alvarez@owldiary.demo",
            password: DEMO_PASSWORD,
            about_me:
                "Architecture student sketching staircases, window light, and ways to make shared spaces feel kinder.",
            avatar_url: avatarSvgDataUrl("dc2626", "Sofia Alvarez"),
            role: "user",
            appearance_theme: "terracotta",
            font_family: "Georgia",
            accent_color: "#dc2626",
            font_size: "16px",
            profile_background_url:
                "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
            approval_status: "approved",
            created_at: "2026-04-28T13:00:00.000Z",
        },
        {
            id: ADMIN_USER_ID,
            name: "Campus Admin",
            email: ADMIN_EMAIL,
            password: DEMO_PASSWORD,
            about_me:
                "Community admin, event organizer, and the person making sure this space feels alive and welcoming every day.",
            avatar_url: avatarSvgDataUrl("7c2d12", "Campus Admin"),
            role: "admin",
            appearance_theme: "classic",
            font_family: "Georgia",
            accent_color: "#7c2d12",
            font_size: "16px",
            profile_background_url:
                "https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1400&q=80",
            approval_status: "approved",
            created_at: "2026-04-27T13:00:00.000Z",
        },
        {
            id: PENDING_USER_ID,
            name: "Taylor Brooks",
            email: "taylor.brooks@owldiary.demo",
            password: DEMO_PASSWORD,
            about_me:
                "Pending approval account for the admin workflow demo.",
            avatar_url: avatarSvgDataUrl("64748b", "Taylor Brooks"),
            role: "user",
            appearance_theme: "classic",
            font_family: "Inter",
            accent_color: "#64748b",
            font_size: "16px",
            profile_background_url: "",
            approval_status: "pending",
            created_at: "2026-06-01T13:00:00.000Z",
        },
    ];

    const posts = [
        {
            id: 101,
            student_id: 1,
            title: "The Semester Finally Feels Real",
            content:
                "<p>I spent the first two weeks pretending I had everything under control. Today was the first day I admitted I need structure, rest, and fewer dramatic all-nighters.</p><p>Small win: I mapped out deadlines and took a walk before sunset instead of staring at my laptop.</p>",
            post_type: "text",
            media_url: null,
            is_hidden: 0,
            display_order: 0,
            post_font_family: "Georgia",
            created_at: "2026-06-03T15:30:00.000Z",
        },
        {
            id: 102,
            student_id: 1,
            title: "Quiet Corners on Campus",
            content:
                "<p>There is a bench behind the arts building where everything feels less urgent. I think every student deserves one place where their thoughts stop sprinting.</p>",
            post_type: "image",
            media_url:
                "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
            is_hidden: 0,
            display_order: 1,
            post_font_family: "Georgia",
            created_at: "2026-06-02T18:10:00.000Z",
        },
        {
            id: 103,
            student_id: 2,
            title: "What I Wish People Knew About Burnout",
            content:
                "<p>Burnout never felt dramatic for me. It felt like becoming less curious every week until even things I loved started sounding loud.</p>",
            post_type: "text",
            media_url: null,
            is_hidden: 0,
            display_order: 0,
            post_font_family: "Inter",
            created_at: "2026-06-01T11:20:00.000Z",
        },
        {
            id: 104,
            student_id: 3,
            title: "Three Type Pairings I Cannot Stop Using",
            content:
                "<p>Playfair + Inter is still undefeated. But recently I keep reaching for Source Serif with a slightly awkward sans. It makes everything feel edited, not templated.</p>",
            post_type: "text",
            media_url: null,
            is_hidden: 0,
            display_order: 0,
            post_font_family: "Playfair Display",
            created_at: "2026-05-31T14:05:00.000Z",
        },
        {
            id: 105,
            student_id: 4,
            title: "Practice Draft",
            content:
                "<p>This hidden entry exists so recruiters can test visibility toggles without breaking anything real.</p>",
            post_type: "text",
            media_url: null,
            is_hidden: 1,
            display_order: 0,
            post_font_family: "Inter",
            created_at: "2026-05-29T09:45:00.000Z",
        },
        {
            id: 106,
            student_id: 1,
            title: "Five Movies I Rewatch When I Need My Brain Back",
            content:
                "<p>When classes get loud, I come back to familiar stories. Not because they solve anything, but because they remind me that pacing matters and silence can still say a lot.</p><p>Current rotation: <strong>Before Sunrise</strong>, <strong>Lady Bird</strong>, <strong>Moonlight</strong>, <strong>Past Lives</strong>, and <strong>Frances Ha</strong>.</p>",
            post_type: "text",
            media_url: null,
            is_hidden: 0,
            display_order: 2,
            post_font_family: "Georgia",
            created_at: "2026-05-30T19:20:00.000Z",
        },
        {
            id: 107,
            student_id: 2,
            title: "On Building Things Before You Feel Ready",
            content:
                "<p>I used to think confidence came first. It does not. Repetition comes first. Shipping ugly first drafts comes first. Asking better questions comes first.</p><p>Confidence is mostly what happens after you survive enough imperfect attempts.</p>",
            post_type: "text",
            media_url: null,
            is_hidden: 0,
            display_order: 1,
            post_font_family: "Inter",
            created_at: "2026-05-30T10:45:00.000Z",
        },
        {
            id: 108,
            student_id: 3,
            title: "Playlist for Recovering From a Hard Week",
            content:
                "<p>I made a playlist for the walk home after studio: soft synths, warm vocals, and exactly one dramatic instrumental track for emotional range.</p><p>Sometimes curation is just another form of self-respect.</p>",
            post_type: "text",
            media_url: null,
            is_hidden: 0,
            display_order: 1,
            post_font_family: "Playfair Display",
            created_at: "2026-05-29T18:15:00.000Z",
        },
        {
            id: 109,
            student_id: 4,
            title: "Small Things I Noticed on Today’s Walk",
            content:
                "<p>A crow hopping sideways across the sidewalk. New buds on the hedge outside the science building. Someone practicing trumpet badly but earnestly through an open window.</p><p>It was a good reminder that attention is its own kind of gratitude.</p>",
            post_type: "text",
            media_url: null,
            is_hidden: 0,
            display_order: 1,
            post_font_family: "Inter",
            created_at: "2026-05-28T16:10:00.000Z",
        },
        {
            id: 110,
            student_id: ADMIN_USER_ID,
            title: "Welcome to OwlDiary",
            content:
                "<p>This space is for campus life in all its forms: wins, doubts, projects, art, quiet reflections, and the messy middle of becoming someone new.</p><p>If you are here, write something honest. Someone else probably needed to read it.</p>",
            post_type: "text",
            media_url: null,
            is_hidden: 0,
            display_order: 0,
            post_font_family: "Georgia",
            created_at: "2026-05-27T12:00:00.000Z",
        },
        {
            id: 111,
            student_id: ADMIN_USER_ID,
            title: "What I Hope This Community Becomes",
            content:
                "<p>I want OwlDiary to feel like the table everyone can sit at. Not perfect, not performative, just thoughtful and alive. Leave comments, respond generously, and help each other feel less alone.</p>",
            post_type: "text",
            media_url: null,
            is_hidden: 0,
            display_order: 1,
            post_font_family: "Georgia",
            created_at: "2026-05-26T12:00:00.000Z",
        },
        {
            id: 112,
            student_id: 5,
            title: "What Calm Looks Like Before Exams",
            content:
                "<p>I used to think calm meant feeling zero panic. Now I think it means having a plan, texting a friend back, and eating something before pretending caffeine counts as dinner.</p>",
            post_type: "text",
            media_url: null,
            is_hidden: 0,
            display_order: 0,
            post_font_family: "Inter",
            created_at: "2026-06-01T19:00:00.000Z",
        },
        {
            id: 113,
            student_id: 6,
            title: "The Interview Question I Keep Rewriting",
            content:
                "<p>I am learning that the first answer is usually the polished one, not the honest one. The good version shows up after a second pass and one embarrassing delete key spree.</p>",
            post_type: "text",
            media_url: null,
            is_hidden: 0,
            display_order: 0,
            post_font_family: "Georgia",
            created_at: "2026-05-31T17:20:00.000Z",
        },
        {
            id: 114,
            student_id: 7,
            title: "Costume Shop Confessional",
            content:
                "<p>There is something deeply humbling about spending three hours making a hem invisible and then realizing that invisible was the whole assignment.</p>",
            post_type: "text",
            media_url: null,
            is_hidden: 0,
            display_order: 0,
            post_font_family: "Playfair Display",
            created_at: "2026-05-30T21:05:00.000Z",
        },
        {
            id: 115,
            student_id: 8,
            title: "Flyers Worth Saving",
            content:
                "<p>Campus walls are a weird archive. Half the posters are noise, but every once in a while one of them captures exactly what a semester felt like.</p>",
            post_type: "text",
            media_url: null,
            is_hidden: 0,
            display_order: 0,
            post_font_family: "Inter",
            created_at: "2026-05-29T13:40:00.000Z",
        },
        {
            id: 116,
            student_id: 9,
            title: "Small Mercy on Clinical Days",
            content:
                "<p>I have started packing one unnecessary nice thing in my bag for long shifts. A real pen. A better snack. Lip balm that smells expensive. Tiny morale matters.</p>",
            post_type: "text",
            media_url: null,
            is_hidden: 0,
            display_order: 0,
            post_font_family: "Georgia",
            created_at: "2026-05-28T22:15:00.000Z",
        },
        {
            id: 117,
            student_id: 10,
            title: "Buildings That Feel Like Apologies",
            content:
                "<p>Some spaces say, “move through me.” Better ones say, “stay awhile.” I have been sketching entryways that do the second thing on purpose.</p>",
            post_type: "text",
            media_url: null,
            is_hidden: 0,
            display_order: 0,
            post_font_family: "Georgia",
            created_at: "2026-05-27T20:05:00.000Z",
        },
        {
            id: 118,
            student_id: DEMO_USER_ID,
            title: "Library Window Seat",
            content:
                "<p>I ended up staying here longer than I meant to because the light made everything feel a little less urgent. Some study spots do half the emotional work for you.</p>",
            post_type: "image",
            media_url:
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
            is_hidden: 0,
            display_order: 3,
            post_font_family: "Georgia",
            created_at: "2026-06-04T18:45:00.000Z",
        },
        {
            id: 119,
            student_id: DEMO_USER_ID,
            title: "Notes From the Editing Lab",
            content:
                "<p>I like rooms that look slightly in-progress. They make it easier to believe your own rough draft will turn into something real.</p>",
            post_type: "image",
            media_url:
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
            is_hidden: 0,
            display_order: 4,
            post_font_family: "Georgia",
            created_at: "2026-06-05T14:25:00.000Z",
        },
    ];

    const comments = [
        {
            id: 201,
            post_id: 101,
            user_id: 2,
            content:
                "This reads like the exact conversation I needed to have with myself last week.",
            created_at: "2026-06-03T16:10:00.000Z",
        },
        {
            id: 202,
            post_id: 101,
            user_id: 3,
            content:
                "The walk before sunset detail is perfect. That tiny choice matters more than it sounds.",
            created_at: "2026-06-03T17:25:00.000Z",
        },
        {
            id: 203,
            post_id: 103,
            user_id: 1,
            content:
                "This is painfully accurate. The loss of curiosity is the part people do not name enough.",
            created_at: "2026-06-01T12:01:00.000Z",
        },
        {
            id: 204,
            post_id: 112,
            user_id: 1,
            content:
                "The part about eating before treating caffeine like dinner is too real.",
            created_at: "2026-06-01T20:15:00.000Z",
        },
        {
            id: 205,
            post_id: 113,
            user_id: 2,
            content:
                "Polished-first, honest-second is a brutal but useful way to put it.",
            created_at: "2026-05-31T18:00:00.000Z",
        },
        {
            id: 206,
            post_id: 114,
            user_id: 3,
            content:
                "Invisible work being the point is such a good line.",
            created_at: "2026-05-30T22:10:00.000Z",
        },
        {
            id: 207,
            post_id: 117,
            user_id: 6,
            content:
                "This makes me want to look at campus doors more carefully.",
            created_at: "2026-05-27T21:15:00.000Z",
        },
        {
            id: 208,
            post_id: 118,
            user_id: 2,
            content:
                "This looks exactly like the kind of seat you accidentally stay in for three hours.",
            created_at: "2026-06-04T19:00:00.000Z",
        },
        {
            id: 209,
            post_id: 119,
            user_id: 3,
            content:
                "The in-progress room point is strong. Finished spaces can feel weirdly intimidating.",
            created_at: "2026-06-05T15:05:00.000Z",
        },
    ];

    const likes = [
        { user_id: 2, post_id: 101 },
        { user_id: 3, post_id: 101 },
        { user_id: 4, post_id: 101 },
        { user_id: 1, post_id: 103 },
        { user_id: 3, post_id: 103 },
        { user_id: 1, post_id: 104 },
        { user_id: 5, post_id: 101 },
        { user_id: 6, post_id: 112 },
        { user_id: 7, post_id: 113 },
        { user_id: 8, post_id: 114 },
        { user_id: 9, post_id: 115 },
        { user_id: 10, post_id: 117 },
        { user_id: ADMIN_USER_ID, post_id: 102 },
        { user_id: 2, post_id: 118 },
        { user_id: 3, post_id: 118 },
        { user_id: 4, post_id: 119 },
        { user_id: 5, post_id: 119 },
    ];

    const commentLikes = [
        { user_id: 1, comment_id: 201 },
        { user_id: 4, comment_id: 201 },
        { user_id: 2, comment_id: 203 },
    ];

    const notifications = [
        {
            id: 301,
            user_id: ADMIN_USER_ID,
            message: "Taylor Brooks signed up and is awaiting approval.",
            is_read: 0,
            link_url: "/settings",
            created_at: "2026-06-01T13:05:00.000Z",
        },
        {
            id: 302,
            user_id: 1,
            message: "Avery Chen commented on your post 'The Semester Finally Feels Real'.",
            is_read: 0,
            link_url: "/post/101#comments",
            created_at: "2026-06-03T17:25:00.000Z",
        },
    ];

    const profileGallery = [
        {
            id: 401,
            student_id: 1,
            photo_url:
                "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
            display_order: 0,
            title: "Sunrise Walk",
            description:
                "The quiet path behind the arts building before my 8 a.m. class.",
            created_at: "2026-05-28T08:00:00.000Z",
        },
        {
            id: 402,
            student_id: 1,
            photo_url:
                "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=1200&q=80",
            display_order: 1,
            title: "Editing Corner",
            description:
                "Where most of my film notes and diary drafts happen.",
            created_at: "2026-05-29T12:30:00.000Z",
        },
        {
            id: 403,
            student_id: 3,
            photo_url:
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
            display_order: 0,
            title: "Studio Wall",
            description: "Every good project starts with scraps and tape.",
            created_at: "2026-05-30T12:30:00.000Z",
        },
        {
            id: 404,
            student_id: 2,
            photo_url:
                "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
            display_order: 0,
            title: "Hack Night",
            description:
                "Three energy drinks, one whiteboard, and a surprisingly useful prototype.",
            created_at: "2026-05-27T12:30:00.000Z",
        },
        {
            id: 405,
            student_id: 2,
            photo_url:
                "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
            display_order: 1,
            title: "Team Standup",
            description:
                "The moment before everyone realizes the bug was one missing line.",
            created_at: "2026-05-28T12:30:00.000Z",
        },
        {
            id: 406,
            student_id: 3,
            photo_url:
                "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
            display_order: 1,
            title: "Reading Table",
            description: "My favorite corner to reset after critique sessions.",
            created_at: "2026-05-31T12:30:00.000Z",
        },
        {
            id: 407,
            student_id: 4,
            photo_url:
                "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80",
            display_order: 0,
            title: "Greenhouse Morning",
            description: "Quiet work, damp air, and the best part of my week.",
            created_at: "2026-05-26T12:30:00.000Z",
        },
        {
            id: 408,
            student_id: 4,
            photo_url:
                "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1200&q=80",
            display_order: 1,
            title: "Field Notes",
            description: "A page from the notebook I carry everywhere.",
            created_at: "2026-05-27T17:45:00.000Z",
        },
        {
            id: 409,
            student_id: ADMIN_USER_ID,
            photo_url:
                "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80",
            display_order: 0,
            title: "Welcome Portrait",
            description: "An owl-themed visual for the community admin account.",
            created_at: "2026-05-24T14:20:00.000Z",
        },
        {
            id: 410,
            student_id: ADMIN_USER_ID,
            photo_url:
                "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
            display_order: 1,
            title: "Community Night",
            description: "A snapshot that makes the admin profile feel active and present.",
            created_at: "2026-05-25T14:20:00.000Z",
        },
        {
            id: 411,
            student_id: 5,
            photo_url:
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
            display_order: 0,
            title: "Flashcards and Tea",
            description: "The ritual that keeps exam prep from becoming chaos.",
            created_at: "2026-05-27T08:15:00.000Z",
        },
        {
            id: 412,
            student_id: 6,
            photo_url:
                "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
            display_order: 0,
            title: "Late Desk",
            description: "A desk that always looks one paragraph away from clarity.",
            created_at: "2026-05-29T21:30:00.000Z",
        },
        {
            id: 413,
            student_id: 7,
            photo_url:
                "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80",
            display_order: 0,
            title: "Backstage Rack",
            description: "The kind of organized chaos only theatre people trust.",
            created_at: "2026-05-29T16:10:00.000Z",
        },
        {
            id: 414,
            student_id: 8,
            photo_url:
                "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
            display_order: 0,
            title: "Radio Booth",
            description: "Proof that tiny rooms can still hold a lot of personality.",
            created_at: "2026-05-26T10:40:00.000Z",
        },
        {
            id: 415,
            student_id: 9,
            photo_url:
                "https://images.unsplash.com/photo-1484863137850-59afcfe05386?auto=format&fit=crop&w=1200&q=80",
            display_order: 0,
            title: "Quiet Shift",
            description: "The kind of stillness that helps me reset after a long day.",
            created_at: "2026-05-25T19:25:00.000Z",
        },
        {
            id: 416,
            student_id: 10,
            photo_url:
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
            display_order: 0,
            title: "Stair Study",
            description: "Collecting shapes and shadows for a project that is finally making sense.",
            created_at: "2026-05-24T11:10:00.000Z",
        },
    ];

    const registrationCodes = [
        {
            code_id: 501,
            code: "F26AB",
            semester: "Fall 2026",
            is_active: true,
            created_at: "2026-05-20T13:00:00.000Z",
        },
        {
            code_id: 502,
            code: "S26Q9",
            semester: "Summer 2026",
            is_active: false,
            created_at: "2026-04-15T13:00:00.000Z",
        },
    ];

    return {
        students,
        posts,
        comments,
        likes,
        commentLikes,
        notifications,
        profileGallery,
        registrationCodes,
        nextIds: {
            post: 200,
            comment: 300,
            notification: 400,
            gallery: 500,
            student: 600,
            code: 700,
        },
    };
};

let state = createInitialState();
let demoToken = null;
let installed = false;

const clone = (value) => structuredClone(value);

const resetDemoState = () => {
    state = createInitialState();
    demoToken = null;
};

const getStudentById = (id) =>
    state.students.find((student) => String(student.id) === String(id));

const getCurrentUserFromToken = (token) => {
    if (!token) return null;
    try {
        const [, payload] = token.split(".");
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
        const parsed = JSON.parse(atob(padded));
        if (!parsed?.id) return null;
        return getStudentById(parsed.id) || null;
    } catch {
        return null;
    }
};

const getTokenFromHeaders = (headers) => {
    if (!headers) return demoToken;
    if (headers instanceof Headers) {
        const raw = headers.get("Authorization") || headers.get("authorization");
        return raw?.startsWith("Bearer ") ? raw.slice(7) : demoToken;
    }
    const raw = headers.Authorization || headers.authorization;
    return typeof raw === "string" && raw.startsWith("Bearer ")
        ? raw.slice(7)
        : demoToken;
};

const getViewer = (headers) => getCurrentUserFromToken(getTokenFromHeaders(headers));

const ensureAuthenticated = (headers) => {
    const viewer = getViewer(headers);
    if (!viewer) {
        throw new Response(JSON.stringify({ error: "Authentication required." }), {
            status: 401,
            headers: jsonHeaders,
        });
    }
    return viewer;
};

const makeNotification = (userId, message, linkUrl = null) => {
    state.notifications.unshift({
        id: state.nextIds.notification++,
        user_id: userId,
        message,
        is_read: 0,
        link_url: linkUrl,
        created_at: nowIso(),
    });
};

const visiblePostsForViewer = (viewer) =>
    state.posts.filter((post) => {
        if (!(post.is_hidden === 1 || post.is_hidden === true)) return true;
        if (!viewer) return false;
        return (
            String(post.student_id) === String(viewer.id) ||
            viewer.role === "admin"
        );
    });

const sortProfilePosts = (posts) =>
    [...posts].sort((a, b) => {
        const orderA = Number.isFinite(Number(a.display_order))
            ? Number(a.display_order)
            : Number.MAX_SAFE_INTEGER;
        const orderB = Number.isFinite(Number(b.display_order))
            ? Number(b.display_order)
            : Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return String(b.created_at).localeCompare(String(a.created_at));
    });

const sortFeedPosts = (posts) =>
    [...posts].sort((a, b) =>
        String(b.created_at).localeCompare(String(a.created_at)),
    );

const decoratePost = (post, viewer) => {
    const student = getStudentById(post.student_id);
    const likeCount = state.likes.filter((like) => like.post_id === post.id).length;
    const commentCount = state.comments.filter(
        (comment) => comment.post_id === post.id,
    ).length;
    const isLiked = viewer
        ? state.likes.some(
              (like) =>
                  like.post_id === post.id && like.user_id === viewer.id,
          )
        : false;

    return {
        ...clone(post),
        student_name: student?.name || "Unknown User",
        student_avatar: student?.avatar_url || "",
        likes: likeCount,
        comment_count: commentCount,
        isLiked: isLiked ? 1 : 0,
    };
};

const decorateComment = (comment, viewer) => {
    const author = getStudentById(comment.user_id);
    const likeCount = state.commentLikes.filter(
        (like) => like.comment_id === comment.id,
    ).length;
    const isLiked = viewer
        ? state.commentLikes.some(
              (like) =>
                  like.comment_id === comment.id && like.user_id === viewer.id,
          )
        : false;
    return {
        ...clone(comment),
        user_name: author?.name || "Unknown User",
        user_avatar: author?.avatar_url || "",
        likes: likeCount,
        isLiked: isLiked ? 1 : 0,
    };
};

const demoUserStats = (userId) => {
    const user = getStudentById(userId);
    const userPosts = state.posts.filter(
        (post) => String(post.student_id) === String(userId),
    );
    const postIds = new Set(userPosts.map((post) => post.id));
    const likes = state.likes.filter((like) => postIds.has(like.post_id)).length;
    return {
        posts: userPosts.length,
        comments: state.comments.filter(
            (comment) => String(comment.user_id) === String(userId),
        ).length,
        likes,
        avatar_url: user?.avatar_url || "",
        name: user?.name || "",
        about_me: user?.about_me || "",
    };
};

const parseRequestBody = async (init = {}) => {
    if (!("body" in init) || init.body == null) return null;
    if (init.body instanceof FormData) return init.body;
    if (typeof init.body === "string") {
        try {
            return JSON.parse(init.body);
        } catch {
            return init.body;
        }
    }
    return init.body;
};

const publicStudent = (student) => ({
    id: student.id,
    name: student.name,
    email: student.email,
    about_me: student.about_me,
    avatar_url: student.avatar_url,
    role: student.role,
    appearance_theme: student.appearance_theme,
    font_family: student.font_family,
    accent_color: student.accent_color,
    font_size: student.font_size,
    profile_background_url: student.profile_background_url,
    approval_status: student.approval_status,
    created_at: student.created_at,
});

const handleLogin = async (body) => {
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const user = state.students.find(
        (student) => student.email.toLowerCase() === email,
    );

    if (!user || user.password !== password) {
        return new Response(
            JSON.stringify({ error: "Wrong username or password" }),
            { status: 401, headers: jsonHeaders },
        );
    }

    if (user.approval_status !== "approved") {
        return new Response(
            JSON.stringify({
                error: "Your account is awaiting admin approval.",
            }),
            { status: 403, headers: jsonHeaders },
        );
    }

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 6;
    demoToken = createJwtLikeToken({
        id: user.id,
        email: user.email,
        role: user.role,
        exp,
    });
    return new Response(JSON.stringify({ token: demoToken }), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleStudentsList = () => {
    const approved = state.students.filter(
        (student) => student.approval_status === "approved",
    );
    approved.sort((a, b) => a.name.localeCompare(b.name));
    return new Response(JSON.stringify(approved.map(publicStudent)), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleStudentDetail = (studentId) => {
    const student = getStudentById(studentId);
    if (!student || student.approval_status !== "approved") {
        return new Response(JSON.stringify({ error: "Student not found." }), {
            status: 404,
            headers: jsonHeaders,
        });
    }
    return new Response(JSON.stringify(publicStudent(student)), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleStudentPosts = (studentId, viewer) => {
    const posts = sortProfilePosts(
        visiblePostsForViewer(viewer).filter(
            (post) => String(post.student_id) === String(studentId),
        ),
    ).map((post) => decoratePost(post, viewer));
    return new Response(JSON.stringify(posts), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handlePostsFeed = (viewer) => {
    const posts = sortFeedPosts(visiblePostsForViewer(viewer)).map((post) =>
        decoratePost(post, viewer),
    );
    return new Response(JSON.stringify(posts), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleCreatePost = async (headers, formData) => {
    const viewer = ensureAuthenticated(headers);
    const title = String(formData.get("title") || "").trim();
    const content = String(formData.get("content") || "").trim();
    const postType = String(formData.get("post_type") || "text");
    const media = formData.get("media");

    if (!title || !content || !postType) {
        return new Response(
            JSON.stringify({ message: "All fields are required to create a post." }),
            { status: 400, headers: jsonHeaders },
        );
    }

    const newPost = {
        id: state.nextIds.post++,
        student_id: viewer.id,
        title,
        content,
        post_type: postType,
        media_url:
            media instanceof File && media.size > 0
                ? URL.createObjectURL(media)
                : null,
        is_hidden: 0,
        display_order: state.posts.filter((post) => post.student_id === viewer.id).length,
        post_font_family: String(formData.get("font_family") || "") || viewer.font_family || "Inter",
        created_at: nowIso(),
    };

    state.posts.unshift(newPost);
    return new Response(
        JSON.stringify({
            success: true,
            post: decoratePost(newPost, viewer),
        }),
        { status: 201, headers: jsonHeaders },
    );
};

const handlePostDetail = (headers, postId) => {
    const viewer = getViewer(headers);
    const post = state.posts.find((entry) => String(entry.id) === String(postId));
    if (!post) {
        return new Response(JSON.stringify({ error: "Post not found." }), {
            status: 404,
            headers: jsonHeaders,
        });
    }
    if (
        (post.is_hidden === 1 || post.is_hidden === true) &&
        (!viewer ||
            (viewer.role !== "admin" &&
                String(viewer.id) !== String(post.student_id)))
    ) {
        return new Response(JSON.stringify({ error: "Post not found." }), {
            status: 404,
            headers: jsonHeaders,
        });
    }
    return new Response(JSON.stringify(decoratePost(post, viewer)), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handlePostUpdate = async (headers, postId, body) => {
    const viewer = ensureAuthenticated(headers);
    const post = state.posts.find((entry) => String(entry.id) === String(postId));
    if (!post) {
        return new Response(JSON.stringify({ error: "Post not found." }), {
            status: 404,
            headers: jsonHeaders,
        });
    }
    if (
        String(post.student_id) !== String(viewer.id) &&
        viewer.role !== "admin"
    ) {
        return new Response(JSON.stringify({ error: "Forbidden." }), {
            status: 403,
            headers: jsonHeaders,
        });
    }

    post.title = String(body?.title || post.title).trim() || post.title;
    post.content = String(body?.content || post.content).trim() || post.content;
    return new Response(JSON.stringify(decoratePost(post, viewer)), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handlePostDelete = (headers, postId) => {
    const viewer = ensureAuthenticated(headers);
    const postIndex = state.posts.findIndex(
        (entry) => String(entry.id) === String(postId),
    );
    if (postIndex === -1) {
        return new Response(JSON.stringify({ error: "Post not found." }), {
            status: 404,
            headers: jsonHeaders,
        });
    }
    const post = state.posts[postIndex];
    if (
        String(post.student_id) !== String(viewer.id) &&
        viewer.role !== "admin"
    ) {
        return new Response(JSON.stringify({ error: "Forbidden." }), {
            status: 403,
            headers: jsonHeaders,
        });
    }
    state.posts.splice(postIndex, 1);
    state.comments = state.comments.filter((comment) => comment.post_id !== post.id);
    state.likes = state.likes.filter((like) => like.post_id !== post.id);
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleTogglePostLike = async (headers, postId, body) => {
    const viewer = ensureAuthenticated(headers);
    const post = state.posts.find((entry) => String(entry.id) === String(postId));
    if (!post) {
        return new Response(JSON.stringify({ error: "Post not found." }), {
            status: 404,
            headers: jsonHeaders,
        });
    }

    const nextLiked = Boolean(body?.liked);
    const existingIndex = state.likes.findIndex(
        (like) => like.post_id === post.id && like.user_id === viewer.id,
    );
    if (nextLiked && existingIndex === -1) {
        state.likes.push({ user_id: viewer.id, post_id: post.id });
        if (viewer.id !== post.student_id) {
            makeNotification(
                post.student_id,
                `${viewer.name} liked your post '${post.title}'.`,
                `/post/${post.id}`,
            );
        }
    }
    if (!nextLiked && existingIndex !== -1) {
        state.likes.splice(existingIndex, 1);
    }
    return new Response(JSON.stringify(decoratePost(post, viewer)), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleTogglePostVisibility = async (headers, postId, body) => {
    const viewer = ensureAuthenticated(headers);
    const post = state.posts.find((entry) => String(entry.id) === String(postId));
    if (!post) {
        return new Response(JSON.stringify({ error: "Post not found." }), {
            status: 404,
            headers: jsonHeaders,
        });
    }
    if (
        viewer.role !== "admin" &&
        String(post.student_id) !== String(viewer.id)
    ) {
        return new Response(JSON.stringify({ error: "Forbidden." }), {
            status: 403,
            headers: jsonHeaders,
        });
    }
    post.is_hidden = body?.is_hidden ? 1 : 0;
    return new Response(JSON.stringify(decoratePost(post, viewer)), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleReorderPosts = async (headers, body) => {
    const viewer = ensureAuthenticated(headers);
    const postIds = Array.isArray(body?.postIds) ? body.postIds : [];
    postIds.forEach((id, index) => {
        const post = state.posts.find(
            (entry) =>
                String(entry.id) === String(id) &&
                String(entry.student_id) === String(viewer.id),
        );
        if (post) {
            post.display_order = index;
        }
    });
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handlePostCommentsList = (headers, postId) => {
    const viewer = getViewer(headers);
    const comments = state.comments
        .filter((comment) => String(comment.post_id) === String(postId))
        .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
        .map((comment) => decorateComment(comment, viewer));
    return new Response(JSON.stringify(comments), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handlePostCommentCreate = async (headers, postId, body) => {
    const viewer = ensureAuthenticated(headers);
    const content = String(body?.content || "").trim();
    if (!content) {
        return new Response(JSON.stringify({ error: "Comment content is required." }), {
            status: 400,
            headers: jsonHeaders,
        });
    }
    const comment = {
        id: state.nextIds.comment++,
        post_id: Number(postId),
        user_id: viewer.id,
        content,
        created_at: nowIso(),
    };
    state.comments.push(comment);

    const post = state.posts.find((entry) => String(entry.id) === String(postId));
    if (post && post.student_id !== viewer.id) {
        makeNotification(
            post.student_id,
            `${viewer.name} commented on your post '${post.title}'.`,
            `/post/${post.id}#comment-${comment.id}`,
        );
    }

    return new Response(
        JSON.stringify({ comment: decorateComment(comment, viewer) }),
        { status: 201, headers: jsonHeaders },
    );
};

const handleCommentLike = async (headers, commentId, body) => {
    const viewer = ensureAuthenticated(headers);
    const comment = state.comments.find(
        (entry) => String(entry.id) === String(commentId),
    );
    if (!comment) {
        return new Response(JSON.stringify({ error: "Comment not found." }), {
            status: 404,
            headers: jsonHeaders,
        });
    }
    const nextLiked = Boolean(body?.liked);
    const existingIndex = state.commentLikes.findIndex(
        (like) => like.comment_id === comment.id && like.user_id === viewer.id,
    );
    if (nextLiked && existingIndex === -1) {
        state.commentLikes.push({ user_id: viewer.id, comment_id: comment.id });
    }
    if (!nextLiked && existingIndex !== -1) {
        state.commentLikes.splice(existingIndex, 1);
    }
    return new Response(JSON.stringify(decorateComment(comment, viewer)), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleCommentUpdate = async (headers, commentId, body) => {
    const viewer = ensureAuthenticated(headers);
    const comment = state.comments.find(
        (entry) => String(entry.id) === String(commentId),
    );
    if (!comment) {
        return new Response(JSON.stringify({ error: "Comment not found." }), {
            status: 404,
            headers: jsonHeaders,
        });
    }
    if (
        String(comment.user_id) !== String(viewer.id) &&
        viewer.role !== "admin"
    ) {
        return new Response(JSON.stringify({ error: "Forbidden." }), {
            status: 403,
            headers: jsonHeaders,
        });
    }
    comment.content = String(body?.content || comment.content).trim() || comment.content;
    return new Response(
        JSON.stringify({ comment: decorateComment(comment, viewer) }),
        { status: 200, headers: jsonHeaders },
    );
};

const handleCommentDelete = (headers, commentId) => {
    const viewer = ensureAuthenticated(headers);
    const index = state.comments.findIndex(
        (entry) => String(entry.id) === String(commentId),
    );
    if (index === -1) {
        return new Response(JSON.stringify({ error: "Comment not found." }), {
            status: 404,
            headers: jsonHeaders,
        });
    }
    const comment = state.comments[index];
    if (
        String(comment.user_id) !== String(viewer.id) &&
        viewer.role !== "admin"
    ) {
        return new Response(JSON.stringify({ error: "Forbidden." }), {
            status: 403,
            headers: jsonHeaders,
        });
    }
    state.comments.splice(index, 1);
    state.commentLikes = state.commentLikes.filter(
        (like) => like.comment_id !== comment.id,
    );
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleProfileUpdate = async (headers, formData) => {
    const viewer = ensureAuthenticated(headers);
    const user = getStudentById(viewer.id);
    if (!user) {
        return new Response(JSON.stringify({ error: "User not found." }), {
            status: 404,
            headers: jsonHeaders,
        });
    }

    const updateField = (key) => {
        const value = formData.get(key);
        if (typeof value === "string") {
            user[key] = value;
        }
    };

    updateField("name");
    updateField("about_me");
    updateField("appearance_theme");
    updateField("font_family");
    updateField("accent_color");
    updateField("font_size");

    const avatar = formData.get("avatar");
    if (avatar instanceof File && avatar.size > 0) {
        user.avatar_url = URL.createObjectURL(avatar);
    }
    const background = formData.get("profile_background");
    if (background instanceof File && background.size > 0) {
        user.profile_background_url = URL.createObjectURL(background);
    }
    return new Response(JSON.stringify(publicStudent(user)), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleGalleryList = (studentId) => {
    const gallery = state.profileGallery
        .filter((photo) => String(photo.student_id) === String(studentId))
        .sort((a, b) => Number(a.display_order) - Number(b.display_order));
    return new Response(JSON.stringify(clone(gallery)), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleGalleryCreate = async (headers, formData) => {
    const viewer = ensureAuthenticated(headers);
    const photo = formData.get("photo");
    if (!(photo instanceof File) || photo.size === 0) {
        return new Response(JSON.stringify({ error: "Photo file is required." }), {
            status: 400,
            headers: jsonHeaders,
        });
    }
    const galleryPhoto = {
        id: state.nextIds.gallery++,
        student_id: viewer.id,
        photo_url: URL.createObjectURL(photo),
        title: String(formData.get("title") || "").trim(),
        description: String(formData.get("description") || "").trim(),
        display_order: state.profileGallery.filter(
            (entry) => entry.student_id === viewer.id,
        ).length,
        created_at: nowIso(),
    };
    state.profileGallery.unshift(galleryPhoto);
    return new Response(JSON.stringify(clone(galleryPhoto)), {
        status: 201,
        headers: jsonHeaders,
    });
};

const handleGalleryUpdate = async (headers, photoId, body) => {
    const viewer = ensureAuthenticated(headers);
    const photo = state.profileGallery.find(
        (entry) => String(entry.id) === String(photoId),
    );
    if (!photo) {
        return new Response(JSON.stringify({ error: "Photo not found." }), {
            status: 404,
            headers: jsonHeaders,
        });
    }
    if (String(photo.student_id) !== String(viewer.id)) {
        return new Response(JSON.stringify({ error: "Forbidden." }), {
            status: 403,
            headers: jsonHeaders,
        });
    }
    photo.title = String(body?.title || "").trim();
    photo.description = String(body?.description || "").trim();
    return new Response(JSON.stringify(clone(photo)), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleGalleryReorder = async (headers, body) => {
    const viewer = ensureAuthenticated(headers);
    const photoIds = Array.isArray(body?.photoIds) ? body.photoIds : [];
    photoIds.forEach((id, index) => {
        const photo = state.profileGallery.find(
            (entry) =>
                String(entry.id) === String(id) &&
                String(entry.student_id) === String(viewer.id),
        );
        if (photo) {
            photo.display_order = index;
        }
    });
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleNotifications = (headers) => {
    const viewer = ensureAuthenticated(headers);
    const notes = state.notifications.filter(
        (note) => String(note.user_id) === String(viewer.id),
    );
    return new Response(JSON.stringify(clone(notes)), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleNotificationRead = (headers, notificationId) => {
    const viewer = ensureAuthenticated(headers);
    const note = state.notifications.find(
        (entry) =>
            String(entry.id) === String(notificationId) &&
            String(entry.user_id) === String(viewer.id),
    );
    if (note) note.is_read = 1;
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleNotificationsReadAll = (headers) => {
    const viewer = ensureAuthenticated(headers);
    state.notifications.forEach((note) => {
        if (String(note.user_id) === String(viewer.id)) {
            note.is_read = 1;
        }
    });
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleMe = (headers) => {
    const viewer = ensureAuthenticated(headers);
    return new Response(
        JSON.stringify({
            id: viewer.id,
            name: viewer.name,
            email: viewer.email,
            role: viewer.role,
        }),
        { status: 200, headers: jsonHeaders },
    );
};

const handleExport = (headers) => {
    const viewer = ensureAuthenticated(headers);
    const exportPayload = {
        user: publicStudent(viewer),
        posts: state.posts.filter((post) => post.student_id === viewer.id),
        comments: state.comments.filter((comment) => comment.user_id === viewer.id),
        gallery: state.profileGallery.filter(
            (photo) => photo.student_id === viewer.id,
        ),
    };
    return new Response(JSON.stringify(exportPayload), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handlePendingStudents = (headers) => {
    const viewer = ensureAuthenticated(headers);
    if (viewer.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden." }), {
            status: 403,
            headers: jsonHeaders,
        });
    }
    const pending = state.students.filter(
        (student) => student.approval_status === "pending",
    );
    return new Response(JSON.stringify(pending.map(publicStudent)), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleApproveStudent = (headers, studentId) => {
    const viewer = ensureAuthenticated(headers);
    if (viewer.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden." }), {
            status: 403,
            headers: jsonHeaders,
        });
    }
    const student = getStudentById(studentId);
    if (!student) {
        return new Response(JSON.stringify({ error: "Student not found." }), {
            status: 404,
            headers: jsonHeaders,
        });
    }
    student.approval_status = "approved";
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleDenyStudent = (headers, studentId) => {
    const viewer = ensureAuthenticated(headers);
    if (viewer.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden." }), {
            status: 403,
            headers: jsonHeaders,
        });
    }
    state.students = state.students.filter(
        (student) => String(student.id) !== String(studentId),
    );
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleApproveAllStudents = (headers) => {
    const viewer = ensureAuthenticated(headers);
    if (viewer.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden." }), {
            status: 403,
            headers: jsonHeaders,
        });
    }
    state.students.forEach((student) => {
        if (student.approval_status === "pending") {
            student.approval_status = "approved";
        }
    });
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleCreateAdmin = async (headers, body) => {
    const viewer = ensureAuthenticated(headers);
    if (viewer.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden." }), {
            status: 403,
            headers: jsonHeaders,
        });
    }
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "").trim();
    const name = String(body?.name || "").trim() || "New Admin";
    if (!email || !password) {
        return new Response(JSON.stringify({ error: "Email and password are required." }), {
            status: 400,
            headers: jsonHeaders,
        });
    }
    state.students.push({
        id: state.nextIds.student++,
        name,
        email,
        password,
        about_me: "Demo admin account",
        avatar_url: avatarSvgDataUrl("0f172a", name),
        role: "admin",
        appearance_theme: "classic",
        font_family: "Inter",
        accent_color: "#0f172a",
        font_size: "16px",
        profile_background_url: "",
        approval_status: "approved",
        created_at: nowIso(),
    });
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleRegistrationCodes = (headers) => {
    const viewer = ensureAuthenticated(headers);
    if (viewer.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden." }), {
            status: 403,
            headers: jsonHeaders,
        });
    }
    return new Response(JSON.stringify(clone(state.registrationCodes)), {
        status: 200,
        headers: jsonHeaders,
    });
};

const handleCreateRegistrationCode = async (headers, body) => {
    const viewer = ensureAuthenticated(headers);
    if (viewer.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden." }), {
            status: 403,
            headers: jsonHeaders,
        });
    }
    const code = String(body?.code || "").trim().toUpperCase();
    const semester = String(body?.semester || "").trim();
    if (!code || !semester) {
        return new Response(JSON.stringify({ error: "Code and semester are required." }), {
            status: 400,
            headers: jsonHeaders,
        });
    }
    state.registrationCodes.forEach((entry) => {
        entry.is_active = false;
    });
    state.registrationCodes.unshift({
        code_id: state.nextIds.code++,
        code,
        semester,
        is_active: true,
        created_at: nowIso(),
    });
    return new Response(JSON.stringify({ success: true }), {
        status: 201,
        headers: jsonHeaders,
    });
};

const handleValidateCode = (code) => {
    const match = state.registrationCodes.find(
        (entry) => entry.code === String(code).toUpperCase() && entry.is_active,
    );
    if (!match) {
        return new Response(JSON.stringify({ valid: false }), {
            status: 404,
            headers: jsonHeaders,
        });
    }
    return new Response(
        JSON.stringify({ valid: true, semester: match.semester }),
        { status: 200, headers: jsonHeaders },
    );
};

const handleSignup = async (body) => {
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "").trim();
    const name = String(body?.name || "").trim();
    const aboutMe = String(body?.about_me || "").trim();
    if (!email || !password || !name) {
        return new Response(JSON.stringify({ error: "Missing required fields." }), {
            status: 400,
            headers: jsonHeaders,
        });
    }
    const exists = state.students.some((student) => student.email === email);
    if (exists) {
        return new Response(JSON.stringify({ error: "Email already exists." }), {
            status: 409,
            headers: jsonHeaders,
        });
    }
    const student = {
        id: state.nextIds.student++,
        name,
        email,
        password,
        about_me: aboutMe,
        avatar_url: avatarSvgDataUrl("1d4ed8", name),
        role: "user",
        appearance_theme: "classic",
        font_family: "Inter",
        accent_color: "#1d4ed8",
        font_size: "16px",
        profile_background_url: "",
        approval_status: "pending",
        created_at: nowIso(),
    };
    state.students.push(student);
    makeNotification(
        ADMIN_USER_ID,
        `${student.name} signed up and is awaiting approval.`,
        "/settings",
    );
    return new Response(
        JSON.stringify({
            message:
                "Demo account created. An admin can approve it from Settings in this session.",
        }),
        { status: 201, headers: jsonHeaders },
    );
};

const routeDemoRequest = async (url, init = {}) => {
    const method = String(init.method || "GET").toUpperCase();
    const parsedUrl = new URL(url, window.location.origin);
    const pathname = parsedUrl.pathname;
    const headers = init.headers;
    const body = await parseRequestBody(init);

    if (pathname === "/api/health") {
        return new Response(
            JSON.stringify({
                status: "ready",
                ready: true,
                stage: "demo_mode",
                error: null,
            }),
            { status: 200, headers: jsonHeaders },
        );
    }

    if (pathname === "/api/login" && method === "POST") {
        return handleLogin(body);
    }
    if (pathname === "/api/signup" && method === "POST") {
        return handleSignup(body);
    }
    if (pathname.startsWith("/api/validate-code/") && method === "GET") {
        return handleValidateCode(pathname.split("/").pop());
    }
    if (pathname === "/api/students" && method === "GET") {
        return handleStudentsList();
    }
    if (pathname === "/api/posts" && method === "GET") {
        return handlePostsFeed(getViewer(headers));
    }
    if (pathname === "/api/posts" && method === "POST") {
        return handleCreatePost(headers, body);
    }
    if (pathname === "/api/posts/reorder" && method === "PUT") {
        return handleReorderPosts(headers, body);
    }
    if (pathname === "/api/profile" && method === "PUT") {
        return handleProfileUpdate(headers, body);
    }
    if (pathname === "/api/profile/gallery" && method === "POST") {
        return handleGalleryCreate(headers, body);
    }
    if (pathname === "/api/profile/gallery/reorder" && method === "PUT") {
        return handleGalleryReorder(headers, body);
    }
    if (pathname === "/api/notifications" && method === "GET") {
        return handleNotifications(headers);
    }
    if (pathname === "/api/notifications/read-all" && method === "PUT") {
        return handleNotificationsReadAll(headers);
    }
    if (pathname === "/api/me" && method === "GET") {
        return handleMe(headers);
    }
    if (pathname === "/api/export" && method === "GET") {
        return handleExport(headers);
    }
    if (pathname === "/api/students/pending" && method === "GET") {
        return handlePendingStudents(headers);
    }
    if (pathname === "/api/students/approve-all" && method === "POST") {
        return handleApproveAllStudents(headers);
    }
    if (pathname === "/api/create-admin" && method === "POST") {
        return handleCreateAdmin(headers, body);
    }
    if (pathname === "/api/registration-codes" && method === "GET") {
        return handleRegistrationCodes(headers);
    }
    if (pathname === "/api/generate-registration-code" && method === "POST") {
        return handleCreateRegistrationCode(headers, body);
    }

    let match = pathname.match(/^\/api\/students\/(\d+)$/);
    if (match && method === "GET") {
        return handleStudentDetail(match[1]);
    }

    match = pathname.match(/^\/api\/students\/(\d+)\/posts$/);
    if (match && method === "GET") {
        return handleStudentPosts(match[1], getViewer(headers));
    }

    match = pathname.match(/^\/api\/students\/(\d+)\/gallery$/);
    if (match && method === "GET") {
        return handleGalleryList(match[1]);
    }

    match = pathname.match(/^\/api\/students\/(\d+)\/approve$/);
    if (match && method === "POST") {
        return handleApproveStudent(headers, match[1]);
    }

    match = pathname.match(/^\/api\/students\/(\d+)\/deny$/);
    if (match && method === "POST") {
        return handleDenyStudent(headers, match[1]);
    }

    match = pathname.match(/^\/api\/user-stats\/(\d+)$/);
    if (match && method === "GET") {
        return new Response(JSON.stringify(demoUserStats(match[1])), {
            status: 200,
            headers: jsonHeaders,
        });
    }

    match = pathname.match(/^\/api\/posts\/(\d+)$/);
    if (match && method === "GET") {
        return handlePostDetail(headers, match[1]);
    }
    if (match && method === "PUT") {
        return handlePostUpdate(headers, match[1], body);
    }
    if (match && method === "DELETE") {
        return handlePostDelete(headers, match[1]);
    }

    match = pathname.match(/^\/api\/posts\/(\d+)\/like$/);
    if (match && method === "POST") {
        return handleTogglePostLike(headers, match[1], body);
    }

    match = pathname.match(/^\/api\/posts\/(\d+)\/visibility$/);
    if (match && method === "PUT") {
        return handleTogglePostVisibility(headers, match[1], body);
    }

    match = pathname.match(/^\/api\/posts\/(\d+)\/comments$/);
    if (match && method === "GET") {
        return handlePostCommentsList(headers, match[1]);
    }
    if (match && method === "POST") {
        return handlePostCommentCreate(headers, match[1], body);
    }

    match = pathname.match(/^\/api\/comments\/(\d+)\/like$/);
    if (match && method === "POST") {
        return handleCommentLike(headers, match[1], body);
    }

    match = pathname.match(/^\/api\/comments\/(\d+)$/);
    if (match && method === "PUT") {
        return handleCommentUpdate(headers, match[1], body);
    }
    if (match && method === "DELETE") {
        return handleCommentDelete(headers, match[1]);
    }

    match = pathname.match(/^\/api\/profile\/gallery\/(\d+)$/);
    if (match && method === "PUT") {
        return handleGalleryUpdate(headers, match[1], body);
    }

    match = pathname.match(/^\/api\/notifications\/(\d+)\/read$/);
    if (match && method === "PUT") {
        return handleNotificationRead(headers, match[1]);
    }

    return new Response(
        JSON.stringify({
            error: `Demo route not implemented for ${method} ${pathname}`,
        }),
        { status: 404, headers: jsonHeaders },
    );
};

export const installDemoApi = () => {
    if (!DEMO_MODE || installed || typeof window === "undefined") return;
    installed = true;
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
        const target =
            typeof input === "string"
                ? input
                : input instanceof Request
                  ? input.url
                  : String(input);
        const parsed = new URL(target, window.location.origin);
        if (!parsed.pathname.startsWith("/api/")) {
            return originalFetch(input, init);
        }
        return routeDemoRequest(parsed.toString(), init || {});
    };
};

export const isDemoModeEnabled = () => DEMO_MODE;

export const getDemoToken = () => demoToken;

export const setDemoToken = (token) => {
    demoToken = token;
};

export const clearDemoSession = () => {
    resetDemoState();
};

export const getDemoCredentials = () => ({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
});

export const getAdminDemoCredentials = () => ({
    email: ADMIN_EMAIL,
    password: DEMO_PASSWORD,
});
