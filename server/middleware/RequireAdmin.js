export const RequireAdmin = (req, res, next) => {
    console.log("Inside RequireAdmin middleware");
    if (!req.user) {
        return res.status(401).json({
            error: "Authentication required",
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            error: "Admin access required",
        });
    }

    console.log("Calling next() in RequireAdmin");
    next();
};
