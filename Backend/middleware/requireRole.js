
const mongoose = require("mongoose");

const requireRole = (User1) => {
  return (...allowedRoles) => {
    return async (req, res, next) => {
      try {
        if (!mongoose.isValidObjectId(req.userId)) {
          return res.status(401).json({
            success: false,
            message: "Invalid user ID",
          });
        }

        const user = await User1.findById(req.userId)
          .populate("role");

        if (!user || user.status !== "active") {
          return res.status(401).json({
            success: false,
            message: "User not found or inactive",
          });
        }

        if (!user.role || user.role.status !== "active") {
          return res.status(403).json({
            success: false,
            message: "User role is inactive",
          });
        }

        const normalize = (value) =>
          String(value || "")
            .toLowerCase()
            .replace(/[\s_-]/g, "");

        const userRole = normalize(user.role.roleName);

        const isAllowed = allowedRoles.some(
          (role) => normalize(role) === userRole
        );

        if (!isAllowed) {
          return res.status(403).json({
            success: false,
            message: "Access denied: insufficient role",
          });
        }

        req.user = user;
        req.role = user.role;

        return next();
      } catch (error) {
        console.error("Role middleware error:", error);

        return res.status(500).json({
          success: false,
          message: "Role verification failed",
        });
      }
    };
  };
};

module.exports = requireRole;
