const express = require("express");
const { body, param, query } = require("express-validator");
const {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeachersByDepartment,
  getTeacherStats,
} = require("../controllers/teacherController");
const { protect, authorize } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validate");

const router = express.Router();

// Validation rules
const teacherValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("department")
    .isIn([
      "Mathematics",
      "Science",
      "English",
      "History",
      "Geography",
      "Computer Science",
      "Physical Education",
      "Arts",
      "Music",
      "Other",
    ])
    .withMessage("Invalid department"),
  body("qualification")
    .isIn(["Bachelor", "Masters", "PhD", "Diploma", "Other"])
    .withMessage("Invalid qualification"),
  body("experience")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Experience must be a non-negative integer"),
  body("dateOfBirth").isISO8601().withMessage("Invalid date of birth"),
  body("gender")
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  body("contactNumber")
    .optional()
    .matches(/^\+?[\d\s-]+$/)
    .withMessage("Please provide a valid contact number"),
  body("salary")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Salary must be a non-negative number"),
];

const updateTeacherValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("department")
    .optional()
    .isIn([
      "Mathematics",
      "Science",
      "English",
      "History",
      "Geography",
      "Computer Science",
      "Physical Education",
      "Arts",
      "Music",
      "Other",
    ])
    .withMessage("Invalid department"),
  body("qualification")
    .optional()
    .isIn(["Bachelor", "Masters", "PhD", "Diploma", "Other"])
    .withMessage("Invalid qualification"),
  body("experience")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Experience must be a non-negative integer"),
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
  body("salary")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Salary must be a non-negative number"),
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
  query("department")
    .optional()
    .isIn([
      "Mathematics",
      "Science",
      "English",
      "History",
      "Geography",
      "Computer Science",
      "Physical Education",
      "Arts",
      "Music",
      "Other",
    ])
    .withMessage("Invalid department"),
];

const idValidation = [
  param("id").isMongoId().withMessage("Invalid teacher ID"),
];

const departmentValidation = [
  param("department")
    .isIn([
      "Mathematics",
      "Science",
      "English",
      "History",
      "Geography",
      "Computer Science",
      "Physical Education",
      "Arts",
      "Music",
      "Other",
    ])
    .withMessage("Invalid department"),
];

// Apply protect middleware to all routes
router.use(protect);

// Routes
router.get(
  "/",
  authorize("admin"),
  queryValidation,
  handleValidationErrors,
  getTeachers
);
router.get("/:id", idValidation, handleValidationErrors, getTeacher);
router.post(
  "/",
  authorize("admin"),
  teacherValidation,
  handleValidationErrors,
  createTeacher
);
router.put(
  "/:id",
  idValidation,
  updateTeacherValidation,
  handleValidationErrors,
  updateTeacher
);
router.delete(
  "/:id",
  authorize("admin"),
  idValidation,
  handleValidationErrors,
  deleteTeacher
);
router.get(
  "/department/:department",
  authorize("admin"),
  departmentValidation,
  handleValidationErrors,
  getTeachersByDepartment
);
router.get("/stats/overview", authorize("admin"), getTeacherStats);

module.exports = router;
