// ***********************************************************
// Add custom commands in this file.
// ***********************************************************

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.intercept('POST', '**/login', {
    statusCode: 200,
    body: { token: 'fake-token-for-e2e' },
  }).as('loginRequest')
  cy.visit('/login')
  cy.get('[data-testid="input-text-email"]').type(email)
  cy.get('[data-testid="input-text-password"]').type(password)
  cy.get('[data-testid="button-submit"]').click()
  cy.wait('@loginRequest')
  cy.url().should('not.include', '/login')
})
