const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const dotenv = require("dotenv");

// Load test environment variables
dotenv.config({ path: ".env.test" });

let mongoServer;

// Global test utilities
global.testUtils = {
  // Generate test user data
  generateTestUser: (role = "student") => ({
    name: "Test User",
    email: `test-${Date.now()}@example.com`,
    password: "password123",
    role,
    grade: role === "student" ? "10th" : undefined,
    section: role === "student" ? "A" : undefined,
    department: role === "teacher" ? "Mathematics" : undefined,
    qualification: role === "teacher" ? "Masters" : undefined,
    dateOfBirth: "1990-01-01",
    gender: "other",
  }),

  // Generate test student data
  generateTestStudent: () => ({
    name: "Test Student",
    email: `student-${Date.now()}@example.com`,
    password: "password123",
    role: "student",
    grade: "10th",
    section: "A",
    dateOfBirth: "2005-05-15",
    gender: "male",
    contactNumber: "+1234567890",
    address: {
      street: "123 Test St",
      city: "Test City",
      state: "Test State",
      zipCode: "12345",
      country: "Test Country",
    },
  }),

  // Generate test teacher data
  generateTestTeacher: () => ({
    name: "Test Teacher",
    email: `teacher-${Date.now()}@example.com`,
    password: "password123",
    role: "teacher",
    department: "Mathematics",
    qualification: "Masters",
    experience: 5,
    specialization: ["Algebra", "Calculus"],
    dateOfBirth: "1985-03-20",
    gender: "female",
    contactNumber: "+1234567890",
    salary: 50000,
  }),

  // Generate admin user data
  generateAdminUser: () => ({
    name: "Admin User",
    email: `admin-${Date.now()}@example.com`,
    password: "password123",
    role: "admin",
  }),

  // Wait for a specified time (useful for async operations)
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Create a valid JWT token for testing
  createTestToken: (userId, role) => {
    const jwt = require("jsonwebtoken");
    const config = require("../config");
    return jwt.sign({ id: userId, role }, config.JWT_SECRET, {
      expiresIn: "1h",
    });
  },

  // Database connection utilities
  connectTestDB: async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to test database");
    return mongoServer;
  },

  disconnectTestDB: async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log("Disconnected from test database");
  },

  clearCollections: async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  },
};

// Export for use in other files
module.exports = {
  testUtils: global.testUtils,
  connectTestDB: global.testUtils.connectTestDB,
  disconnectTestDB: global.testUtils.disconnectTestDB,
  clearCollections: global.testUtils.clearCollections,
};
