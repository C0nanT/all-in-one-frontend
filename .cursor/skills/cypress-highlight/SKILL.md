---
name: cypress-highlight
description: Enforces using .highlight() in Cypress e2e tests for visual feedback during test runs. Use when writing or editing Cypress e2e tests, or when the user mentions e2e, Cypress, or frontend tests.
---

# Cypress highlight in e2e tests

## Rule

**Always** chain `.highlight()` after `cy.get(...)` or `cy.contains(...)` when the test asserts on or interacts with that element. This provides visual feedback (red border) during test execution and helps debug failures.

## Syntax

```ts
cy.get('[data-testid="input-text-email"]').highlight().should('be.visible')
cy.get('[data-testid="button-submit"]').highlight().click()
cy.contains('th', 'Account').highlight().should('be.visible')
```

Optional duration in ms (default 400):

```ts
cy.get('[data-testid="btn"]').highlight(500).click()
```

## Exception

Do not require `.highlight()` inside shared custom commands (e.g. `cy.login`) when those commands are not the focus of the test—only within the test body where elements are asserted or interacted with.

## Example

```ts
it('displays form and submits', () => {
  cy.get('[data-testid="input-text-email"]').highlight().type('user@example.com')
  cy.get('[data-testid="input-text-password"]').highlight().type('password123')
  cy.get('[data-testid="button-submit"]').highlight().should('be.visible').click()
})
```
