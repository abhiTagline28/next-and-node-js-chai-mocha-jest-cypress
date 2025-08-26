const { expect } = require("chai");
const request = require("supertest");
const sinon = require("sinon");
const app = require("../server");
const User = require("../models/User");
const Student = require("../models/Student");

// Import test utilities and setup
const {
  connectTestDB,
  disconnectTestDB,
  clearCollections,
} = require("../test/testSetup");

describe("Student Endpoints", () => {
  let sandbox;
  let adminUser;
  let adminToken;
  let teacherUser;
  let teacherToken;
  let studentUser;
  let studentToken;
  let testStudent;

  // Setup database connection before all tests
  before(async () => {
    await connectTestDB();
  });

  // Cleanup database connection after all tests
  after(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    await clearCollections();

    // Create admin user
    const adminData = testUtils.generateAdminUser();
    const adminResponse = await request(app)
      .post("/api/auth/signup")
      .send(adminData);
    adminUser = adminResponse.body.user;
    adminToken = adminResponse.body.token;

    // Create teacher user
    const teacherData = testUtils.generateTestTeacher();
    const teacherResponse = await request(app)
      .post("/api/auth/signup")
      .send(teacherData);
    teacherUser = teacherResponse.body.user;
    teacherToken = teacherResponse.body.token;

    // Create student user
    const studentData = testUtils.generateTestStudent();
    const studentResponse = await request(app)
      .post("/api/auth/signup")
      .send(studentData);
    studentUser = studentResponse.body.user;
    studentToken = studentResponse.body.token;

    // Get the student profile
    testStudent = await Student.findOne({ user: studentUser.id });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("GET /api/students", () => {
    it("should get all students with pagination", async () => {
      const response = await request(app)
        .get("/api/students")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an("array");
      expect(response.body.total).to.be.a("number");
      expect(response.body.page).to.equal(1);
      expect(response.body.totalPages).to.be.a("number");
    });

    it("should filter students by grade", async () => {
      const response = await request(app)
        .get("/api/students?grade=10th")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an("array");
      response.body.data.forEach((student) => {
        expect(student.grade).to.equal("10th");
      });
    });

    it("should filter students by section", async () => {
      const response = await request(app)
        .get("/api/students?section=A")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an("array");
      response.body.data.forEach((student) => {
        expect(student.section).to.equal("A");
      });
    });

    it("should allow teachers to access student list", async () => {
      const response = await request(app)
        .get("/api/students")
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
    });

    it("should deny access to students", async () => {
      const response = await request(app)
        .get("/api/students")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(403);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include("not authorized");
    });

    it("should return error without authentication", async () => {
      const response = await request(app).get("/api/students").expect(401);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include("Not authorized");
    });
  });

  describe("GET /api/students/:id", () => {
    it("should get student by ID for admin", async () => {
      const response = await request(app)
        .get(`/api/students/${testStudent._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data._id).to.equal(testStudent._id.toString());
      expect(response.body.data.user.name).to.equal(studentUser.name);
    });

    it("should get student by ID for teacher", async () => {
      const response = await request(app)
        .get(`/api/students/${testStudent._id}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
    });

    it("should allow student to access own profile", async () => {
      const response = await request(app)
        .get(`/api/students/${testStudent._id}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
    });

    it("should deny access to other students", async () => {
      // Create another student
      const anotherStudentData = testUtils.generateTestStudent();
      const anotherStudentResponse = await request(app)
        .post("/api/auth/signup")
        .send(anotherStudentData);
      const anotherStudent = await Student.findOne({
        user: anotherStudentResponse.body.user.id,
      });

      const response = await request(app)
        .get(`/api/students/${anotherStudent._id}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(403);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include("Not authorized");
    });

    it("should return 404 for non-existent student", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/api/students/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal("Student not found");
    });

    it("should return error for invalid ID format", async () => {
      const response = await request(app)
        .get("/api/students/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.exist;
    });
  });

  describe("POST /api/students", () => {
    it("should create new student for admin", async () => {
      const newStudentData = testUtils.generateTestStudent();

      const response = await request(app)
        .post("/api/students")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newStudentData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal("Student created successfully");
      expect(response.body.data.user.name).to.equal(newStudentData.name);
      expect(response.body.data.grade).to.equal(newStudentData.grade);
    });

    it("should deny creation for non-admin users", async () => {
      const newStudentData = testUtils.generateTestStudent();

      const response = await request(app)
        .post("/api/students")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(newStudentData)
        .expect(403);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include("not authorized");
    });

    it("should validate required fields", async () => {
      const invalidData = {
        name: "Test",
        email: "test@example.com",
        // Missing required fields
      };

      const response = await request(app)
        .post("/api/students")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.exist;
    });

    it("should validate email format", async () => {
      const invalidData = {
        ...testUtils.generateTestStudent(),
        email: "invalid-email",
      };

      const response = await request(app)
        .post("/api/students")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors[0].field).to.equal("email");
    });

    it("should validate grade values", async () => {
      const invalidData = {
        ...testUtils.generateTestStudent(),
        grade: "13th", // Invalid grade
      };

      const response = await request(app)
        .post("/api/students")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors[0].field).to.equal("grade");
    });
  });

  describe("PUT /api/students/:id", () => {
    it("should update student for admin", async () => {
      const updateData = {
        grade: "11th",
        section: "B",
      };

      const response = await request(app)
        .put(`/api/students/${testStudent._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal("Student updated successfully");
      expect(response.body.data.grade).to.equal("11th");
      expect(response.body.data.section).to.equal("B");
    });

    it("should update student for teacher", async () => {
      const updateData = {
        grade: "12th",
      };

      const response = await request(app)
        .put(`/api/students/${testStudent._id}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).to.be.true;
    });

    it("should allow student to update own profile", async () => {
      const updateData = {
        contactNumber: "+9876543210",
      };

      const response = await request(app)
        .put(`/api/students/${testStudent._id}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).to.be.true;
    });

    it("should deny update for unauthorized users", async () => {
      // Create another student
      const anotherStudentData = testUtils.generateTestStudent();
      const anotherStudentResponse = await request(app)
        .post("/api/auth/signup")
        .send(anotherStudentData);
      const anotherStudent = await Student.findOne({
        user: anotherStudentResponse.body.user.id,
      });

      const updateData = { grade: "11th" };

      const response = await request(app)
        .put(`/api/students/${anotherStudent._id}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include("Not authorized");
    });

    it("should validate update data", async () => {
      const invalidData = {
        grade: "13th", // Invalid grade
      };

      const response = await request(app)
        .put(`/api/students/${testStudent._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.exist;
    });
  });

  describe("DELETE /api/students/:id", () => {
    it("should delete student for admin (soft delete)", async () => {
      const response = await request(app)
        .delete(`/api/students/${testStudent._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal("Student deleted successfully");

      // Verify soft delete
      const deletedStudent = await Student.findById(testStudent._id);
      expect(deletedStudent.isActive).to.be.false;

      const deletedUser = await User.findById(studentUser.id);
      expect(deletedUser.isActive).to.be.false;
    });

    it("should deny deletion for non-admin users", async () => {
      const response = await request(app)
        .delete(`/api/students/${testStudent._id}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(403);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include("not authorized");
    });

    it("should return 404 for non-existent student", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .delete(`/api/students/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal("Student not found");
    });
  });

  describe("GET /api/students/:id/attendance", () => {
    it("should get student attendance for admin", async () => {
      const response = await request(app)
        .get(`/api/students/${testStudent._id}/attendance`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.studentId).to.equal(testStudent.studentId);
      expect(response.body.data.attendance).to.be.an("array");
    });

    it("should get student attendance for teacher", async () => {
      const response = await request(app)
        .get(`/api/students/${testStudent._id}/attendance`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
    });

    it("should allow student to access own attendance", async () => {
      const response = await request(app)
        .get(`/api/students/${testStudent._id}/attendance`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
    });

    it("should filter attendance by date range", async () => {
      const startDate = "2024-01-01";
      const endDate = "2024-12-31";

      const response = await request(app)
        .get(
          `/api/students/${testStudent._id}/attendance?startDate=${startDate}&endDate=${endDate}`
        )
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
    });

    it("should validate date format", async () => {
      const response = await request(app)
        .get(
          `/api/students/${testStudent._id}/attendance?startDate=invalid-date`
        )
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.exist;
    });
  });

  describe("GET /api/students/:id/grades", () => {
    it("should get student grades for admin", async () => {
      const response = await request(app)
        .get(`/api/students/${testStudent._id}/grades`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.studentId).to.equal(testStudent.studentId);
      expect(response.body.data.grades).to.be.an("array");
    });

    it("should get student grades for teacher", async () => {
      const response = await request(app)
        .get(`/api/students/${testStudent._id}/grades`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
    });

    it("should allow student to access own grades", async () => {
      const response = await request(app)
        .get(`/api/students/${testStudent._id}/grades`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
    });
  });

  describe("Error Handling", () => {
    it("should handle database connection errors gracefully", async () => {
      // Mock database error
      sandbox
        .stub(Student, "find")
        .throws(new Error("Database connection failed"));

      const response = await request(app)
        .get("/api/students")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(500);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal("Error fetching students");
    });

    it("should handle validation errors properly", async () => {
      const invalidData = {
        name: "", // Empty name
        email: "invalid-email",
        grade: "13th",
      };

      const response = await request(app)
        .post("/api/students")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.be.an("array");
      expect(response.body.errors.length).to.be.greaterThan(0);
    });
  });
});
