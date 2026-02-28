describe("Accounts payable", () => {
  const mockPayableAccounts = {
    data: [
      {
        id: 1,
        name: "Account 1",
        status: "paid" as const,
        payment: {
          id: 101,
          payer_id: 1,
          payer: "Payer 1",
          amount: 1500,
          period: "01-02-2026",
        },
      },
      {
        id: 2,
        name: "Account 2",
        status: "unpaid" as const,
        payment: {
          payer: "Payer 2",
          amount: 2000,
          period: "01-02-2026",
        },
      },
    ],
  }

  beforeEach(() => {
    cy.intercept("GET", "**/payable-accounts*", {
      statusCode: 200,
      body: mockPayableAccounts,
    }).as("fetchPayableAccounts")
    cy.login("user@example.com", "password123")
    cy.visit("/")
  })

  it("navigates from dashboard via sidebar and displays all components", () => {
    cy.contains("a", "Accounts payable").click()
    cy.url().should("include", "/accounts-payable")
    cy.wait("@fetchPayableAccounts")

    cy.get('[data-testid="accounts-payable-title"]')
      .highlight()
      .should("be.visible")
      .and("contain.text", "Accounts payable")
    cy.get('[data-testid="accounts-payable-period-selector"]').highlight().should("be.visible")
    cy.get('[data-testid="accounts-payable-add-button"]')
      .highlight()
      .should("be.visible")
      .and("contain.text", "Add")
    cy.get('[data-testid="accounts-payable-table"]').highlight().should("be.visible")

    cy.get('[data-testid="accounts-payable-table"]').within(() => {
      cy.contains("th", "Account").highlight().should("be.visible")
      cy.contains("th", "Status").highlight().should("be.visible")
      cy.contains("th", "Amount").highlight().should("be.visible")
      cy.contains("th", "Payer").highlight().should("be.visible")
      cy.contains("th", "Period").highlight().should("be.visible")
      cy.contains("th", "Actions").highlight().should("be.visible")
    })
  })
})
