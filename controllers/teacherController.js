const teacherService = require("../services/teacherService");
const { asyncHandler } = require("../utils/errorHandler");

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private (Admins only)
const getTeachers = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, department } = req.query;
    const result = await teacherService.getTeachers({
      page,
      limit,
      department,
    });

    res.json({
      success: true,
      data: result.teachers,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching teachers",
    });
  }
});

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private (Admins, Teacher can access own profile)
const getTeacher = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await teacherService.getTeacherById(id);

    // Check authorization
    if (
      req.user.role !== "admin" &&
      teacher.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this teacher profile",
      });
    }

    res.json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error fetching teacher",
      });
    }
  }
});

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Private (Admins only)
const createTeacher = asyncHandler(async (req, res) => {
  try {
    const teacher = await teacherService.createTeacher(req.body);

    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: teacher,
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
        message: "Error creating teacher",
      });
    }
  }
});

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admins, Teacher can update own profile)
const updateTeacher = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const teacher = await teacherService.updateTeacher(
      id,
      updateData,
      req.user
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.json({
      success: true,
      message: "Teacher updated successfully",
      data: teacher,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    } else if (error.statusCode === 403) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error updating teacher",
      });
    }
  }
});

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admins only)
const deleteTeacher = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const result = await teacherService.deleteTeacher(id, req.user);

    res.json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    if (error.statusCode === 404) {
      res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    } else if (error.statusCode === 403) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error deleting teacher",
      });
    }
  }
});

// @desc    Get teachers by department
// @route   GET /api/teachers/department/:department
// @access  Private (Admins only)
const getTeachersByDepartment = asyncHandler(async (req, res) => {
  try {
    const { department } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await teacherService.getTeachersByDepartment(department, {
      page,
      limit,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching teachers by department",
    });
  }
});

// @desc    Get teacher statistics
// @route   GET /api/teachers/stats/overview
// @access  Private (Admins only)
const getTeacherStats = asyncHandler(async (req, res) => {
  try {
    const stats = await teacherService.getTeacherStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching teacher statistics",
    });
  }
});

module.exports = {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeachersByDepartment,
  getTeacherStats,
};
