# 🏫 School Management API

A comprehensive Node.js REST API for school management with authentication, role-based access control, and comprehensive testing.

## 🚀 Features

- **🔐 Authentication & Authorization**

  - JWT-based authentication
  - Role-based access control (Student, Teacher, Admin)
  - Password reset functionality
  - Secure password hashing with bcrypt

- **👨‍🎓 Student Management**

  - CRUD operations for student profiles
  - Attendance tracking
  - Grade management
  - Academic information (grade, section, etc.)

- **👨‍🏫 Teacher Management**

  - CRUD operations for teacher profiles
  - Department-based organization
  - Experience and qualification tracking
  - Salary management

- **🛡️ Security & Validation**

  - Input validation with express-validator
  - CORS support
  - Rate limiting ready
  - SQL injection protection

- **🧪 Comprehensive Testing**
  - Unit and integration tests
  - In-memory MongoDB for testing
  - Test coverage reporting
  - Custom test runner

## 🏗️ Architecture

```
├── config/                 # Configuration files
│   ├── database.js        # Database connection
│   └── index.js           # Environment variables
├── controllers/            # Business logic
│   ├── authController.js   # Authentication logic
│   ├── studentController.js # Student operations
│   └── teacherController.js # Teacher operations
├── middleware/             # Express middleware
│   ├── auth.js            # Authentication & authorization
│   └── validate.js        # Input validation
├── models/                 # Mongoose schemas
│   ├── User.js            # User model
│   ├── Student.js         # Student model
│   └── Teacher.js         # Teacher model
├── routes/                 # API routes
│   ├── auth.js            # Authentication endpoints
│   ├── students.js        # Student endpoints
│   └── teachers.js        # Teacher endpoints
├── services/               # Business services
│   ├── studentService.js  # Student business logic
│   └── teacherService.js  # Teacher business logic
├── utils/                  # Utility functions
│   ├── errorHandler.js    # Error handling utilities
│   ├── jwt.js             # JWT operations
│   └── password.js        # Password utilities
├── test/                   # Test configuration
│   ├── testSetup.js       # Test environment setup
│   ├── mocha.opts         # Mocha configuration
│   ├── runTests.js        # Custom test runner
│   └── README.md          # Test documentation
├── tests/                  # Test files
│   ├── auth.test.js       # Authentication tests
│   ├── students.test.js   # Student endpoint tests
│   └── teachers.test.js   # Teacher endpoint tests
├── server.js               # Main application file
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Testing**: Mocha, Chai, Sinon, Supertest
- **Test Database**: mongodb-memory-server

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local instance or cloud)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd school-management-api

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
# Edit .env file with your settings

# Start the server
npm start

# For development (with auto-restart)
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/school-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=24h
RESET_PASSWORD_EXPIRE=10m
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🚀 API Endpoints

### Authentication

```
POST   /api/auth/signup          # User registration
POST   /api/auth/login           # User login
POST   /api/auth/forgot-password # Password reset request
POST   /api/auth/reset-password/:token # Password reset
PUT    /api/auth/change-password # Change password
GET    /api/auth/me              # Get current user
POST   /api/auth/logout          # User logout
```

### Students

```
GET    /api/students             # Get all students (paginated)
GET    /api/students/:id         # Get student by ID
POST   /api/students             # Create new student
PUT    /api/students/:id         # Update student
DELETE /api/students/:id         # Delete student (soft delete)
GET    /api/students/:id/attendance # Get student attendance
GET    /api/students/:id/grades  # Get student grades
```

### Teachers

```
GET    /api/teachers             # Get all teachers (paginated)
GET    /api/teachers/:id         # Get teacher by ID
POST   /api/teachers             # Create new teacher
PUT    /api/teachers/:id         # Update teacher
DELETE /api/teachers/:id         # Delete teacher (soft delete)
GET    /api/teachers/department/:dept # Get teachers by department
GET    /api/teachers/stats/overview # Get teacher statistics
```

## 🔐 Authentication & Authorization

### User Roles

- **Student**: Can access own profile, attendance, and grades
- **Teacher**: Can access student lists, update student information
- **Admin**: Full access to all endpoints and operations

### JWT Token Usage

```bash
# Include token in request headers
Authorization: Bearer <your-jwt-token>

