const Student = require("../models/Student");
const User = require("../models/User");
const { ApiError } = require("../utils/errorHandler");

// Get all students with pagination and filtering
const getStudents = async ({ page = 1, limit = 10, grade, section }) => {
  const skip = (page - 1) * limit;
  const filter = { isActive: true };

  if (grade) filter.grade = grade;
  if (section) filter.section = section;

  const students = await Student.find(filter)
    .populate("user", "name email role")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Student.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  return {
    students,
    total,
    page: parseInt(page),
    totalPages,
  };
};

// Get student by ID
const getStudentById = async (id) => {
  const student = await Student.findOne({ _id: id, isActive: true }).populate(
    "user",
    "name email role"
  );

  if (!student) {
    throw new ApiError("Student not found", 404);
  }

  return student;
};

// Create new student
const createStudent = async (studentData) => {
  const {
    name,
    email,
    password,
    grade,
    section,
    dateOfBirth,
    gender,
    ...otherFields
  } = studentData;

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
    role: "student",
  });

  // Create student profile
  const student = await Student.create({
    user: user._id,
    grade,
    section,
    dateOfBirth,
    gender,
    ...otherFields,
  });

  return student.populate("user", "name email role");
};

// Update student
const updateStudent = async (id, updateData, currentUser) => {
  const student = await Student.findById(id);

  if (!student) {
    throw new ApiError("Student not found", 404);
  }

  // Check authorization
  if (
    currentUser.role !== "admin" &&
    currentUser.role !== "teacher" &&
    student.user.toString() !== currentUser.id
  ) {
    throw new ApiError("Not authorized to update this student", 403);
  }

  // Update student
  const updatedStudent = await Student.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("user", "name email role");

  return updatedStudent;
};

// Delete student (soft delete)
const deleteStudent = async (id, currentUser) => {
  if (currentUser.role !== "admin") {
    throw new ApiError("Not authorized to delete students", 403);
  }

  const student = await Student.findById(id);
  if (!student) {
    throw new ApiError("Student not found", 404);
  }

  // Soft delete student
  student.isActive = false;
  await student.save();

  // Soft delete user
  await User.findByIdAndUpdate(student.user, { isActive: false });

  return { message: "Student deleted successfully" };
};

// Get student attendance
const getStudentAttendance = async (id, { startDate, endDate }) => {
  const student = await Student.findById(id);
  if (!student) {
    throw new ApiError("Student not found", 404);
  }

  let attendance = student.attendance;

  if (startDate && endDate) {
    attendance = attendance.filter(
      (record) =>
        record.date >= new Date(startDate) && record.date <= new Date(endDate)
    );
  }

  return {
    studentId: student.studentId,
    attendance,
  };
};

// Get student grades
const getStudentGrades = async (id) => {
  const student = await Student.findById(id);
  if (!student) {
    throw new ApiError("Student not found", 404);
  }

  return {
    studentId: student.studentId,
    grades: student.grades,
  };
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentAttendance,
  getStudentGrades,
};
