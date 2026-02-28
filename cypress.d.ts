import type { mount } from 'cypress/vue'

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
      login(email: string, password: string): Chainable<void>
    }
  }
}

export {}