# Example request
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/students
```

## 🧪 Testing

### Quick Start

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:auth        # Authentication tests only
npm run test:students    # Student tests only
npm run test:teachers    # Teacher tests only

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Custom Test Runner

```bash
# Show help
node test/runTests.js --help

# Run specific tests
node test/runTests.js --auth
node test/runTests.js --students
node test/runTests.js --teachers
node test/runTests.js --all
```

### Test Coverage

The test suite provides comprehensive coverage for:

- ✅ Authentication flows
- ✅ CRUD operations
- ✅ Authorization rules
- ✅ Input validation
- ✅ Error handling
- ✅ Database operations

## 📊 API Examples

### Create a Student

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@school.com",
    "password": "password123",
    "grade": "10th",
    "section": "A",
    "dateOfBirth": "2005-05-15",
    "gender": "male",
    "contactNumber": "+1234567890"
  }'
```

### Create a Teacher

```bash
curl -X POST http://localhost:3000/api/teachers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@school.com",
    "password": "password123",
    "department": "Mathematics",
    "qualification": "Masters",
    "experience": 5,
    "dateOfBirth": "1985-03-20",
    "gender": "female"
  }'
```

### User Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@school.com",
    "password": "password123"
  }'
```

## 🔧 Development

### Project Structure

The project follows the **MVC (Model-View-Controller)** pattern with additional layers:

- **Models**: Mongoose schemas and database models
- **Controllers**: Request handling and response formatting
- **Services**: Business logic and data processing
- **Routes**: API endpoint definitions
- **Middleware**: Authentication, validation, and error handling
- **Utils**: Helper functions and utilities

### Adding New Features

1. **Create Model**: Define Mongoose schema in `models/`
2. **Create Service**: Add business logic in `services/`
3. **Create Controller**: Handle HTTP requests in `controllers/`
4. **Create Routes**: Define endpoints in `routes/`
5. **Add Tests**: Create comprehensive tests in `tests/`
6. **Update Documentation**: Keep README and API docs current

### Code Style

- Use ES6+ features
- Follow consistent naming conventions
- Include JSDoc comments for functions
- Handle errors gracefully
- Validate all inputs
- Write comprehensive tests

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set production values
2. **Database**: Use production MongoDB instance
3. **JWT Secret**: Use strong, unique secret
4. **HTTPS**: Enable SSL/TLS
5. **Rate Limiting**: Implement API rate limiting
6. **Logging**: Add production logging
7. **Monitoring**: Set up health checks and monitoring

### Docker Support

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Setup

```bash
# Install development dependencies
npm install

# Run tests before committing
npm test

# Check code coverage
npm run test:coverage

# Lint code (if ESLint is configured)
npm run lint
```

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

### Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running
2. **JWT Errors**: Check JWT_SECRET in environment
3. **Test Failures**: Verify test database setup
4. **Validation Errors**: Check request payload format

### Getting Help

- Check the [test documentation](test/README.md)
- Review error logs and stack traces
- Verify environment configuration
- Run tests to identify issues

## 🎯 Roadmap

- [ ] **Advanced Features**

  - Course management
  - Class scheduling
  - Fee management
  - Parent portal
  - Mobile app support

- [ ] **Performance Improvements**

  - Database indexing
  - Caching layer
  - API response optimization
  - Load balancing

- [ ] **Security Enhancements**
  - Two-factor authentication
  - API rate limiting
  - Request logging
  - Security headers

---

## 🎉 Getting Started

1. **Install**: `npm install`
2. **Configure**: Set up environment variables
3. **Start**: `npm start`
4. **Test**: `npm test`
5. **Explore**: Check API endpoints
6. **Develop**: Add new features

Happy coding! 🚀✨
