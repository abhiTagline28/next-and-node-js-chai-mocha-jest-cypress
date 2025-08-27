describe('Students Management E2E Tests', () => {
  beforeEach(() => {
    // Mock successful login and user data
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-token',
        user: { email: 'admin@example.com', role: 'admin', name: 'Admin User' }
      }
    }).as('loginRequest');

    cy.intercept('GET', '/api/auth/me', {
      statusCode: 200,
      body: { email: 'admin@example.com', role: 'admin', name: 'Admin User' }
    }).as('getUserInfo');

    cy.login('admin@example.com', 'password123');
  });

  describe('Students List Page', () => {
    beforeEach(() => {
      cy.visit('/students');
    });

    it('should display students list page', () => {
      cy.contains('h1', 'Students').should('be.visible');
      cy.get('[data-testid="add-student-button"]').should('be.visible');
    });

    it('should show empty state when no students', () => {
      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: { students: [] }
      }).as('getStudentsEmpty');

      cy.wait('@getStudentsEmpty');
      cy.contains('No students found').should('be.visible');
    });

    it('should display students in a table', () => {
      const mockStudents = [
        { id: 1, name: 'John Doe', email: 'john@example.com', grade: '10th', section: 'A' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', grade: '11th', section: 'B' }
      ];

      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: { students: mockStudents }
      }).as('getStudents');

      cy.wait('@getStudents');
      
      cy.contains('John Doe').should('be.visible');
      cy.contains('Jane Smith').should('be.visible');
      cy.contains('john@example.com').should('be.visible');
      cy.contains('jane@example.com').should('be.visible');
    });
  });

  describe('Add Student', () => {
    beforeEach(() => {
      cy.visit('/students');
      cy.get('[data-testid="add-student-button"]').click();
    });

    it('should display add student form', () => {
      cy.contains('h2', 'Add Student').should('be.visible');
      cy.get('#name').should('be.visible');
      cy.get('#email').should('be.visible');
      cy.get('#grade').should('be.visible');
      cy.get('#section').should('be.visible');
      cy.get('#dateOfBirth').should('be.visible');
      cy.get('#gender').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('button[type="submit"]').click();
      
      // Should show validation errors
      cy.get('#name').should('have.attr', 'required');
      cy.get('#email').should('have.attr', 'required');
      cy.get('#grade').should('have.attr', 'required');
      cy.get('#section').should('have.attr', 'required');
    });

    it('should handle successful student creation', () => {
      cy.intercept('POST', '/api/students', {
        statusCode: 201,
        body: { message: 'Student created successfully' }
      }).as('createStudent');

      cy.get('#name').type('New Student');
      cy.get('#email').type('newstudent@example.com');
      cy.get('#grade').select('10th');
      cy.get('#section').select('A');
      cy.get('#dateOfBirth').type('2005-01-01');
      cy.get('#gender').select('male');

      cy.get('button[type="submit"]').click();

      cy.wait('@createStudent');
      cy.contains('Student created successfully').should('be.visible');
    });

    it('should handle student creation failure', () => {
      cy.intercept('POST', '/api/students', {
        statusCode: 400,
        body: { message: 'Email already exists' }
      }).as('createStudentFailed');

      cy.get('#name').type('Existing Student');
      cy.get('#email').type('existing@example.com');
      cy.get('#grade').select('10th');
      cy.get('#section').select('A');
      cy.get('#dateOfBirth').type('2005-01-01');
      cy.get('#gender').select('male');

      cy.get('button[type="submit"]').click();

      cy.wait('@createStudentFailed');
      cy.contains('Email already exists').should('be.visible');
    });
  });

  describe('Edit Student', () => {
    beforeEach(() => {
      const mockStudents = [
        { id: 1, name: 'John Doe', email: 'john@example.com', grade: '10th', section: 'A' }
      ];

      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: { students: mockStudents }
      }).as('getStudents');

      cy.visit('/students');
      cy.wait('@getStudents');
    });

    it('should open edit form when edit button is clicked', () => {
      cy.get('[data-testid="edit-student-button"]').first().click();
      cy.contains('h2', 'Edit Student').should('be.visible');
      cy.get('#name').should('have.value', 'John Doe');
      cy.get('#email').should('have.value', 'john@example.com');
    });

    it('should handle successful student update', () => {
      cy.intercept('PUT', '/api/students/1', {
        statusCode: 200,
        body: { message: 'Student updated successfully' }
      }).as('updateStudent');

      cy.get('[data-testid="edit-student-button"]').first().click();
      cy.get('#name').clear().type('John Updated');
      cy.get('button[type="submit"]').click();

      cy.wait('@updateStudent');
      cy.contains('Student updated successfully').should('be.visible');
    });
  });

  describe('Delete Student', () => {
    beforeEach(() => {
      const mockStudents = [
        { id: 1, name: 'John Doe', email: 'john@example.com', grade: '10th', section: 'A' }
      ];

      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: { students: mockStudents }
      }).as('getStudents');

      cy.visit('/students');
      cy.wait('@getStudents');
    });

    it('should show confirmation dialog when delete button is clicked', () => {
      cy.get('[data-testid="delete-student-button"]').first().click();
      cy.contains('Are you sure you want to delete this student?').should('be.visible');
      cy.get('[data-testid="confirm-delete-button"]').should('be.visible');
      cy.get('[data-testid="cancel-delete-button"]').should('be.visible');
    });

    it('should handle successful student deletion', () => {
      cy.intercept('DELETE', '/api/students/1', {
        statusCode: 200,
        body: { message: 'Student deleted successfully' }
      }).as('deleteStudent');

      cy.get('[data-testid="delete-student-button"]').first().click();
      cy.get('[data-testid="confirm-delete-button"]').click();

      cy.wait('@deleteStudent');
      cy.contains('Student deleted successfully').should('be.visible');
    });

    it('should cancel deletion when cancel button is clicked', () => {
      cy.get('[data-testid="delete-student-button"]').first().click();
      cy.get('[data-testid="cancel-delete-button"]').click();
      
      // Should not show confirmation dialog
      cy.contains('Are you sure you want to delete this student?').should('not.exist');
    });
  });

  describe('Role-Based Access Control', () => {
    it('should hide CRUD buttons for non-admin users', () => {
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: { email: 'teacher@example.com', role: 'teacher', name: 'Teacher User' }
      }).as('getTeacherInfo');

      cy.visit('/students');
      cy.wait('@getTeacherInfo');

      // Teachers should not see add/edit/delete buttons
      cy.get('[data-testid="add-student-button"]').should('not.exist');
      cy.get('[data-testid="edit-student-button"]').should('not.exist');
      cy.get('[data-testid="delete-student-button"]').should('not.exist');
    });

    it('should deny access to students', () => {
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: { email: 'student@example.com', role: 'student', name: 'Student User' }
      }).as('getStudentInfo');

      cy.visit('/students');
      cy.wait('@getStudentInfo');

      cy.contains("You don't have permission to view students.").should('be.visible');
    });
  });

  describe('Search and Filter', () => {
    beforeEach(() => {
      const mockStudents = [
        { id: 1, name: 'John Doe', email: 'john@example.com', grade: '10th', section: 'A' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', grade: '11th', section: 'B' }
      ];

      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: { students: mockStudents }
      }).as('getStudents');

      cy.visit('/students');
      cy.wait('@getStudents');
    });

    it('should filter students by grade', () => {
      cy.get('[data-testid="grade-filter"]').select('10th');
      cy.contains('John Doe').should('be.visible');
      cy.contains('Jane Smith').should('not.be.visible');
    });

    it('should search students by name', () => {
      cy.get('[data-testid="search-input"]').type('John');
      cy.contains('John Doe').should('be.visible');
      cy.contains('Jane Smith').should('not.be.visible');
    });
  });
}); 