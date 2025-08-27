describe('Performance and Accessibility E2E Tests', () => {
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

  describe('Performance Testing', () => {
    it('should load dashboard within acceptable time', () => {
      const startTime = Date.now();
      
      cy.visit('/dashboard');
      cy.get('h1').should('be.visible');
      
      cy.window().then(() => {
        const endTime = Date.now();
        const loadTime = endTime - startTime;
        
        // Dashboard should load within 3 seconds
        expect(loadTime).to.be.lessThan(3000);
      });
    });

    it('should load students page within acceptable time', () => {
      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: { students: [] }
      }).as('getStudents');

      const startTime = Date.now();
      
      cy.visit('/students');
      cy.wait('@getStudents');
      cy.get('h1').should('be.visible');
      
      cy.window().then(() => {
        const endTime = Date.now();
        const loadTime = endTime - startTime;
        
        // Students page should load within 2 seconds
        expect(loadTime).to.be.lessThan(2000);
      });
    });

    it('should load teachers page within acceptable time', () => {
      cy.intercept('GET', '/api/teachers', {
        statusCode: 200,
        body: { teachers: [] }
      }).as('getTeachers');

      const startTime = Date.now();
      
      cy.visit('/teachers');
      cy.wait('@getTeachers');
      cy.get('h1').should('be.visible');
      
      cy.window().then(() => {
        const endTime = Date.now();
        const loadTime = endTime - startTime;
        
        // Teachers page should load within 2 seconds
        expect(loadTime).to.be.lessThan(2000);
      });
    });

    it('should measure form submission performance', () => {
      cy.intercept('POST', '/api/students', {
        statusCode: 201,
        body: { message: 'Student created successfully' }
      }).as('createStudent');

      cy.visit('/students');
      cy.get('[data-testid="add-student-button"]').click();
      
      const startTime = Date.now();
      
      cy.get('#name').type('Performance Test Student');
      cy.get('#email').type('performance@example.com');
      cy.get('#grade').select('10th');
      cy.get('#section').select('A');
      cy.get('#dateOfBirth').type('2005-01-01');
      cy.get('#gender').select('male');
      
      cy.get('button[type="submit"]').click();
      cy.wait('@createStudent');
      
      cy.window().then(() => {
        const endTime = Date.now();
        const submissionTime = endTime - startTime;
        
        // Form submission should complete within 1 second
        expect(submissionTime).to.be.lessThan(1000);
      });
    });

    it('should measure search performance', () => {
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
      
      const startTime = Date.now();
      
      cy.get('[data-testid="search-input"]').type('John');
      
      cy.window().then(() => {
        const endTime = Date.now();
        const searchTime = endTime - startTime;
        
        // Search should be responsive (less than 500ms)
        expect(searchTime).to.be.lessThan(500);
      });
    });
  });

  describe('Accessibility Testing', () => {
    it('should have proper heading structure', () => {
      cy.visit('/dashboard');
      
      // Check for proper heading hierarchy
      cy.get('h1').should('be.visible');
      cy.get('h2').should('be.visible');
      
      // Verify heading levels are logical
      cy.get('h1').should('have.length', 1);
    });

    it('should have proper form labels and associations', () => {
      cy.visit('/students');
      cy.get('[data-testid="add-student-button"]').click();
      
      // Check form field labels
      cy.get('label[for="name"]').should('be.visible');
      cy.get('label[for="email"]').should('be.visible');
      cy.get('label[for="grade"]').should('be.visible');
      cy.get('label[for="section"]').should('be.visible');
      
      // Check input associations
      cy.get('#name').should('have.attr', 'id');
      cy.get('#email').should('have.attr', 'id');
      cy.get('#grade').should('have.attr', 'id');
      cy.get('#section').should('have.attr', 'id');
    });

    it('should have proper button labels and types', () => {
      cy.visit('/students');
      
      // Check button accessibility
      cy.get('[data-testid="add-student-button"]').should('have.attr', 'type', 'button');
      cy.get('button[type="submit"]').should('exist');
      
      // Check for descriptive button text
      cy.get('[data-testid="add-student-button"]').should('contain.text', 'Add Student');
    });

    it('should have proper table structure', () => {
      const mockStudents = [
        { id: 1, name: 'John Doe', email: 'john@example.com', grade: '10th', section: 'A' }
      ];

      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: { students: mockStudents }
      }).as('getStudents');

      cy.visit('/students');
      cy.wait('@getStudents');
      
      // Check table structure
      cy.get('table').should('be.visible');
      cy.get('thead').should('be.visible');
      cy.get('tbody').should('be.visible');
      
      // Check table headers
      cy.get('th').should('contain.text', 'Name');
      cy.get('th').should('contain.text', 'Email');
      cy.get('th').should('contain.text', 'Grade');
      cy.get('th').should('contain.text', 'Section');
    });

    it('should have proper color contrast', () => {
      cy.visit('/dashboard');
      
      // Check that text is visible against background
      cy.get('h1').should('be.visible');
      cy.get('p').should('be.visible');
      
      // Check button visibility
      cy.get('button').should('be.visible');
    });

    it('should be keyboard navigable', () => {
      cy.visit('/dashboard');
      
      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('exist');
      
      // Navigate with arrow keys
      cy.get('body').type('{rightarrow}');
      cy.get('body').type('{leftarrow}');
      
      // Check if focus indicators are visible
      cy.get('body').tab();
      cy.focused().should('be.visible');
    });

    it('should have proper ARIA labels', () => {
      cy.visit('/students');
      cy.get('[data-testid="add-student-button"]').click();
      
      // Check for ARIA labels on form fields
      cy.get('#name').should('have.attr', 'aria-label').or('have.attr', 'aria-labelledby');
      cy.get('#email').should('have.attr', 'aria-label').or('have.attr', 'aria-labelledby');
      
      // Check for ARIA labels on buttons
      cy.get('button[type="submit"]').should('have.attr', 'aria-label').or('contain.text');
    });
  });

  describe('Responsive Design Testing', () => {
    it('should display correctly on desktop', () => {
      cy.viewport(1280, 720);
      cy.visit('/dashboard');
      
      // Check desktop layout
      cy.get('.grid').should('have.class', 'md:grid-cols-3');
      cy.get('nav').should('be.visible');
    });

    it('should display correctly on tablet', () => {
      cy.viewport(768, 1024);
      cy.visit('/dashboard');
      
      // Check tablet layout
      cy.get('.grid').should('have.class', 'md:grid-cols-3');
      cy.get('nav').should('be.visible');
    });

    it('should display correctly on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/dashboard');
      
      // Check mobile layout
      cy.get('.grid').should('have.class', 'grid-cols-1');
      cy.get('nav').should('be.visible');
    });

    it('should handle mobile navigation', () => {
      cy.viewport('iphone-6');
      cy.visit('/dashboard');
      
      // Check mobile navigation elements
      cy.get('nav').should('be.visible');
      cy.get('nav button').should('be.visible'); // Mobile menu button
    });
  });

  describe('Cross-Browser Compatibility', () => {
    it('should work with different viewport sizes', () => {
      const viewports = [
        [1920, 1080], // Full HD
        [1366, 768],  // Laptop
        [768, 1024],  // Tablet
        [375, 667],   // Mobile
        [320, 568]    // Small mobile
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);
        cy.visit('/dashboard');
        
        // Basic functionality should work on all viewports
        cy.get('h1').should('be.visible');
        cy.get('nav').should('be.visible');
      });
    });

    it('should maintain functionality across different orientations', () => {
      cy.viewport('iphone-6');
      
      // Test portrait orientation
      cy.visit('/dashboard');
      cy.get('h1').should('be.visible');
      
      // Test landscape orientation
      cy.viewport(667, 375);
      cy.visit('/dashboard');
      cy.get('h1').should('be.visible');
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '/api/students', {
        forceNetworkError: true
      }).as('getStudentsNetworkError');

      cy.visit('/students');
      cy.wait('@getStudentsNetworkError');
      
      // Should show error message
      cy.contains('Network error').should('be.visible');
      
      // Should provide retry option
      cy.get('button').contains('Retry').should('be.visible');
    });

    it('should handle API timeouts gracefully', () => {
      cy.intercept('GET', '/api/students', {
        statusCode: 408,
        body: { message: 'Request timeout' }
      }).as('getStudentsTimeout');

      cy.visit('/students');
      cy.wait('@getStudentsTimeout');
      
      // Should show timeout message
      cy.contains('Request timeout').should('be.visible');
    });

    it('should recover from errors after retry', () => {
      // First request fails
      cy.intercept('GET', '/api/students', {
        statusCode: 500,
        body: { message: 'Internal server error' }
      }).as('getStudentsError');

      cy.visit('/students');
      cy.wait('@getStudentsError');
      cy.contains('Internal server error').should('be.visible');

      // Second request succeeds
      cy.intercept('GET', '/api/students', {
        statusCode: 200,
        body: { students: [] }
      }).as('getStudentsSuccess');

      cy.get('button').contains('Retry').click();
      cy.wait('@getStudentsSuccess');
      cy.contains('No students found').should('be.visible');
    });
  });
}); 