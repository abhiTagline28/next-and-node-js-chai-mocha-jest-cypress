describe('API Integration and Error Handling E2E Tests', () => {
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

  describe('API Error Handling', () => {
    it('should handle 400 Bad Request errors', () => {
      cy.intercept('GET', '/api/students', {
        statusCode: 400,
        body: { message: 'Invalid request parameters' }
      }).as('getStudentsBadRequest');

      cy.visit('/students');
      cy.wait('@getStudentsBadRequest');
      cy.contains('Invalid request parameters').should('be.visible');
    });

    it('should handle 401 Unauthorized errors', () => {
      cy.intercept('GET', '/api/students', {
        statusCode: 401,
        body: { message: 'Unauthorized access' }
      }).as('getStudentsUnauthorized');

      cy.visit('/students');
      cy.wait('@getStudentsUnauthorized');
      cy.contains('Unauthorized access').should('be.visible');
      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should handle 403 Forbidden errors', () => {
      cy.intercept('GET', '/api/teachers', {
        statusCode: 403,
        body: { message: 'Access forbidden' }
      }).as('getTeachersForbidden');

      cy.visit('/teachers');
      cy.wait('@getTeachersForbidden');
      cy.contains('Access forbidden').should('be.visible');
    });

    it('should handle 404 Not Found errors', () => {
      cy.intercept('GET', '/api/students/999', {
        statusCode: 404,
        body: { message: 'Student not found' }
      }).as('getStudentNotFound');

      cy.visit('/students/999');
      cy.wait('@getStudentNotFound');
      cy.contains('Student not found').should('be.visible');
    });

    it('should handle 500 Internal Server errors', () => {
      cy.intercept('GET', '/api/students', {
        statusCode: 500,
        body: { message: 'Internal server error' }
      }).as('getStudentsServerError');

      cy.visit('/students');
      cy.wait('@getStudentsServerError');
      cy.contains('Internal server error').should('be.visible');
    });

    it('should handle network timeouts', () => {
      cy.intercept('GET', '/api/students', {
        forceNetworkError: true
      }).as('getStudentsNetworkError');

      cy.visit('/students');
      cy.wait('@getStudentsNetworkError');
      cy.contains('Network error').should('be.visible');
    });
  });

  describe('API Response Validation', () => {
    it('should validate student data structure', () => {
      const mockStudents = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          grade: '10th',
          section: 'A',
          dateOfBirth: '2005-01-01',
          gender: 'male'
        }
      ];

      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: { students: mockStudents }
      }).as('getStudents');

      cy.visit('/students');
      cy.wait('@getStudents');

      // Validate all required fields are displayed
      cy.contains('John Doe').should('be.visible');
      cy.contains('john@example.com').should('be.visible');
      cy.contains('10th').should('be.visible');
      cy.contains('A').should('be.visible');
    });

    it('should validate teacher data structure', () => {
      const mockTeachers = [
        {
          id: 1,
          name: 'Dr. Smith',
          email: 'smith@example.com',
          department: 'Mathematics',
          qualification: 'PhD',
          experience: '10 years',
          specialization: 'Algebra',
          salary: '50000'
        }
      ];

      cy.intercept('GET', '/api/teachers', {
        statusCode: 200,
        body: { teachers: mockTeachers }
      }).as('getTeachers');

      cy.visit('/teachers');
      cy.wait('@getTeachers');

      // Validate all required fields are displayed
      cy.contains('Dr. Smith').should('be.visible');
      cy.contains('smith@example.com').should('be.visible');
      cy.contains('Mathematics').should('be.visible');
      cy.contains('PhD').should('be.visible');
    });
  });

  describe('API Request/Response Interceptors', () => {
    it('should intercept and validate POST requests', () => {
      cy.intercept('POST', '/api/students', (req) => {
        // Validate request body
        expect(req.body).to.have.property('name');
        expect(req.body).to.have.property('email');
        expect(req.body).to.have.property('grade');
        
        // Mock response
        req.reply({
          statusCode: 201,
          body: { message: 'Student created successfully' }
        });
      }).as('createStudent');

      cy.visit('/students');
      cy.get('[data-testid="add-student-button"]').click();
      
      cy.get('#name').type('Test Student');
      cy.get('#email').type('test@example.com');
      cy.get('#grade').select('10th');
      cy.get('#section').select('A');
      cy.get('#dateOfBirth').type('2005-01-01');
      cy.get('#gender').select('male');
      
      cy.get('button[type="submit"]').click();
      cy.wait('@createStudent');
    });

    it('should intercept and validate PUT requests', () => {
      const mockStudents = [
        { id: 1, name: 'John Doe', email: 'john@example.com', grade: '10th', section: 'A' }
      ];

      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: { students: mockStudents }
      }).as('getStudents');

      cy.intercept('PUT', '/api/students/1', (req) => {
        // Validate request body
        expect(req.body).to.have.property('name');
        expect(req.body).to.have.property('email');
        
        // Mock response
        req.reply({
          statusCode: 200,
          body: { message: 'Student updated successfully' }
        });
      }).as('updateStudent');

      cy.visit('/students');
      cy.wait('@getStudents');
      
      cy.get('[data-testid="edit-student-button"]').first().click();
      cy.get('#name').clear().type('John Updated');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@updateStudent');
    });

    it('should intercept and validate DELETE requests', () => {
      const mockStudents = [
        { id: 1, name: 'John Doe', email: 'john@example.com', grade: '10th', section: 'A' }
      ];

      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: { students: mockStudents }
      }).as('getStudents');

      cy.intercept('DELETE', '/api/students/1', (req) => {
        // Validate request
        expect(req.method).to.equal('DELETE');
        
        // Mock response
        req.reply({
          statusCode: 200,
          body: { message: 'Student deleted successfully' }
        });
      }).as('deleteStudent');

      cy.visit('/students');
      cy.wait('@getStudents');
      
      cy.get('[data-testid="delete-student-button"]').first().click();
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      cy.wait('@deleteStudent');
    });
  });

  describe('API Performance Testing', () => {
    it('should measure API response time', () => {
      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: { students: [] },
        delay: 100 // Simulate 100ms delay
      }).as('getStudents');

      const startTime = Date.now();
      
      cy.visit('/students');
      cy.wait('@getStudents');
      
      cy.window().then(() => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Response time should be reasonable (less than 2 seconds)
        expect(responseTime).to.be.lessThan(2000);
      });
    });

    it('should handle multiple concurrent API requests', () => {
      // Mock multiple API endpoints
      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: { students: [] }
      }).as('getStudents');

      cy.intercept('GET', '/api/teachers', {
        statusCode: 200,
        body: { teachers: [] }
      }).as('getTeachers');

      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: { email: 'admin@example.com', role: 'admin' }
      }).as('getUserInfo');

      // Visit dashboard which makes multiple API calls
      cy.visit('/dashboard');
      
      // Wait for all requests to complete
      cy.wait(['@getStudents', '@getTeachers', '@getUserInfo']);
      
      // Verify all data is loaded
      cy.contains('Student Management').should('be.visible');
      cy.contains('Teacher Management').should('be.visible');
    });
  });

  describe('API Security Testing', () => {
    it('should not expose sensitive information in responses', () => {
      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: { 
          students: [
            {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              // Should not include password or other sensitive fields
              grade: '10th',
              section: 'A'
            }
          ]
        }
      }).as('getStudents');

      cy.visit('/students');
      cy.wait('@getStudents');

      // Verify sensitive data is not exposed
      cy.contains('password').should('not.exist');
      cy.contains('token').should('not.exist');
      cy.contains('secret').should('not.exist');
    });

    it('should validate authentication headers', () => {
      cy.intercept('GET', '/api/students', (req) => {
        // Check if Authorization header is present
        expect(req.headers).to.have.property('authorization');
        
        req.reply({
          statusCode: 200,
          body: { students: [] }
        });
      }).as('getStudentsWithAuth');

      cy.visit('/students');
      cy.wait('@getStudentsWithAuth');
    });
  });
}); 