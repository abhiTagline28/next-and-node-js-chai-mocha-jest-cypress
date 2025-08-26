const express = require("express");
const { body } = require("express-validator");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validate");

const router = express.Router();

// Validation rules
const signupValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .isIn(["student", "teacher", "admin"])
    .withMessage("Role must be student, teacher, or admin"),
  body("grade")
    .if(body("role").equals("student"))
    .isIn(["9th", "10th", "11th", "12th"])
    .withMessage("Grade must be 9th, 10th, 11th, or 12th"),
  body("section")
    .if(body("role").equals("student"))
    .isIn(["A", "B", "C", "D"])
    .withMessage("Section must be A, B, C, or D"),
  body("department")
    .if(body("role").equals("teacher"))
    .notEmpty()
    .withMessage("Department is required for teachers"),
  body("qualification")
    .if(body("role").equals("teacher"))
    .isIn(["Bachelor", "Masters", "PhD", "Diploma", "Other"])
    .withMessage("Invalid qualification"),
  body("dateOfBirth")
    .if(body("role").isIn(["student", "teacher"]))
    .isISO8601()
    .withMessage("Invalid date of birth"),
  body("gender")
    .if(body("role").isIn(["student", "teacher"]))
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
];

const resetPasswordValidation = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

// Routes
router.post("/signup", signupValidation, handleValidationErrors, signup);
router.post("/login", loginValidation, handleValidationErrors, login);
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  handleValidationErrors,
  forgotPassword
);
router.post(
  "/reset-password/:resetToken",
  resetPasswordValidation,
  handleValidationErrors,
  resetPassword
);
router.put(
  "/change-password",
  protect,
  changePasswordValidation,
  handleValidationErrors,
  changePassword
);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
