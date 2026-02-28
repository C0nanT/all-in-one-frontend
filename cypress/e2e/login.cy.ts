describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('displays login form', () => {
    cy.contains('Log in').first().should('be.visible')
    cy.contains('Use your email and password to access the application.').should('be.visible')
    cy.get('[data-testid="input-text-email"]').should('be.visible')
    cy.get('[data-testid="input-text-password"]').should('be.visible')
    cy.get('[data-testid="button-submit"]').should('be.visible').and('contain.text', 'Log in')
    cy.contains('a', 'Create account').should('be.visible').and('have.attr', 'href', '/register')
  })

  it('shows error on invalid credentials', () => {
    cy.intercept('POST', '**/login', {
      statusCode: 422,
      body: { message: 'Invalid credentials.' },
    }).as('loginFail')

    cy.get('[data-testid="input-text-email"]').type('wrong@example.com')
    cy.get('[data-testid="input-text-password"]').type('wrongpassword')
    cy.get('[data-testid="button-submit"]').click()

    cy.wait('@loginFail')
    cy.contains('Invalid credentials.').should('be.visible')
    cy.url().should('include', '/login')
  })

  it('redirects to dashboard and stores token on success', () => {
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: { token: 'fake-token-for-e2e' },
    }).as('loginSuccess')

    cy.get('[data-testid="input-text-email"]').type('user@example.com')
    cy.get('[data-testid="input-text-password"]').type('password123')
    cy.get('[data-testid="button-submit"]').click()

    cy.wait('@loginSuccess')
    cy.url().should('not.include', '/login')
    cy.window().then((win) => {
      expect(win.localStorage.getItem('auth_token')).to.eq('fake-token-for-e2e')
    })
  })
})
