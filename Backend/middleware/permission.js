
  const mongoose = require("mongoose");

  const checkPermission = (User1) => {
    return (moduleName, action) => {
      return async (req, res, next) => {
        try {
          if (!mongoose.isValidObjectId(req.userId)) {
            return res.status(401).json({
              success: false,
              message: "Invalid user ID",
            });
          }

          const user = await User1.findById(req.userId).populate("role");

          if (!user || user.status !== "active") {
            return res.status(401).json({
              success: false,
              message: "User not found or inactive",
            });
          }

          if (!user.role || user.role.status !== "active") {
            return res.status(403).json({
              success: false,
              message: "Role is inactive",
            });
          }

          // Only allow known modules and actions
          const allowedModules = [
            "students",
            "colleges",
            "roles",
            "courses",
            "degrees",
            "streams",
            "specializations",
          ];

          const allowedActions = [
            "create",
            "view",
            "update",
            "delete",
          ];

          if (
            !allowedModules.includes(moduleName) ||
            !allowedActions.includes(action)
          ) {
            return res.status(400).json({
              success: false,
              message: "Invalid module or permission action",
            });
          }

          // Check module-wise permission
          const hasPermission =
            user.role.roleName.replace(/\s+/g, "").toLowerCase() ===
            "superadmin" ||
            user.role.permissions?.[moduleName]?.[action] === true;

          if (!hasPermission) {
            return res.status(403).json({
              success: false,
              message: `You do not have ${action} permission for ${moduleName}`,
            });
          }

          req.user = user;
          req.role = user.role;

          return next();
        } catch (error) {
          console.error("Permission middleware error:", error);

          return res.status(500).json({
            success: false,
            message: "Internal server error",
          });
        }
      };
    };
  };

  module.exports = checkPermission;
