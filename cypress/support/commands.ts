/// <reference path="../../cypress.d.ts" />
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

// Chainable command: use after cy.get(selector), e.g. cy.get('[data-testid="btn"]').highlight(500)
Cypress.Commands.add(
  'highlight',
  // @ts-expect-error Cypress CommandFn has strict typing for prevSubject
  { prevSubject: 'element' },
  (subject: JQuery<HTMLElement>, durationMs?: number) => {
    if (subject === undefined || subject === null) {
      throw new Error(
        'highlight() requires a DOM element. Chain it after cy.get() or cy.contains(), e.g. cy.get("[data-testid="btn"]").highlight()',
      )
    }
    const duration = durationMs ?? 400
    return cy
      .wrap(subject, { log: false })
      .invoke('css', 'border', '3px solid #e11')
      .then(($el) =>
        cy.wait(duration).then(() =>
          cy.wrap($el).invoke('css', 'border', '').then(() => $el),
        ),
      )
  },
)
