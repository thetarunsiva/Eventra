const jwt = require("jsonwebtoken");

const adminMiddleware = (req, res, next) => {
      if (req.user.role !== 'Admin') {
            return res.status(403).json({
            success: false,
            message: "Admin access required!",
            });
      }
      next();
};

module.exports = adminMiddleware;