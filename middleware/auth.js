const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../utils/errorHandler");
const User = require("../models/User");
const { verifyJWT } = require("../utils/jwt");

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const { verifyJWT } = require("../utils/jwt");
    const decoded = verifyJWT(token);

    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if user is active
const checkActive = asyncHandler(async (req, res, next) => {
  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Account is deactivated",
    });
  }
  next();
});

module.exports = {
  protect,
  authorize,
  checkActive,
};
