import { DEMO_MODE } from "./config";

const DEMO_EMAIL = "maya.thompson@owldiary.demo";
const DEMO_PASSWORD = "Password123!";

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

const demoImage = (seed, label) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=${seed}&color=ffffff&size=300`;

const createInitialState = () => {
    const students = [
        {
            id: 1,
            name: "Maya Thompson",
            email: DEMO_EMAIL,
            password: DEMO_PASSWORD,
            about_me:
                "Film club lead, late-night journaler, and the person who always has a campus coffee recommendation ready.",
            avatar_url: demoImage("1d4ed8", "Maya Thompson"),
            role: "admin",
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
                "Writes about basketball, grief, and the weird calm that hits after midnight study sessions.",
            avatar_url: demoImage("0f766e", "Jordan Ellis"),
            role: "user",
            appearance_theme: "classic",
            font_family: "Inter",
            accent_color: "#0f766e",
            font_size: "16px",
            profile_background_url:
                "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1400&q=80",
            approval_status: "approved",
            created_at: "2026-05-12T13:00:00.000Z",
        },
        {
            id: 3,
            name: "Avery Chen",
            email: "avery.chen@owldiary.demo",
            password: DEMO_PASSWORD,
            about_me:
                "Design student. I save color palettes like other people save receipts.",
            avatar_url: demoImage("7c3aed", "Avery Chen"),
            role: "user",
            appearance_theme: "classic",
            font_family: "Playfair Display",
            accent_color: "#7c3aed",
            font_size: "16px",
            profile_background_url:
                "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=1400&q=80",
            approval_status: "approved",
            created_at: "2026-05-08T13:00:00.000Z",
        },
        {
            id: 4,
            name: "Noah Ramirez",
            email: "noah.ramirez@owldiary.demo",
            password: DEMO_PASSWORD,
            about_me:
                "Trying to become the kind of person who actually revises first drafts instead of pretending they are done.",
            avatar_url: demoImage("ea580c", "Noah Ramirez"),
            role: "user",
            appearance_theme: "classic",
            font_family: "Inter",
            accent_color: "#ea580c",
            font_size: "16px",
            profile_background_url:
                "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1400&q=80",
            approval_status: "approved",
            created_at: "2026-05-05T13:00:00.000Z",
        },
        {
            id: 5,
            name: "Taylor Brooks",
            email: "taylor.brooks@owldiary.demo",
            password: DEMO_PASSWORD,
            about_me:
                "Pending approval account for the admin workflow demo.",
            avatar_url: demoImage("64748b", "Taylor Brooks"),
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
    ];

    const likes = [
        { user_id: 2, post_id: 101 },
        { user_id: 3, post_id: 101 },
        { user_id: 4, post_id: 101 },
        { user_id: 1, post_id: 103 },
        { user_id: 3, post_id: 103 },
        { user_id: 1, post_id: 104 },
    ];

    const commentLikes = [
        { user_id: 1, comment_id: 201 },
        { user_id: 4, comment_id: 201 },
        { user_id: 2, comment_id: 203 },
    ];

    const notifications = [
        {
            id: 301,
            user_id: 1,
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

const sortPosts = (posts) =>
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
    const posts = sortPosts(
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
    const posts = sortPosts(visiblePostsForViewer(viewer)).map((post) =>
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
        avatar_url: demoImage("0f172a", name),
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
        avatar_url: demoImage("1d4ed8", name),
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
        1,
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
