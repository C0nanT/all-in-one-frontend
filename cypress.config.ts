import { defineConfig } from 'cypress'

export default defineConfig({
  allowCypressEnv: false,
  screenshotsFolder: 'cypress/screenshots-output',
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1366,
    viewportHeight: 768,
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'cypress/component/**/*.cy.{ts,tsx}',
  },
})
