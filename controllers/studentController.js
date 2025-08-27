const studentService = require("../services/studentService");
const { asyncHandler } = require("../utils/errorHandler");

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Teachers, Admins)
const getStudents = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, grade, section } = req.query;
    const result = await studentService.getStudents({
      page,
      limit,
      grade,
      section,
    });

    res.json({
      success: true,
      data: result.students,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching students",
    });
  }
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private (Teachers, Admins, Student can access own profile)
const getStudent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const student = await studentService.getStudentById(id);

    // Check authorization
    if (
      req.user.role !== "admin" &&
      req.user.role !== "teacher" &&
      student.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this student profile",
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      res.status(404).json({
        success: false,
        message: "Student not found",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error fetching student",
      });
    }
  }
});

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admins only)
const createStudent = asyncHandler(async (req, res) => {
  try {
    const student = await studentService.createStudent(req.body);
    console.log("student >>>> ", student);

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    if (error.statusCode === 400) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error creating student",
      });
    }
  }
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Teachers, Admins, Student can update own profile)
const updateStudent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const student = await studentService.updateStudent(
      id,
      updateData,
      req.user
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      res.status(404).json({
        success: false,
        message: "Student not found",
      });
    } else if (error.statusCode === 403) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error updating student",
      });
    }
  }
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admins only)
const deleteStudent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const result = await studentService.deleteStudent(id, req.user);

    res.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    if (error.statusCode === 404) {
      res.status(404).json({
        success: false,
        message: "Student not found",
      });
    } else if (error.statusCode === 403) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error deleting student",
      });
    }
  }
});

// @desc    Get student attendance
// @route   GET /api/students/:id/attendance
// @access  Private (Teachers, Admins, Student can access own attendance)
const getStudentAttendance = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Check authorization
    const student = await studentService.getStudentById(id);
    if (
      req.user.role !== "admin" &&
      req.user.role !== "teacher" &&
      student.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this student's attendance",
      });
    }

    const attendance = await studentService.getStudentAttendance(id, {
      startDate,
      endDate,
    });

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      res.status(404).json({
        success: false,
        message: "Student not found",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error fetching attendance",
      });
    }
  }
});

// @desc    Get student grades
// @route   GET /api/students/:id/grades
// @access  Private (Teachers, Admins, Student can access own grades)
const getStudentGrades = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check authorization
    const student = await studentService.getStudentById(id);
    if (
      req.user.role !== "admin" &&
      req.user.role !== "teacher" &&
      student.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this student's grades",
      });
    }

    const grades = await studentService.getStudentGrades(id);

    res.json({
      success: true,
      data: grades,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      res.status(404).json({
        success: false,
        message: "Student not found",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error fetching grades",
      });
    }
  }
});

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentAttendance,
  getStudentGrades,
};
