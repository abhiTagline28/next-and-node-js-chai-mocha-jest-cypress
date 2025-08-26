const express = require("express");
const { body, param, query } = require("express-validator");
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentAttendance,
  getStudentGrades,
} = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validate");

const router = express.Router();

// Validation rules
const studentValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("grade")
    .isIn(["9th", "10th", "11th", "12th"])
    .withMessage("Grade must be 9th, 10th, 11th, or 12th"),
  body("section")
    .isIn(["A", "B", "C", "D"])
    .withMessage("Section must be A, B, C, or D"),
  body("dateOfBirth").isISO8601().withMessage("Invalid date of birth"),
  body("gender")
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  body("contactNumber")
    .optional()
    .matches(/^\+?[\d\s-]+$/)
    .withMessage("Please provide a valid contact number"),
];

const updateStudentValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("grade")
    .optional()
    .isIn(["9th", "10th", "11th", "12th"])
    .withMessage("Grade must be 9th, 10th, 11th, or 12th"),
  body("section")
    .optional()
    .isIn(["A", "B", "C", "D"])
    .withMessage("Section must be A, B, C, or D"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date of birth"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  body("contactNumber")
    .optional()
    .matches(/^\+?[\d\s-]+$/)
    .withMessage("Please provide a valid contact number"),
];

const queryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("grade")
    .optional()
    .isIn(["9th", "10th", "11th", "12th"])
    .withMessage("Invalid grade"),
  query("section")
    .optional()
    .isIn(["A", "B", "C", "D"])
    .withMessage("Invalid section"),
];

const idValidation = [
  param("id").isMongoId().withMessage("Invalid student ID"),
];

const dateValidation = [
  query("startDate").optional().isISO8601().withMessage("Invalid start date"),
  query("endDate").optional().isISO8601().withMessage("Invalid end date"),
];

// Apply protect middleware to all routes
router.use(protect);

// Routes
router.get(
  "/",
  authorize("teacher", "admin"),
  queryValidation,
  handleValidationErrors,
  getStudents
);
router.get("/:id", idValidation, handleValidationErrors, getStudent);
router.post(
  "/",
  authorize("admin"),
  studentValidation,
  handleValidationErrors,
  createStudent
);
router.put(
  "/:id",
  idValidation,
  updateStudentValidation,
  handleValidationErrors,
  updateStudent
);
router.delete(
  "/:id",
  authorize("admin"),
  idValidation,
  handleValidationErrors,
  deleteStudent
);
router.get(
  "/:id/attendance",
  idValidation,
  dateValidation,
  handleValidationErrors,
  getStudentAttendance
);
router.get(
  "/:id/grades",
  idValidation,
  handleValidationErrors,
  getStudentGrades
);

module.exports = router;
