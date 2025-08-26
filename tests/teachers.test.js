const { expect } = require("chai");
const request = require("supertest");
const sinon = require("sinon");
const app = require("../server");
const User = require("../models/User");
const Teacher = require("../models/Teacher");

// Import test utilities and setup
const {
  connectTestDB,
  disconnectTestDB,
  clearCollections,
} = require("../test/testSetup");

describe("Teacher Endpoints", () => {
  let sandbox;
  let adminUser;
  let adminToken;
  let teacherUser;
  let teacherToken;
  let testTeacher;

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

    // Get the teacher profile
    testTeacher = await Teacher.findOne({ user: teacherUser.id });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("GET /api/teachers", () => {
    it("should get all teachers with pagination for admin", async () => {
      const response = await request(app)
        .get("/api/teachers")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an("array");
      expect(response.body.total).to.be.a("number");
      expect(response.body.page).to.equal(1);
      expect(response.body.totalPages).to.be.a("number");
    });

    it("should filter teachers by department", async () => {
      const response = await request(app)
        .get("/api/teachers?department=Mathematics")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an("array");
      response.body.data.forEach((teacher) => {
        expect(teacher.department).to.equal("Mathematics");
      });
    });

    it("should deny access to non-admin users", async () => {
      const response = await request(app)
        .get("/api/teachers")
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(403);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include("not authorized");
    });

    it("should return error without authentication", async () => {
      const response = await request(app).get("/api/teachers").expect(401);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include("Not authorized");
    });

    it("should validate query parameters", async () => {
      const response = await request(app)
        .get("/api/teachers?page=0&limit=200")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.exist;
    });
  });

  describe("GET /api/teachers/:id", () => {
    it("should get teacher by ID for admin", async () => {
      const response = await request(app)
        .get(`/api/teachers/${testTeacher._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data._id).to.equal(testTeacher._id.toString());
      expect(response.body.data.user.name).to.equal(teacherUser.name);
      expect(response.body.data.department).to.equal(testTeacher.department);
    });

    it("should allow teacher to access own profile", async () => {
      const response = await request(app)
        .get(`/api/teachers/${testTeacher._id}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
    });

    it("should deny access to other teachers", async () => {
      // Create another teacher
      const anotherTeacherData = testUtils.generateTestTeacher();
      const anotherTeacherResponse = await request(app)
        .post("/api/auth/signup")
        .send(anotherTeacherData);
      const anotherTeacher = await Teacher.findOne({
        user: anotherTeacherResponse.body.user.id,
      });

      const response = await request(app)
        .get(`/api/teachers/${anotherTeacher._id}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(403);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include("Not authorized");
    });

    it("should return 404 for non-existent teacher", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/api/teachers/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal("Teacher not found");
    });

    it("should return error for invalid ID format", async () => {
      const response = await request(app)
        .get("/api/teachers/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.exist;
    });
  });

  describe("POST /api/teachers", () => {
    it("should create new teacher for admin", async () => {
      const newTeacherData = testUtils.generateTestTeacher();

      const response = await request(app)
        .post("/api/teachers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newTeacherData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal("Teacher created successfully");
      expect(response.body.data.user.name).to.equal(newTeacherData.name);
      expect(response.body.data.department).to.equal(newTeacherData.department);
      expect(response.body.data.qualification).to.equal(
        newTeacherData.qualification
      );
    });

    it("should deny creation for non-admin users", async () => {
      const newTeacherData = testUtils.generateTestTeacher();

      const response = await request(app)
        .post("/api/teachers")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(newTeacherData)
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
        .post("/api/teachers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.exist;
    });

    it("should validate department values", async () => {
      const invalidData = {
        ...testUtils.generateTestTeacher(),
        department: "InvalidDepartment",
      };

      const response = await request(app)
        .post("/api/teachers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors[0].field).to.equal("department");
    });

    it("should validate qualification values", async () => {
      const invalidData = {
        ...testUtils.generateTestTeacher(),
        qualification: "InvalidQualification",
      };

      const response = await request(app)
        .post("/api/teachers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors[0].field).to.equal("qualification");
    });

    it("should validate experience as non-negative", async () => {
      const invalidData = {
        ...testUtils.generateTestTeacher(),
        experience: -5,
      };

      const response = await request(app)
        .post("/api/teachers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.exist;
    });

    it("should validate salary as non-negative", async () => {
      const invalidData = {
        ...testUtils.generateTestTeacher(),
        salary: -1000,
      };

      const response = await request(app)
        .post("/api/teachers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.exist;
    });
  });

  describe("PUT /api/teachers/:id", () => {
    it("should update teacher for admin", async () => {
      const updateData = {
        department: "Science",
        qualification: "PhD",
        experience: 10,
      };

      const response = await request(app)
        .put(`/api/teachers/${testTeacher._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal("Teacher updated successfully");
      expect(response.body.data.department).to.equal("Science");
      expect(response.body.data.qualification).to.equal("PhD");
      expect(response.body.data.experience).to.equal(10);
    });

    it("should allow teacher to update own profile", async () => {
      const updateData = {
        contactNumber: "+9876543210",
        specialization: ["Calculus", "Statistics"],
      };

      const response = await request(app)
        .put(`/api/teachers/${testTeacher._id}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).to.be.true;
    });

    it("should deny update for unauthorized users", async () => {
      // Create another teacher
      const anotherTeacherData = testUtils.generateTestTeacher();
      const anotherTeacherResponse = await request(app)
        .post("/api/auth/signup")
        .send(anotherTeacherData);
      const anotherTeacher = await Teacher.findOne({
        user: anotherTeacherResponse.body.user.id,
      });

      const updateData = { department: "Science" };

      const response = await request(app)
        .put(`/api/teachers/${anotherTeacher._id}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include("Not authorized");
    });

    it("should validate update data", async () => {
      const invalidData = {
        department: "InvalidDepartment",
      };

      const response = await request(app)
        .put(`/api/teachers/${testTeacher._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.exist;
    });
  });

  describe("DELETE /api/teachers/:id", () => {
    it("should delete teacher for admin (soft delete)", async () => {
      const response = await request(app)
        .delete(`/api/teachers/${testTeacher._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal("Teacher deleted successfully");

      // Verify soft delete
      const deletedTeacher = await Teacher.findById(testTeacher._id);
      expect(deletedTeacher.isActive).to.be.false;

      const deletedUser = await User.findById(teacherUser.id);
      expect(deletedUser.isActive).to.be.false;
    });

    it("should deny deletion for non-admin users", async () => {
      const response = await request(app)
        .delete(`/api/teachers/${testTeacher._id}`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(403);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include("not authorized");
    });

    it("should return 404 for non-existent teacher", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .delete(`/api/teachers/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal("Teacher not found");
    });
  });

  describe("GET /api/teachers/department/:department", () => {
    it("should get teachers by department for admin", async () => {
      const response = await request(app)
        .get("/api/teachers/department/Mathematics")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.department).to.equal("Mathematics");
      expect(response.body.teachers).to.be.an("array");
      expect(response.body.total).to.be.a("number");
    });

    it("should filter by department correctly", async () => {
      const response = await request(app)
        .get("/api/teachers/department/Mathematics")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      response.body.teachers.forEach((teacher) => {
        expect(teacher.department).to.equal("Mathematics");
      });
    });

    it("should deny access to non-admin users", async () => {
      const response = await request(app)
        .get("/api/teachers/department/Mathematics")
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(403);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include("not authorized");
    });

    it("should validate department parameter", async () => {
      const response = await request(app)
        .get("/api/teachers/department/InvalidDepartment")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.exist;
    });

    it("should handle pagination for department teachers", async () => {
      const response = await request(app)
        .get("/api/teachers/department/Mathematics?page=1&limit=5")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.page).to.equal(1);
      expect(response.body.limit).to.equal(5);
      expect(response.body.totalPages).to.be.a("number");
    });
  });

  describe("GET /api/teachers/stats/overview", () => {
    it("should get teacher statistics for admin", async () => {
      const response = await request(app)
        .get("/api/teachers/stats/overview")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.exist;
      expect(response.body.data.totalTeachers).to.be.a("number");
      expect(response.body.data.totalDepartments).to.be.a("number");
      expect(response.body.data.departmentStats).to.be.an("array");
      expect(response.body.data.experienceStats).to.exist;
    });

    it("should include department statistics", async () => {
      const response = await request(app)
        .get("/api/teachers/stats/overview")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      const stats = response.body.data;
      expect(stats.departmentStats).to.be.an("array");

      if (stats.departmentStats.length > 0) {
        stats.departmentStats.forEach((dept) => {
          expect(dept._id).to.be.a("string");
          expect(dept.count).to.be.a("number");
        });
      }
    });

    it("should include experience statistics", async () => {
      const response = await request(app)
        .get("/api/teachers/stats/overview")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      const stats = response.body.data.experienceStats;
      expect(stats.avgExperience).to.be.a("number");
      expect(stats.maxExperience).to.be.a("number");
      expect(stats.minExperience).to.be.a("number");
    });

    it("should deny access to non-admin users", async () => {
      const response = await request(app)
        .get("/api/teachers/stats/overview")
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(403);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include("not authorized");
    });

    it("should return error without authentication", async () => {
      const response = await request(app)
        .get("/api/teachers/stats/overview")
        .expect(401);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include("Not authorized");
    });
  });

  describe("Error Handling", () => {
    it("should handle database connection errors gracefully", async () => {
      // Mock database error
      sandbox
        .stub(Teacher, "find")
        .throws(new Error("Database connection failed"));

      const response = await request(app)
        .get("/api/teachers")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(500);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal("Error fetching teachers");
    });

    it("should handle validation errors properly", async () => {
      const invalidData = {
        name: "", // Empty name
        email: "invalid-email",
        department: "InvalidDepartment",
      };

      const response = await request(app)
        .post("/api/teachers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.be.an("array");
      expect(response.body.errors.length).to.be.greaterThan(0);
    });

    it("should handle aggregation errors gracefully", async () => {
      // Mock aggregation error
      sandbox
        .stub(Teacher, "aggregate")
        .throws(new Error("Aggregation failed"));

      const response = await request(app)
        .get("/api/teachers/stats/overview")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(500);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal(
        "Error fetching teacher statistics"
      );
    });
  });
});
