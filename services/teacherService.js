const Teacher = require("../models/Teacher");
const User = require("../models/User");
const { ApiError } = require("../utils/errorHandler");

// Get all teachers with pagination and filtering
const getTeachers = async ({ page = 1, limit = 10, department }) => {
  const skip = (page - 1) * limit;
  const filter = { isActive: true };

  if (department) filter.department = department;

  const teachers = await Teacher.find(filter)
    .populate("user", "name email role")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Teacher.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  return {
    teachers,
    total,
    page: parseInt(page),
    totalPages,
  };
};

// Get teacher by ID
const getTeacherById = async (id) => {
  const teacher = await Teacher.findOne({ _id: id, isActive: true }).populate(
    "user",
    "name email role"
  );

  if (!teacher) {
    throw new ApiError("Teacher not found", 404);
  }

  return teacher;
};

// Create new teacher
const createTeacher = async (teacherData) => {
  const {
    name,
    email,
    password,
    department,
    qualification,
    experience,
    dateOfBirth,
    gender,
    ...otherFields
  } = teacherData;

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
    role: "teacher",
  });

  // Create teacher profile
  const teacher = await Teacher.create({
    user: user._id,
    department,
    qualification,
    experience: experience || 0,
    dateOfBirth,
    gender,
    ...otherFields,
  });

  return teacher.populate("user", "name email role");
};

// Update teacher
const updateTeacher = async (id, updateData, currentUser) => {
  const teacher = await Teacher.findById(id);

  if (!teacher) {
    throw new ApiError("Teacher not found", 404);
  }

  // Check authorization
  if (
    currentUser.role !== "admin" &&
    teacher.user.toString() !== currentUser.id
  ) {
    throw new ApiError("Not authorized to update this teacher", 403);
  }

  // Update teacher
  const updatedTeacher = await Teacher.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("user", "name email role");

  return updatedTeacher;
};

// Delete teacher (soft delete)
const deleteTeacher = async (id, currentUser) => {
  if (currentUser.role !== "admin") {
    throw new ApiError("Not authorized to delete teachers", 403);
  }

  const teacher = await Teacher.findById(id);
  if (!teacher) {
    throw new ApiError("Teacher not found", 404);
  }

  // Soft delete teacher
  teacher.isActive = false;
  await teacher.save();

  // Soft delete user
  await User.findByIdAndUpdate(teacher.user, { isActive: false });

  return { message: "Teacher deleted successfully" };
};

// Get teachers by department
const getTeachersByDepartment = async (
  department,
  { page = 1, limit = 10 }
) => {
  const skip = (page - 1) * limit;

  const teachers = await Teacher.find({
    department,
    isActive: true,
  })
    .populate("user", "name email role")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Teacher.countDocuments({
    department,
    isActive: true,
  });
  const totalPages = Math.ceil(total / limit);

  return {
    department,
    teachers,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
  };
};

// Get teacher statistics
const getTeacherStats = async () => {
  const totalTeachers = await Teacher.countDocuments({ isActive: true });
  const totalDepartments = await Teacher.distinct("department", {
    isActive: true,
  });

  const departmentStats = await Teacher.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$department",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const experienceStats = await Teacher.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        avgExperience: { $avg: "$experience" },
        maxExperience: { $max: "$experience" },
        minExperience: { $min: "$experience" },
      },
    },
  ]);

  return {
    totalTeachers,
    totalDepartments: totalDepartments.length,
    departmentStats,
    experienceStats: experienceStats[0] || {
      avgExperience: 0,
      maxExperience: 0,
      minExperience: 0,
    },
  };
};

module.exports = {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeachersByDepartment,
  getTeacherStats,
};
