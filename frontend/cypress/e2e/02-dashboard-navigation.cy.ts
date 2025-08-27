describe('Dashboard and Navigation E2E Tests', () => {
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

  describe('Dashboard Page', () => {
    it('should display dashboard with user information', () => {
      cy.url().should('include', '/dashboard');
      cy.contains('h1', 'Dashboard').should('be.visible');
      cy.wait('@getUserInfo'); // Wait for user data to load
      cy.contains('Welcome, Admin User').should('be.visible');
    });

    it('should display navigation menu', () => {
      cy.get('nav').should('be.visible');
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Students').should('be.visible');
      cy.contains('Teachers').should('be.visible');
    });

    it('should display feature cards', () => {
      cy.wait('@getUserInfo'); // Wait for user data to load
      cy.contains('Student Management').should('be.visible');
      cy.contains('Teacher Management').should('be.visible');
      cy.contains('Analytics & Reports').should('be.visible');
    });

    it('should navigate to students page', () => {
      cy.contains('Students').click();
      cy.url().should('include', '/students');
    });

    it('should navigate to teachers page', () => {
      cy.contains('Teachers').click();
      cy.url().should('include', '/teachers');
    });

    it('should handle logout', () => {
      cy.get('[data-testid="logout-button"]').click();
      cy.url().should('include', '/');
      cy.contains('School Management System').should('be.visible');
    });
  });

  describe('Navigation Component', () => {
    it('should highlight active page in navigation', () => {
      cy.visit('/dashboard');
      cy.get('nav').contains('Dashboard').should('have.class', 'bg-accent');
      
      cy.visit('/students');
      cy.get('nav').contains('Students').should('have.class', 'bg-accent');
      
      cy.visit('/teachers');
      cy.get('nav').contains('Teachers').should('have.class', 'bg-accent');
    });

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-6');
      cy.get('nav').should('be.visible');
      cy.get('nav button').should('be.visible'); // Mobile menu button
    });

    it('should maintain navigation state across page refreshes', () => {
      cy.visit('/students');
      cy.reload();
      cy.url().should('include', '/students');
      cy.get('nav').contains('Students').should('have.class', 'bg-accent');
    });
  });

  describe('Role-Based Access Control', () => {
    it('should show admin navigation for admin users', () => {
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: { email: 'admin@example.com', role: 'admin', name: 'Admin User' }
      }).as('getAdminInfo');

      cy.visit('/dashboard');
      cy.wait('@getAdminInfo');
      
      // Admins should see all management cards
      cy.contains('Student Management').should('be.visible');
      cy.contains('Teacher Management').should('be.visible');
      cy.contains('Analytics & Reports').should('be.visible');
      
      cy.get('[data-testid="logout-button"]').should('be.visible');
    });

    it('should show limited navigation for teacher users', () => {
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: { email: 'teacher@example.com', role: 'teacher', name: 'Teacher User' }
      }).as('getTeacherInfo');

      cy.visit('/dashboard');
      cy.wait('@getTeacherInfo');
      
      // Teachers should see Student Management but not Teacher Management or Analytics
      cy.contains('Student Management').should('be.visible');
      cy.contains('Teacher Management').should('not.exist');
      cy.contains('Analytics & Reports').should('not.exist');
      
      cy.get('[data-testid="logout-button"]').should('be.visible');
    });

    it('should show limited navigation for student users', () => {
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: { email: 'student@example.com', role: 'student', name: 'Student User' }
      }).as('getStudentInfo');

      cy.visit('/dashboard');
      cy.wait('@getStudentInfo');
      
      // Students should not see management cards
      cy.contains('Student Management').should('not.exist');
      cy.contains('Teacher Management').should('not.exist');
      cy.contains('Analytics & Reports').should('not.exist');
      
      // But should see logout button
      cy.get('[data-testid="logout-button"]').should('be.visible');
    });
  });

  describe('Dashboard Responsiveness', () => {
    it('should display correctly on desktop', () => {
      cy.viewport(1280, 720);
      cy.visit('/dashboard');
      cy.get('.grid').should('have.class', 'md:grid-cols-3');
    });

    it('should display correctly on tablet', () => {
      cy.viewport(768, 1024);
      cy.visit('/dashboard');
      cy.get('.grid').should('have.class', 'md:grid-cols-3');
    });

    it('should display correctly on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/dashboard');
      cy.get('.grid').should('have.class', 'grid-cols-1');
    });
  });

  describe('User Experience', () => {
    it('should handle user info fetch failure gracefully', () => {
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 500,
        body: { message: 'Internal server error' }
      }).as('getUserInfoError');

      cy.visit('/dashboard');
      cy.wait('@getUserInfoError');
      
      // Should show error message
      cy.contains('Internal server error').should('be.visible');
    });

    it('should show loading states while fetching data', () => {
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: { email: 'admin@example.com', role: 'admin', name: 'Admin User' },
        delay: 1000
      }).as('getUserInfoDelayed');

      cy.visit('/dashboard');
      
      // Should show loading state
      cy.contains('Loading...').should('be.visible');
      
      cy.wait('@getUserInfoDelayed');
      cy.contains('Welcome, Admin User').should('be.visible');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '/api/auth/me', {
        forceNetworkError: true
      }).as('getUserInfoNetworkError');

      cy.visit('/dashboard');
      cy.wait('@getUserInfoNetworkError');
      
      // Should show error message
      cy.contains('Failed to get user info').should('be.visible');
    });
  });

  describe('Performance and Accessibility', () => {
    it('should load dashboard within acceptable time', () => {
      cy.visit('/dashboard');
      cy.get('h1').should('be.visible');
      
      // Measure performance
      cy.window().then((win) => {
        const performance = win.performance;
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        
        expect(loadTime).to.be.lessThan(3000); // Should load within 3 seconds
      });
    });

    it('should have proper ARIA labels and roles', () => {
      cy.visit('/dashboard');
      
      // Check for proper heading structure
      cy.get('h1').should('be.visible');
      cy.get('h2').should('be.visible');
      
      // Check for proper button labels
      cy.get('[data-testid="logout-button"]').should('be.visible');
    });

    it('should be keyboard navigable', () => {
      cy.visit('/dashboard');
      
      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('exist');
      
      // Navigate with arrow keys
      cy.get('body').type('{rightarrow}');
      cy.get('body').type('{leftarrow}');
    });
  });
}); 