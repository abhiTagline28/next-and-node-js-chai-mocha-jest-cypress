describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    // Clear cookies and localStorage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Login Page', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should display login form with all fields', () => {
      cy.get('#email').should('be.visible');
      cy.get('#password').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
      cy.contains('Sign in to your account').should('be.visible');
    });

    it('should show validation error for invalid email', () => {
      cy.get('#email').type('invalid-email');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Wait for the error message to appear
      cy.contains('Please enter a valid email', { timeout: 10000 }).should('be.visible');
    });

    it('should show validation error for short password', () => {
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('123');
      cy.get('button[type="submit"]').click();
      
      // Wait for the error message to appear
      cy.contains('Password must be at least 6 characters', { timeout: 10000 }).should('be.visible');
    });

    it('should handle successful login', () => {
      // Mock successful login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          token: 'mock-token',
          user: { email: 'admin@example.com', role: 'admin' }
        }
      }).as('loginRequest');

      cy.get('#email').type('admin@example.com');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.url().should('include', '/dashboard');
    });

    it('should handle login failure', () => {
      // Mock failed login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { message: 'Invalid credentials' }
      }).as('loginRequest');

      cy.get('#email').type('wrong@example.com');
      cy.get('#password').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.contains('Invalid credentials').should('be.visible');
    });

    it('should navigate to forgot password page', () => {
      cy.contains('Forgot your password?').click();
      cy.url().should('include', '/forgot-password');
    });

    it('should navigate to signup page', () => {
      cy.contains("Don't have an account?").click();
      cy.url().should('include', '/signup');
    });
  });

  describe('Signup Page', () => {
    beforeEach(() => {
      cy.visit('/signup');
    });

    it('should display signup form with all fields', () => {
      cy.get('#name').should('be.visible');
      cy.get('#email').should('be.visible');
      cy.get('#password').should('be.visible');
      cy.get('#role').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should show student-specific fields by default', () => {
      cy.get('#grade').should('be.visible');
      cy.get('#section').should('be.visible');
      cy.get('#department').should('not.exist');
      cy.get('#qualification').should('not.exist');
    });

    it('should show teacher-specific fields when teacher role is selected', () => {
      cy.get('#role').select('teacher');
      cy.get('#department').should('be.visible');
      cy.get('#qualification').should('be.visible');
      cy.get('#experience').should('be.visible');
      cy.get('#specialization').should('be.visible');
      cy.get('#salary').should('be.visible');
    });

    it('should show admin-specific fields when admin role is selected', () => {
      cy.get('#role').select('admin');
      cy.get('#grade').should('not.exist');
      cy.get('#section').should('not.exist');
      cy.get('#department').should('not.exist');
      cy.get('#qualification').should('not.exist');
    });

    it('should validate required fields', () => {
      cy.get('button[type="submit"]').click();
      cy.get('#name').should('have.attr', 'required');
      cy.get('#email').should('have.attr', 'required');
      cy.get('#password').should('have.attr', 'required');
    });

    it('should handle successful signup', () => {
      // Mock successful signup
      cy.intercept('POST', '/api/auth/signup', {
        statusCode: 201,
        body: { 
          message: 'User created successfully',
          token: 'mock-token-123'
        }
      }).as('signupRequest');

      cy.get('#name').type('John Doe');
      cy.get('#email').type('john@example.com');
      cy.get('#password').type('password123');
      cy.get('#role').select('student');
      cy.get('#grade').select('10th');
      cy.get('#section').select('A');
      cy.get('#dateOfBirth').type('1990-01-01');
      cy.get('#gender').select('male');
      cy.get('#contactNumber').type('1234567890');
      cy.get('#address').type('123 Main St');

      cy.get('button[type="submit"]').click();

      cy.wait('@signupRequest');
      cy.url().should('include', '/dashboard');
    });

    it('should handle signup failure', () => {
      // Mock failed signup
      cy.intercept('POST', '/api/auth/signup', {
        statusCode: 400,
        body: { message: 'Email already exists' }
      }).as('signupRequest');

      cy.get('#name').type('John Doe');
      cy.get('#email').type('existing@example.com');
      cy.get('#password').type('password123');
      cy.get('#role').select('student');
      cy.get('#grade').select('10th');
      cy.get('#section').select('A');
      cy.get('#dateOfBirth').type('1990-01-01');
      cy.get('#gender').select('male');
      cy.get('#contactNumber').type('1234567890');
      cy.get('#address').type('123 Main St');

      cy.get('button[type="submit"]').click();

      cy.wait('@signupRequest');
      cy.contains('Email already exists').should('be.visible');
    });
  });

  describe('Forgot Password Page', () => {
    beforeEach(() => {
      cy.visit('/forgot-password');
    });

    it('should display forgot password form', () => {
      cy.get('#email').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
      cy.contains('Forgot your password?').should('be.visible');
    });

    it('should handle successful password reset request', () => {
      // Mock successful password reset request
      cy.intercept('POST', '/api/auth/forgot-password', {
        statusCode: 200,
        body: { message: 'Password reset email sent' }
      }).as('forgotPasswordRequest');

      cy.get('#email').type('user@example.com');
      cy.get('button[type="submit"]').click();

      cy.wait('@forgotPasswordRequest');
      cy.contains('Password reset email sent').should('be.visible');
    });

    it('should handle failed password reset request', () => {
      // Mock failed password reset request
      cy.intercept('POST', '/api/auth/forgot-password', {
        statusCode: 404,
        body: { message: 'User not found' }
      }).as('forgotPasswordRequest');

      cy.get('#email').type('nonexistent@example.com');
      cy.get('button[type="submit"]').click();

      cy.wait('@forgotPasswordRequest');
      cy.contains('User not found').should('be.visible');
    });

    it('should navigate back to login', () => {
      cy.contains('Back to Login').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Reset Password Page', () => {
    beforeEach(() => {
      cy.visit('/reset-password/test-token-123');
    });

    it('should display reset password form', () => {
      cy.get('#password').should('be.visible');
      cy.get('#confirmPassword').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
      cy.contains('Reset Password').should('be.visible');
    });

    it('should handle successful password reset', () => {
      // Mock successful reset
      cy.intercept('POST', '/api/auth/reset-password/test-token-123', {
        statusCode: 200,
        body: { message: 'Password reset successfully' }
      }).as('resetPasswordRequest');

      cy.get('#password').type('newpassword123');
      cy.get('#confirmPassword').type('newpassword123');
      cy.get('button[type="submit"]').click();

      cy.wait('@resetPasswordRequest');
      cy.contains('Password reset successfully').should('be.visible');
      
      // Should redirect to login after 2 seconds
      cy.wait(2000);
      cy.url().should('include', '/login');
    });

    it('should handle invalid token', () => {
      // Mock invalid token
      cy.intercept('POST', '/api/auth/reset-password/test-token-123', {
        statusCode: 400,
        body: { message: 'Invalid or expired token' }
      }).as('resetPasswordRequest');

      cy.get('#password').type('newpassword123');
      cy.get('#confirmPassword').type('newpassword123');
      cy.get('button[type="submit"]').click();

      cy.wait('@resetPasswordRequest');
      cy.contains('Invalid or expired token').should('be.visible');
    });

    it('should validate password confirmation match', () => {
      cy.get('#password').type('newpassword123');
      cy.get('#confirmPassword').type('differentpassword');
      cy.get('button[type="submit"]').click();

      cy.contains('Passwords do not match').should('be.visible');
    });

    it('should navigate back to login', () => {
      cy.contains('Back to Login').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Authentication Flow', () => {
    it('should maintain authentication state across page refreshes', () => {
      // Mock successful login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          token: 'mock-token',
          user: { email: 'admin@example.com', role: 'admin' }
        }
      }).as('loginRequest');

      cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: { user: { email: 'admin@example.com', role: 'admin' } }
      }).as('getUserInfo');

      cy.login('admin@example.com', 'password123');
      cy.wait('@loginRequest');
      cy.url().should('include', '/dashboard');

      // Refresh page
      cy.reload();
      cy.wait('@getUserInfo');
      cy.url().should('include', '/dashboard');
    });

    it('should redirect to login when accessing protected routes without auth', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
    });

    it('should redirect to dashboard after successful login', () => {
      // Mock successful login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          token: 'mock-token',
          user: { email: 'admin@example.com', role: 'admin' }
        }
      }).as('loginRequest');

      cy.visit('/login');
      cy.get('#email').type('admin@example.com');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.url().should('include', '/dashboard');
    });
  });
}); 