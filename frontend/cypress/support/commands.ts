/// <reference types="cypress" />

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
});

// Custom command for logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
});

// Custom command for creating a student
Cypress.Commands.add('createStudent', (studentData: any) => {
  cy.visit('/students');
  cy.get('[data-testid="add-student-button"]').click();
  cy.get('#name').type(studentData.name);
  cy.get('#email').type(studentData.email);
  cy.get('#grade').select(studentData.grade);
  cy.get('#section').select(studentData.section);
  cy.get('#dateOfBirth').type(studentData.dateOfBirth);
  cy.get('#gender').select(studentData.gender);
  cy.get('button[type="submit"]').click();
});

// Custom command for creating a teacher
Cypress.Commands.add('createTeacher', (teacherData: any) => {
  cy.visit('/teachers');
  cy.get('[data-testid="add-teacher-button"]').click();
  cy.get('#name').type(teacherData.name);
  cy.get('#email').type(teacherData.email);
  cy.get('#department').select(teacherData.department);
  cy.get('#qualification').select(teacherData.qualification);
  cy.get('#experience').type(teacherData.experience);
  cy.get('#specialization').type(teacherData.specialization);
  cy.get('#salary').type(teacherData.salary);
  cy.get('#dateOfBirth').type(teacherData.dateOfBirth);
  cy.get('#gender').select(teacherData.gender);
  cy.get('button[type="submit"]').click();
});

// Custom command for deleting a student
Cypress.Commands.add('deleteStudent', (email: string) => {
  cy.visit('/students');
  cy.contains(email).parent().find('[data-testid="delete-student-button"]').click();
  cy.get('[data-testid="confirm-delete-button"]').click();
});

// Custom command for deleting a teacher
Cypress.Commands.add('deleteTeacher', (email: string) => {
  cy.visit('/teachers');
  cy.contains(email).parent().find('[data-testid="delete-teacher-button"]').click();
  cy.get('[data-testid="confirm-delete-button"]').click();
});

// Custom command for updating a student
Cypress.Commands.add('updateStudent', (email: string, updates: any) => {
  cy.visit('/students');
  cy.contains(email).parent().find('[data-testid="edit-student-button"]').click();
  Object.entries(updates).forEach(([field, value]) => {
    cy.get(`#${field}`).clear().type(value);
  });
  cy.get('button[type="submit"]').click();
});

// Custom command for updating a teacher
Cypress.Commands.add('updateTeacher', (email: string, updates: any) => {
  cy.visit('/teachers');
  cy.contains(email).parent().find('[data-testid="edit-teacher-button"]').click();
  Object.entries(updates).forEach(([field, value]) => {
    cy.get(`#${field}`).clear().type(value);
  });
  cy.get('button[type="submit"]').click();
});

// Custom command for checking API response
Cypress.Commands.add('checkApiResponse', (alias: string, expectedStatus: number) => {
  cy.wait(`@${alias}`).its('response.statusCode').should('eq', expectedStatus);
});

// Custom command for measuring performance
Cypress.Commands.add('measurePerformance', () => {
  cy.window().then((win) => {
    const performance = win.performance;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
    };
  });
});

// Extend Cypress namespace
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      createStudent(studentData: any): Chainable<void>;
      createTeacher(teacherData: any): Chainable<void>;
      deleteStudent(email: string): Chainable<void>;
      deleteTeacher(email: string): Chainable<void>;
      updateStudent(email: string, updates: any): Chainable<void>;
      updateTeacher(email: string, updates: any): Chainable<void>;
      checkApiResponse(alias: string, expectedStatus: number): Chainable<void>;
      measurePerformance(): Chainable<any>;
    }
  }
} 