const { expect } = require("chai");
const request = require("supertest");
const sinon = require("sinon");
const app = require("../server");
const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

// Import test utilities and setup
const {
  connectTestDB,
  disconnectTestDB,
  clearCollections,
} = require("../test/testSetup");

describe("Authentication Endpoints", () => {
  let sandbox;

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
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("POST /api/auth/signup", () => {
    it("should register a new student successfully", async () => {
      const studentData = testUtils.generateTestStudent();

      const response = await request(app)
        .post("/api/auth/signup")
        .send(studentData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal("User registered successfully");
      expect(response.body.user.name).to.equal(studentData.name);
      expect(response.body.user.email).to.equal(studentData.email);
      expect(response.body.user.role).to.equal("student");
      expect(response.body.token).to.exist;

      // Verify user was created in database
      const user = await User.findOne({ email: studentData.email });
      expect(user).to.exist;
      expect(user.role).to.equal("student");

      // Verify student profile was created
      const student = await Student.findOne({ user: user._id });
      expect(student).to.exist;
      expect(student.grade).to.equal(studentData.grade);
      expect(student.section).to.equal(studentData.section);
    });

    it("should register a new teacher successfully", async () => {
      const teacherData = testUtils.generateTestTeacher();

      const response = await request(app)
        .post("/api/auth/signup")
        .send(teacherData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.user.role).to.equal("teacher");

      // Verify teacher profile was created
      const user = await User.findOne({ email: teacherData.email });
      const teacher = await Teacher.findOne({ user: user._id });
      expect(teacher).to.exist;
      expect(teacher.department).to.equal(teacherData.department);
    });

    it("should return error for duplicate email", async () => {
      const userData = testUtils.generateTestUser("student");

      // Create first user
      await request(app).post("/api/auth/signup").send(userData).expect(201);

      // Try to create second user with same email
      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal(
        "User already exists with this email"
      );
    });

    it("should return error for invalid email format", async () => {
      const userData = {
        ...testUtils.generateTestUser("student"),
        email: "invalid-email",
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.exist;
      expect(response.body.errors[0].field).to.equal("email");
    });

    it("should return error for short password", async () => {
      const userData = {
        ...testUtils.generateTestUser("student"),
        password: "123",
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors[0].field).to.equal("password");
    });

    it("should return error for invalid role", async () => {
      const userData = {
        ...testUtils.generateTestUser("student"),
        role: "invalid-role",
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors[0].field).to.equal("role");
    });

    it("should hash password before saving", async () => {
      const userData = testUtils.generateTestUser("student");

      await request(app).post("/api/auth/signup").send(userData).expect(201);

      const user = await User.findOne({ email: userData.email }).select(
        "+password"
      );
      expect(user.password).to.not.equal(userData.password);
      expect(user.password).to.include("$2a$"); // bcrypt hash format
    });
  });

  describe("POST /api/auth/login", () => {
    let testUser;

    beforeEach(async () => {
      const userData = testUtils.generateTestUser("student");
      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData);
      testUser = response.body.user;
    });

    it("should login successfully with valid credentials", async () => {
      const loginData = {
        email: testUser.email,
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal("Login successful");
      expect(response.body.token).to.exist;
      expect(response.body.user.email).to.equal(loginData.email);
    });

    it("should return error for invalid email", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal("Invalid credentials");
    });

    it("should return error for invalid password", async () => {
      const loginData = {
        email: testUser.email,
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal("Invalid credentials");
    });

    it("should return error for deactivated account", async () => {
      // Deactivate the user
      await User.findByIdAndUpdate(testUser.id, { isActive: false });

      const loginData = {
        email: testUser.email,
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(403);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal("Account is deactivated");
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    let testUser;

    beforeEach(async () => {
      const userData = testUtils.generateTestUser("student");
      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData);
      testUser = response.body.user;
    });

    it("should generate reset token for existing user", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal("Password reset token generated");
      expect(response.body.resetToken).to.exist;

      // Verify token was saved in database
      const user = await User.findById(testUser.id);
      expect(user.resetPasswordToken).to.exist;
      expect(user.resetPasswordExpire).to.exist;
    });

    it("should return error for non-existent user", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent@example.com" })
        .expect(404);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal("User not found with this email");
    });

    it("should return error for invalid email format", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "invalid-email" })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.exist;
    });
  });

  describe("POST /api/auth/reset-password/:resetToken", () => {
    let testUser;
    let resetToken;

    beforeEach(async () => {
      const userData = testUtils.generateTestUser("student");
      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData);
      testUser = response.body.user;

      // Generate reset token
      const forgotResponse = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: testUser.email });
      resetToken = forgotResponse.body.resetToken;
    });

    it("should reset password with valid token", async () => {
      const newPassword = "newpassword123";

      const response = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({ password: newPassword })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal("Password reset successful");

      // Verify password was changed
      const user = await User.findById(testUser.id).select("+password");
      const bcrypt = require("bcryptjs");
      const isMatch = await bcrypt.compare(newPassword, user.password);
      expect(isMatch).to.be.true;

      // Verify token was cleared
      expect(user.resetPasswordToken).to.be.undefined;
      expect(user.resetPasswordExpire).to.be.undefined;
    });

    it("should return error for invalid token", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password/invalid-token")
        .send({ password: "newpassword123" })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal("Invalid or expired reset token");
    });

    it("should return error for expired token", async () => {
      // Manually expire the token
      await User.findByIdAndUpdate(testUser.id, {
        resetPasswordExpire: new Date(Date.now() - 1000), // 1 second ago
      });

      const response = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({ password: "newpassword123" })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal("Invalid or expired reset token");
    });

    it("should return error for short password", async () => {
      const response = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({ password: "123" })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.exist;
    });
  });

  describe("PUT /api/auth/change-password", () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      const userData = testUtils.generateTestUser("student");
      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData);
      testUser = response.body.user;
      authToken = response.body.token;
    });

    it("should change password with valid current password", async () => {
      const newPassword = "newpassword123";

      const response = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: "password123",
          newPassword: newPassword,
        })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal("Password changed successfully");

      // Verify password was changed
      const user = await User.findById(testUser.id).select("+password");
      const bcrypt = require("bcryptjs");
      const isMatch = await bcrypt.compare(newPassword, user.password);
      expect(isMatch).to.be.true;
    });

    it("should return error for incorrect current password", async () => {
      const response = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: "wrongpassword",
          newPassword: "newpassword123",
        })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal("Current password is incorrect");
    });

    it("should return error for short new password", async () => {
      const response = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: "password123",
          newPassword: "123",
        })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.errors).to.exist;
    });

    it("should return error without authentication", async () => {
      const response = await request(app)
        .put("/api/auth/change-password")
        .send({
          currentPassword: "password123",
          newPassword: "newpassword123",
        })
        .expect(401);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal(
        "Not authorized to access this route"
      );
    });
  });

  describe("GET /api/auth/me", () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      const userData = testUtils.generateTestUser("student");
      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData);
      testUser = response.body.user;
      authToken = response.body.token;
    });

    it("should return user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.user.id).to.equal(testUser.id);
      expect(response.body.user.name).to.equal(testUser.name);
      expect(response.body.user.email).to.equal(testUser.email);
      expect(response.body.user.role).to.equal(testUser.role);
    });

    it("should return error without token", async () => {
      const response = await request(app).get("/api/auth/me").expect(401);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal(
        "Not authorized to access this route"
      );
    });

    it("should return error with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal(
        "Not authorized to access this route"
      );
    });

    it("should return error with expired token", async () => {
      // Create an expired token
      const expiredToken = testUtils.createTestToken(
        testUser.id,
        testUser.role
      );

      // Mock JWT verification to simulate expired token
      sandbox
        .stub(require("jsonwebtoken"), "verify")
        .throws(new Error("jwt expired"));

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).to.be.false;
    });
  });

  describe("POST /api/auth/logout", () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      const userData = testUtils.generateTestUser("student");
      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData);
      testUser = response.body.user;
      authToken = response.body.token;
    });

    it("should logout successfully", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal("Logged out successfully");
    });

    it("should return error without authentication", async () => {
      const response = await request(app).post("/api/auth/logout").expect(401);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.equal(
        "Not authorized to access this route"
      );
    });
  });
});
