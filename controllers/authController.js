const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const { asyncHandler, ApiError } = require("../utils/errorHandler");
const { createJWT } = require("../utils/jwt");
const { hashPassword, comparePassword } = require("../utils/password");
const crypto = require("crypto");

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role, ...profileData } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError("User already exists with this email", 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Create profile based on role
  let profile;
  if (role === "student") {
    profile = await Student.create({
      user: user._id,
      ...profileData,
    });
  } else if (role === "teacher") {
    profile = await Teacher.create({
      user: user._id,
      ...profileData,
    });
  }

  // Generate token
  const token = createJWT(user._id, user.role);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError("Invalid credentials", 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError("Account is deactivated", 403);
  }

  // Check if password matches
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError("Invalid credentials", 401);
  }

  // Generate token
  const token = createJWT(user._id, user.role);

  res.json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError("User not found with this email", 404);
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  res.json({
    success: true,
    message: "Password reset token generated",
    resetToken,
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError("Invalid or expired reset token", 400);
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: "Password reset successful",
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError("Current password is incorrect", 400);
  }

  // Set new password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: "Password changed successfully",
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  logout,
};
