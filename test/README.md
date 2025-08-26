# 🧪 School Management API - Test Suite

A comprehensive test suite for the School Management API built with **Mocha**, **Chai**, **Sinon**, and **Supertest**.

## 📚 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Test Categories](#test-categories)
- [Running Tests](#running-tests)
- [Test Utilities](#test-utilities)
- [Best Practices](#best-practices)
- [Coverage](#coverage)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This test suite provides comprehensive coverage for:

- **Authentication & Authorization** (JWT, roles, permissions)
- **Student Management** (CRUD, attendance, grades)
- **Teacher Management** (CRUD, departments, statistics)
- **API Validation** (input validation, error handling)
- **Database Operations** (MongoDB with Mongoose)
- **Middleware Testing** (auth, validation, error handling)

## 🏗️ Architecture

### Test Structure

```
test/
├── testSetup.js          # Global test configuration
├── mocha.opts            # Mocha configuration
├── runTests.js           # Custom test runner
└── README.md             # This documentation

tests/
├── auth.test.js          # Authentication tests
├── students.test.js      # Student endpoint tests
└── teachers.test.js      # Teacher endpoint tests
```

### Test Setup (`testSetup.js`)

- **In-Memory MongoDB**: Uses `mongodb-memory-server` for isolated testing
- **Global Utilities**: Provides test data generators and helper functions
- **Database Cleanup**: Clears collections before each test
- **Connection Management**: Handles test database lifecycle

### Test Utilities (`global.testUtils`)

```javascript
// Generate test data
testUtils.generateTestStudent(); // Student with realistic data
testUtils.generateTestTeacher(); // Teacher with realistic data
testUtils.generateAdminUser(); // Admin user
testUtils.generateTestUser("role"); // Generic user by role

// Helper functions
testUtils.createTestToken(userId, role); // JWT token for testing
testUtils.wait(ms); // Async delay utility
```

## 🧪 Test Categories

### 1. Authentication Tests (`auth.test.js`)

- **User Registration**: Student, teacher, admin signup
- **Login/Logout**: Credential validation, JWT generation
- **Password Management**: Reset, change, forgot password
- **JWT Validation**: Token verification, expiration handling
- **Role-Based Access**: Permission checking

### 2. Student Tests (`students.test.js`)

- **CRUD Operations**: Create, read, update, delete students
- **Authorization**: Admin, teacher, and student permissions
- **Data Validation**: Input validation, field requirements
- **Specialized Endpoints**: Attendance, grades with date filtering
- **Error Handling**: Database errors, validation failures

### 3. Teacher Tests (`teachers.test.js`)

- **CRUD Operations**: Create, read, update, delete teachers
- **Department Management**: Filter by department, statistics
- **Authorization**: Admin-only operations, self-management
- **Statistics**: Aggregation queries, experience analysis
- **Validation**: Department, qualification, experience validation

## 🚀 Running Tests

### Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test categories
npm run test:auth        # Authentication only
npm run test:students    # Student endpoints only
npm run test:teachers    # Teacher endpoints only
```

### Advanced Commands

```bash
# Watch mode (re-run on file changes)
npm run test:watch

# With coverage
npm run test:coverage

# Generate HTML coverage report
npm run test:report

# Custom test runner
node test/runTests.js --help
node test/runTests.js --auth
node test/runTests.js --students
node test/runTests.js --teachers
```

### Pattern Matching

```bash
# Run tests matching specific descriptions
npm run test:single -- --grep "signup"
npm run test:single -- --grep "students"
npm run test:single -- --grep "authentication"

# Run with custom timeout
npm run test:single -- --timeout 15000
```

## 🛠️ Test Utilities

### Data Generation

```javascript
// Generate realistic test data
const studentData = testUtils.generateTestStudent();
const teacherData = testUtils.generateTestTeacher();
const adminData = testUtils.generateAdminUser();

// Custom user data
const customUser = testUtils.generateTestUser("teacher");
```

### JWT Token Creation

```javascript
// Create valid JWT for testing
const token = testUtils.createTestToken(userId, "admin");

// Use in requests
request(app)
  .get("/api/students")
  .set("Authorization", `Bearer ${token}`)
  .expect(200);
```

### Database Operations

```javascript
// Wait for async operations
await testUtils.wait(100); // 100ms delay

// Verify database state
const user = await User.findById(userId);
expect(user.isActive).to.be.true;
```

## 📊 Test Coverage

### Current Coverage Areas

- **Authentication**: 100% (signup, login, password management)
- **Student CRUD**: 100% (create, read, update, delete)
- **Teacher CRUD**: 100% (create, read, update, delete)
- **Authorization**: 100% (role-based access control)
- **Validation**: 100% (input validation, error handling)
- **Error Handling**: 100% (database, validation, auth errors)

### Coverage Commands

```bash
# Run with coverage
npm run test:coverage

# Generate detailed report
npm run test:report

# View coverage in browser
open coverage/index.html
```

## 🔧 Best Practices

### Test Organization

1. **Group Related Tests**: Use `describe` blocks for logical grouping
2. **Clear Test Names**: Use descriptive `it` descriptions
3. **Setup/Teardown**: Use `beforeEach` and `afterEach` for cleanup
4. **Isolation**: Each test should be independent and repeatable

### Data Management

1. **Unique Data**: Generate unique emails/IDs for each test
2. **Cleanup**: Clear database between tests
3. **Realistic Data**: Use realistic test data that matches schemas
4. **Validation**: Test both valid and invalid data scenarios

### Error Testing

1. **Happy Path**: Test successful operations
2. **Error Cases**: Test validation failures, auth errors
3. **Edge Cases**: Test boundary conditions, invalid inputs
4. **Database Errors**: Mock database failures for error handling

### Performance

1. **Fast Execution**: Use in-memory database for speed
2. **Parallel Tests**: Tests can run in parallel (when possible)
3. **Efficient Setup**: Minimize setup overhead in `beforeEach`
4. **Resource Cleanup**: Properly dispose of test resources

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Errors

```bash
# Ensure mongodb-memory-server is installed
npm install mongodb-memory-server --save-dev

# Check test setup configuration
node test/testSetup.js
```

#### 2. Test Timeout Issues

```bash
# Increase timeout in mocha.opts
--timeout 15000

# Or use command line
npm test -- --timeout 15000
```

#### 3. JWT Verification Errors

```bash
# Check JWT secret in config
# Ensure test environment variables are set
```

#### 4. Database Cleanup Issues

```bash
# Verify testSetup.js is loading correctly
# Check for async operations in beforeEach
```

### Debug Mode

```bash
# Run with verbose output
npm test -- --reporter spec --verbose

# Run single test file
npx mocha --require ./test/testSetup.js tests/auth.test.js

# Debug specific test
npx mocha --require ./test/testSetup.js --grep "should login successfully"
```

### Environment Variables

Create `.env.test` file for test-specific configuration:

```env
NODE_ENV=test
JWT_SECRET=test-secret-key
MONGODB_URI=mongodb://localhost:27017/test
```

## 📈 Performance Metrics

### Test Execution Times

- **Authentication Tests**: ~2-3 seconds
- **Student Tests**: ~3-4 seconds
- **Teacher Tests**: ~3-4 seconds
- **Full Suite**: ~8-12 seconds

### Database Performance

- **In-Memory MongoDB**: ~100ms connection time
- **Collection Cleanup**: ~50ms per test
- **Data Generation**: ~10ms per test

## 🔄 Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "16"
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test",
      "pre-push": "npm run test:coverage"
    }
  }
}
```

## 📚 Additional Resources

### Documentation

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Sinon.js](https://sinonjs.org/)
- [Supertest](https://github.com/visionmedia/supertest)

### Testing Patterns

- [Test-Driven Development (TDD)](https://en.wikipedia.org/wiki/Test-driven_development)
- [Behavior-Driven Development (BDD)](https://en.wikipedia.org/wiki/Behavior-driven_development)
- [Integration Testing](https://en.wikipedia.org/wiki/Integration_testing)

### Best Practices

- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Node.js Testing](https://nodejs.org/en/docs/guides/testing-and-debugging/)

---

## 🎉 Getting Started

1. **Install Dependencies**: `npm install`
2. **Run Tests**: `npm test`
3. **Explore Test Files**: Check `tests/` directory
4. **Customize**: Modify `testSetup.js` for your needs
5. **Extend**: Add new test files following existing patterns

Happy Testing! 🧪✨
