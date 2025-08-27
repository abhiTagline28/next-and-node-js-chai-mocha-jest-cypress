# Frontend Testing Guide

This document provides comprehensive information about the testing setup and how to run tests for the School Management System frontend.

## 🧪 Testing Stack

### Unit Testing (Jest + React Testing Library)

- **Jest**: JavaScript testing framework
- **React Testing Library**: React component testing utilities
- **Jest-DOM**: Custom Jest matchers for DOM assertions
- **User Event**: Realistic user interaction simulation

### E2E Testing (Cypress)

- **Cypress**: End-to-end testing framework
- **Custom Commands**: Reusable test actions
- **API Interception**: Mock API responses for testing

## 📁 Test File Structure

```
frontend/
├── __tests__/                    # Jest unit tests
│   ├── utils/
│   │   └── test-utils.tsx       # Test utilities and mocks
│   ├── components/
│   │   └── Navigation.test.tsx  # Navigation component tests
│   └── app/
│       └── dashboard/
│           └── page.test.tsx     # Dashboard page tests
├── cypress/                      # Cypress E2E tests
│   ├── e2e/
│   │   ├── 01-authentication.cy.ts
│   │   ├── 02-dashboard-navigation.cy.ts
│   │   ├── 03-students-management.cy.ts
│   │   ├── 04-teachers-management.cy.ts
│   │   ├── 05-api-integration.cy.ts
│   │   └── 06-performance-accessibility.cy.ts
│   ├── support/
│   │   ├── e2e.ts               # Global Cypress configuration
│   │   └── commands.ts          # Custom Cypress commands
│   └── cypress.config.ts        # Cypress configuration
├── jest.config.js                # Jest configuration
├── babel.config.js               # Babel configuration for Jest
└── src/
    └── setupTests.ts             # Jest global setup and mocks
```

## 🚀 Running Tests

### Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=Navigation.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"
```

### E2E Tests (Cypress)

```bash
# Open Cypress Test Runner (GUI)
npm run cypress:open

# Run all E2E tests in headless mode
npm run cypress:run

# Run specific test file
npm run cypress:run -- --spec "cypress/e2e/01-authentication.cy.ts"

# Run tests in specific browser
npm run cypress:run -- --browser chrome
```

## 🧩 Test Categories

### 1. Authentication Tests (`01-authentication.cy.ts`)

- **Login Page**: Form validation, successful login, failed login
- **Signup Page**: Role-based fields, validation, success/failure
- **Forgot Password**: Email submission, error handling
- **Reset Password**: Token validation, password reset
- **Authentication Flow**: State persistence, redirects

### 2. Dashboard & Navigation Tests (`02-dashboard-navigation.cy.ts`)

- **Dashboard Page**: User info display, feature cards
- **Navigation Component**: Active page highlighting, responsiveness
- **Role-Based Access**: Different content for admin/teacher/student
- **Responsive Design**: Desktop, tablet, mobile layouts
- **User Experience**: Error handling, loading states

### 3. Students Management Tests (`03-students-management.cy.ts`)

- **Students List**: Display, empty state, table structure
- **Add Student**: Form fields, validation, success/failure
- **Edit Student**: Form population, updates
- **Delete Student**: Confirmation dialog, deletion
- **Role-Based Access**: CRUD button visibility
- **Search & Filter**: Grade filtering, name search

### 4. Teachers Management Tests (`04-teachers-management.cy.ts`)

- **Teachers List**: Display, empty state, table structure
- **Add Teacher**: All fields including dropdowns, validation
- **Department Dropdowns**: Mathematics, Science, English, History, Computer Science
- **Qualification Dropdowns**: PhD, MSc, BSc, Diploma, Certificate
- **Edit/Delete**: CRUD operations with role-based access

### 5. API Integration Tests (`05-api-integration.cy.ts`)

- **Error Handling**: 400, 401, 403, 404, 500 status codes
- **Response Validation**: Data structure verification
- **Request Interceptors**: POST, PUT, DELETE validation
- **Performance Testing**: Response time measurement
- **Security Testing**: Sensitive data exposure, auth headers

### 6. Performance & Accessibility Tests (`06-performance-accessibility.cy.ts`)

- **Performance Testing**: Page load times, form submission
- **Accessibility Testing**: ARIA labels, keyboard navigation
- **Responsive Design**: Different viewport sizes
- **Cross-Browser**: Viewport compatibility
- **Error Recovery**: Network errors, timeouts

## 🛠️ Custom Cypress Commands

```typescript
// Authentication
cy.login(email, password);
cy.logout();

