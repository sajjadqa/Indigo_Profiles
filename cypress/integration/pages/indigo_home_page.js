// var faker = require('Faker')
class IndigoMainPage {
    constructor() {
        this.PROFILE_CODE = null
        this.PROFILE_DESCRIPTION = null
    }
    
    goToTaxProfilePage() {
        cy.get('[data-uid="TaxProfiles"]').click({force: true})
        cy.get('.taxprofile-list-view .gridWrapper').should('be.visible')
        cy.intercept('GET', '**/api/HR/Payroll/TaxProfiles').as('tax_profiles')
        cy.wait('@tax_profiles').then((xhr) => {
            let status_code = xhr.response.statusCode
            expect(status_code).to.equal(200)
         })
    }

    addNewTaxProfile() {
        let new_profile_code = "Profile#" + Math.random().toString(36).substr(2, 5)
        let new_profile_description = "Description:" + Math.random().toString(36).substr(2, 5)
        this.PROFILE_CODE = new_profile_code
        this.PROFILE_DESCRIPTION = new_profile_description
        cy.intercept('GET', '**/api/HR/Payroll/TaxProfiles/insertdefaults').as('add_record')
        cy.get('.taxprofile-list-view [data-context="Tax Profile"] #insertButton').click({force: true}).then(()=> {
            cy.wait('@add_record')
            cy.get('.taxprofile-list-view [data-context="Tax Profile"] #insertButton').should('have.class', 'disabled')
            cy.get(' .taxprofile-list-view input[data-uid="TaxProfile-Code"]').type(new_profile_code).then(() => {
                cy.get('.taxprofile-list-view [data-uid="TaxProfile-Description"]').type(new_profile_description)
                cy.contains('FSS Main').should('have.text', 'FSS Main')
                cy.get('.taxprofile-list-view div[role="checkbox"]').first().click()
            })
        })
    }

    saveNewProfile() {
        cy.intercept('POST', '**/api/command?__type=CreateCommand').as('entry_added')
        cy.get('.taxprofile-list-view div[title="Save (Enter)"]').click().then(() => {
            cy.wait('@entry_added').then((xhr) => {
                let status_text = xhr.response.statusMessage
                expect(status_text).to.equal('OK')
            })
            cy.get('.taxprofile-list-view div[title="Cancel (Esc)"]').click()
        })
    }

    searchByTaxProfileCode(profile_code) {
        cy.intercept('GET', '**/api/HR/Payroll/TaxProfiles').as('tax_profiles')
        cy.intercept('POST', 'https://dc.services.visualstudio.com/v2/track').as('track_service')
        // cy.wait('@tax_profiles').then((xhr) => {
        //     let status_code = xhr.response.statusCode
        //     expect(status_code).to.equal(200)
        //  })
        cy.get('input[data-uid="FilterRow-TaxProfile-Code"]').as('tax_code_input').should('be.visible').click({force: true})
        cy.get('@tax_code_input').type(profile_code).then(() => {
            cy.get('[data-uid="Tax Profile-refreshDataButton"]').click().then(() => {
                cy.wait('@tax_profiles').then((xhr) => {
                    let status_code = xhr.response.statusCode
                    expect(status_code).to.equal(200)
                 })
                 cy.wait('@track_service')
            })
            cy.get('.taxprofile-list-view div[role="row"] div[role="gridcell"] .jqx-grid-cell-left-align').as('taxes')
            .first().should('have.text', this.PROFILE_CODE)
            cy.get('@taxes').eq(1).should('have.text', this.PROFILE_DESCRIPTION)
            cy.get('@taxes').eq(2).should('have.text', 'FSS Main')
        })
    }

    deleteTaxProfile() {
        cy.intercept('POST', '**/api/command?__type=batch:Tax%20ProfileDeleteCommand').as('delete_entry')
        cy.get('.taxprofile-list-view div[role="row"] div[role="gridcell"] div.jqx-checkbox-metro').first().click({force: true}).then(() => {
            cy.get('.taxprofile-list-view [title="Delete Selected Items (Delete)"]').click().then(() => {
                cy.get('.dialogs .ui-dialog-buttonset button[type="button"]').contains('delete').click().then(() => {
                    cy.wait('@delete_entry').then((xhr) => {
                        let status_msg = xhr.response.statusMessage
                        expect(status_msg).to.be.equal('OK')
                    })
                    // let delete_message = "Tax Profile record:"+this.PROFILE_CODE+"deleted successfully"
                    // cy.get('.toast-bottom-right .toast-message').should('be.visible').invoke('text').should('equal', delete_message)
                })
            })
        })
    }

    goToRatesTab() {
        cy.get('.taxprofile-list-view div[title="Rates"]').contains("Rates").click().then(() => {
            cy.get('.taxrate-list-view .gridWrapper').should('be.visible')
            cy.intercept('GET', '**/TaxRates').as('tax_rates')
            cy.wait('@tax_rates').then((xhr) => {
            let status_code = xhr.response.statusCode
            expect(status_code).to.equal(200)
         })
        })

    }


}
export default IndigoMainPage