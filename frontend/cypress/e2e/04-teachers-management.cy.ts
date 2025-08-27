describe('Teachers Management E2E Tests', () => {
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

  describe('Teachers List Page', () => {
    beforeEach(() => {
      cy.visit('/teachers');
    });

    it('should display teachers list page', () => {
      cy.contains('h1', 'Teachers').should('be.visible');
      cy.get('[data-testid="add-teacher-button"]').should('be.visible');
    });

    it('should show empty state when no teachers', () => {
      cy.intercept('GET', '/api/teachers', {
        statusCode: 200,
        body: { teachers: [] }
      }).as('getTeachersEmpty');

      cy.wait('@getTeachersEmpty');
      cy.contains('No teachers found').should('be.visible');
    });

    it('should display teachers in a table', () => {
      const mockTeachers = [
        { 
          id: 1, 
          name: 'Dr. Smith', 
          email: 'smith@example.com', 
          department: 'Mathematics',
          qualification: 'PhD',
          experience: '10 years'
        },
        { 
          id: 2, 
          name: 'Prof. Johnson', 
          email: 'johnson@example.com', 
          department: 'Science',
          qualification: 'MSc',
          experience: '8 years'
        }
      ];

      cy.intercept('GET', '/api/teachers', {
        statusCode: 200,
        body: { teachers: mockTeachers }
      }).as('getTeachers');

      cy.wait('@getTeachers');
      
      cy.contains('Dr. Smith').should('be.visible');
      cy.contains('Prof. Johnson').should('be.visible');
      cy.contains('Mathematics').should('be.visible');
      cy.contains('Science').should('be.visible');
    });
  });

  describe('Add Teacher', () => {
    beforeEach(() => {
      cy.visit('/teachers');
      cy.get('[data-testid="add-teacher-button"]').click();
    });

    it('should display add teacher form with all fields', () => {
      cy.contains('h2', 'Add Teacher').should('be.visible');
      cy.get('#name').should('be.visible');
      cy.get('#email').should('be.visible');
      cy.get('#department').should('be.visible');
      cy.get('#qualification').should('be.visible');
      cy.get('#experience').should('be.visible');
      cy.get('#specialization').should('be.visible');
      cy.get('#salary').should('be.visible');
      cy.get('#dateOfBirth').should('be.visible');
      cy.get('#gender').should('be.visible');
      cy.get('#contactNumber').should('be.visible');
      cy.get('#address').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should have department dropdown with correct options', () => {
      cy.get('#department').should('be.visible');
      cy.get('#department option').should('have.length', 6); // Including default option
      cy.get('#department').select('Mathematics');
      cy.get('#department').should('have.value', 'Mathematics');
    });

    it('should have qualification dropdown with correct options', () => {
      cy.get('#qualification').should('be.visible');
      cy.get('#qualification option').should('have.length', 5); // Including default option
      cy.get('#qualification').select('PhD');
      cy.get('#qualification').should('have.value', 'PhD');
    });

    it('should validate required fields', () => {
      cy.get('button[type="submit"]').click();
      
      // Should show validation errors
      cy.get('#name').should('have.attr', 'required');
      cy.get('#email').should('have.attr', 'required');
      cy.get('#department').should('have.attr', 'required');
      cy.get('#qualification').should('have.attr', 'required');
    });

    it('should handle successful teacher creation', () => {
      cy.intercept('POST', '/api/teachers', {
        statusCode: 201,
        body: { message: 'Teacher created successfully' }
      }).as('createTeacher');

      cy.get('#name').type('New Teacher');
      cy.get('#email').type('newteacher@example.com');
      cy.get('#department').select('Mathematics');
      cy.get('#qualification').select('PhD');
      cy.get('#experience').type('5 years');
      cy.get('#specialization').type('Algebra');
      cy.get('#salary').type('50000');
      cy.get('#dateOfBirth').type('1980-01-01');
      cy.get('#gender').select('female');
      cy.get('#contactNumber').type('1234567890');
      cy.get('#address').type('456 Teacher St');

      cy.get('button[type="submit"]').click();

      cy.wait('@createTeacher');
      cy.contains('Teacher created successfully').should('be.visible');
    });

    it('should handle teacher creation failure', () => {
      cy.intercept('POST', '/api/teachers', {
        statusCode: 400,
        body: { message: 'Email already exists' }
      }).as('createTeacherFailed');

      cy.get('#name').type('Existing Teacher');
      cy.get('#email').type('existing@example.com');
      cy.get('#department').select('Mathematics');
      cy.get('#qualification').select('PhD');
      cy.get('#experience').type('5 years');
      cy.get('#specialization').type('Algebra');
      cy.get('#salary').type('50000');
      cy.get('#dateOfBirth').type('1980-01-01');
      cy.get('#gender').select('female');
      cy.get('#contactNumber').type('1234567890');
      cy.get('#address').type('456 Teacher St');

      cy.get('button[type="submit"]').click();

      cy.wait('@createTeacherFailed');
      cy.contains('Email already exists').should('be.visible');
    });
  });

  describe('Edit Teacher', () => {
    beforeEach(() => {
      const mockTeachers = [
        { 
          id: 1, 
          name: 'Dr. Smith', 
          email: 'smith@example.com', 
          department: 'Mathematics',
          qualification: 'PhD',
          experience: '10 years'
        }
      ];

      cy.intercept('GET', '/api/teachers', {
        statusCode: 200,
        body: { teachers: mockTeachers }
      }).as('getTeachers');

      cy.visit('/teachers');
      cy.wait('@getTeachers');
    });

    it('should open edit form when edit button is clicked', () => {
      cy.get('[data-testid="edit-teacher-button"]').first().click();
      cy.contains('h2', 'Edit Teacher').should('be.visible');
      cy.get('#name').should('have.value', 'Dr. Smith');
      cy.get('#email').should('have.value', 'smith@example.com');
      cy.get('#department').should('have.value', 'Mathematics');
      cy.get('#qualification').should('have.value', 'PhD');
    });

    it('should handle successful teacher update', () => {
      cy.intercept('PUT', '/api/teachers/1', {
        statusCode: 200,
        body: { message: 'Teacher updated successfully' }
      }).as('updateTeacher');

      cy.get('[data-testid="edit-teacher-button"]').first().click();
      cy.get('#name').clear().type('Dr. Smith Updated');
      cy.get('#department').select('Science');
      cy.get('button[type="submit"]').click();

      cy.wait('@updateTeacher');
      cy.contains('Teacher updated successfully').should('be.visible');
    });
  });

  describe('Delete Teacher', () => {
    beforeEach(() => {
      const mockTeachers = [
        { 
          id: 1, 
          name: 'Dr. Smith', 
          email: 'smith@example.com', 
          department: 'Mathematics',
          qualification: 'PhD',
          experience: '10 years'
        }
      ];

      cy.intercept('GET', '/api/teachers', {
        statusCode: 200,
        body: { teachers: mockTeachers }
      }).as('getTeachers');

      cy.visit('/teachers');
      cy.wait('@getTeachers');
    });

    it('should show confirmation dialog when delete button is clicked', () => {
      cy.get('[data-testid="delete-teacher-button"]').first().click();
      cy.contains('Are you sure you want to delete this teacher?').should('be.visible');
      cy.get('[data-testid="confirm-delete-button"]').should('be.visible');
      cy.get('[data-testid="cancel-delete-button"]').should('be.visible');
    });

    it('should handle successful teacher deletion', () => {
      cy.intercept('DELETE', '/api/teachers/1', {
        statusCode: 200,
        body: { message: 'Teacher deleted successfully' }
      }).as('deleteTeacher');

      cy.get('[data-testid="delete-teacher-button"]').first().click();
      cy.get('[data-testid="confirm-delete-button"]').click();

      cy.wait('@deleteTeacher');
      cy.contains('Teacher deleted successfully').should('be.visible');
    });

    it('should cancel deletion when cancel button is clicked', () => {
      cy.get('[data-testid="delete-teacher-button"]').first().click();
      cy.get('[data-testid="cancel-delete-button"]').click();
      
      // Should not show confirmation dialog
      cy.contains('Are you sure you want to delete this teacher?').should('not.exist');
    });
  });

  describe('Role-Based Access Control', () => {
    it('should deny access to non-admin users', () => {
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: { email: 'teacher@example.com', role: 'teacher', name: 'Teacher User' }
      }).as('getTeacherInfo');

      cy.visit('/teachers');
      cy.wait('@getTeacherInfo');

      cy.contains("You don't have permission to view teachers.").should('be.visible');
    });

    it('should deny access to students', () => {
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: { email: 'student@example.com', role: 'student', name: 'Student User' }
      }).as('getStudentInfo');

      cy.visit('/teachers');
      cy.wait('@getStudentInfo');

      cy.contains("You don't have permission to view teachers.").should('be.visible');
    });
  });

  describe('Search and Filter', () => {
    beforeEach(() => {
      const mockTeachers = [
        { 
          id: 1, 
          name: 'Dr. Smith', 
          email: 'smith@example.com', 
          department: 'Mathematics',
          qualification: 'PhD'
        },
        { 
          id: 2, 
          name: 'Prof. Johnson', 
          email: 'johnson@example.com', 
          department: 'Science',
          qualification: 'MSc'
        }
      ];

      cy.intercept('GET', '/api/teachers', {
        statusCode: 200,
        body: { teachers: mockTeachers }
      }).as('getTeachers');

      cy.visit('/teachers');
      cy.wait('@getTeachers');
    });

    it('should filter teachers by department', () => {
      cy.get('[data-testid="department-filter"]').select('Mathematics');
      cy.contains('Dr. Smith').should('be.visible');
      cy.contains('Prof. Johnson').should('not.be.visible');
    });

    it('should filter teachers by qualification', () => {
      cy.get('[data-testid="qualification-filter"]').select('PhD');
      cy.contains('Dr. Smith').should('be.visible');
      cy.contains('Prof. Johnson').should('not.be.visible');
    });

    it('should search teachers by name', () => {
      cy.get('[data-testid="search-input"]').type('Smith');
      cy.contains('Dr. Smith').should('be.visible');
      cy.contains('Prof. Johnson').should('not.be.visible');
    });
  });
}); 