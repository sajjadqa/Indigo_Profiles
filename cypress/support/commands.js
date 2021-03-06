// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })


let LOCAL_STORAGE_MEMORY = {};

Cypress.Commands.add("saveLocalStorage", () => {
  Object.keys(localStorage).forEach(key => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key];
  })
})

Cypress.Commands.add("restoreLocalStorage", () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
  })
})

// Cypress.Commands.add('loginViaApi', (user) => {
//   cy.request({
//     method: 'POST',
//     url: 'https://indigo.shireburn.com/home',
//     body: {
//       userName: user.username,
//       password: user.password,
//     },
//   }).then(($response) => {
//     cy.setCookie('userID', $response.body.userId)
//     cy.setCookie('userName', $response.body.username)
//     cy.setCookie('OAuth', $response.body.token)
//     cy.setCookie('expires', $response.body.expires)
//     expect($response.status).to.eq(200)
//   })
// })

Cypress.Commands.add('IdentityServerAPILogin', (user) => {
  cy.server();
  cy.request('GET', 'https://indigo-testing.shireburn.com/Home?ReturnUrl=%2F').then(response => {
    // Parses the html response to fetch the CSRF token
    const htmlDocument = document.createElement('html');
    htmlDocument.innerHTML = response.body;
    const loginForm = htmlDocument.getElementsByTagName('form')[0];
    const requestVerificationToken = loginForm.elements.__RequestVerificationToken.value;

    cy.request({
      method: 'POST',
      url: 'https://indigo-testing.shireburn.com/home',
      followRedirect: false,
      form: true,
      body: {
        ReturnUrl: '',
        userName: user.username,
        password: user.password,
        __RequestVerificationToken: requestVerificationToken
      }
    });
  });
});