// CRUD Operations
cy.createStudent(studentData);
cy.createTeacher(teacherData);
cy.updateStudent(email, updates);
cy.updateTeacher(email, updates);
cy.deleteStudent(email);
cy.deleteTeacher(email);

// API Testing
cy.checkApiResponse(alias, expectedStatus);
cy.measurePerformance();
```

## 🔧 Test Configuration

### Jest Configuration

- **Environment**: jsdom (browser simulation)
- **Transform**: Babel for JSX/TSX support
- **Setup**: Global mocks and matchers
- **Coverage**: HTML and text reports

### Cypress Configuration

- **Base URL**: http://localhost:3001
- **Viewport**: 1280x720 default
- **Timeouts**: 10 seconds for commands
- **Videos**: Disabled for faster runs
- **Screenshots**: On failure

## 📊 Test Coverage

### Unit Tests Coverage

- **Components**: Navigation, Dashboard
- **Pages**: Dashboard, Students, Teachers
- **Services**: Auth, API utilities
- **Utilities**: Helper functions

### E2E Tests Coverage

- **User Flows**: Complete user journeys
- **Cross-Browser**: Responsive design testing
- **Performance**: Load time measurements
- **Accessibility**: ARIA compliance
- **Error Scenarios**: Network failures, API errors

## 🐛 Common Issues & Solutions

### Jest Issues

1. **Navigation Errors**: Use mocked router in tests
2. **CSS Import Errors**: Configure identity-obj-proxy
3. **TypeScript Errors**: Ensure proper type definitions

### Cypress Issues

1. **Element Not Found**: Add proper data-testid attributes
2. **API Interception**: Use correct endpoint paths
3. **Timing Issues**: Use cy.wait() for async operations

## 📝 Writing New Tests

### Unit Test Template

```typescript
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ComponentName from "../ComponentName";

describe("ComponentName", () => {
  it("should render correctly", () => {
    render(<ComponentName />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });
});
```

### E2E Test Template

```typescript
describe("Feature Name", () => {
  it("should work correctly", () => {
    cy.visit("/page");
    cy.get('[data-testid="element"]').should("be.visible");
    cy.get("button").click();
    cy.contains("Success Message").should("be.visible");
  });
});
```

## 🎯 Best Practices

1. **Test Data**: Use realistic, varied test data
2. **Assertions**: Test behavior, not implementation
3. **Selectors**: Prefer data-testid over CSS classes
4. **Mocks**: Mock external dependencies consistently
5. **Cleanup**: Reset state between tests
6. **Descriptive Names**: Clear test descriptions

## 📈 Continuous Integration

Tests are configured to run in CI/CD pipelines:

- **Unit Tests**: Run on every commit
- **E2E Tests**: Run on pull requests
- **Coverage Reports**: Generated and tracked
- **Performance Metrics**: Monitored over time

## 🔍 Debugging Tests

### Jest Debugging

```bash
# Run single test with verbose output
npm test -- --verbose --testNamePattern="specific test"

# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Cypress Debugging

```bash
# Open Cypress with dev tools
npm run cypress:open

# Debug specific test
cy.debug() // Add to test code
cy.pause() // Pause test execution
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Note**: Always run tests before committing code to ensure quality and prevent regressions.
