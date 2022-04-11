describe('Login', () => {
  it('Gets, types and asserts', () => {
    cy.visit('https://shcs.serums.cs.st-andrews.ac.uk/?jwt_access=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl' +
      '90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjUxNjU3OTExLCJqdGkiOiIyYjJiMWExNmExY2M0M2UwOGJlYzgzZDVlODA4YWE1YyIsInVzZXJJ' +
      'RCI6MjE1LCJpc3MiOiJTZXJ1bXNBdXRoZW50aWNhdGlvbiIsImlhdCI6MTY0OTA2NTkxMSwic3ViIjoidGVzdHBhdGllbnRAdXN0YW4uY2' +
      '9tIiwiZ3JvdXBJRHMiOlsiUEFUSUVOVCJdLCJvcmdJRCI6IlVTVEFOIiwiZGVwdElEIjpudWxsLCJkZXB0TmFtZSI6bnVsbCwic3RhZmZJ' +
      'RCI6bnVsbCwibmFtZSI6bnVsbCwiYXVkIjoiaHR0cHM6Ly9zaGNzLnNlcnVtcy5jcy5zdC1hbmRyZXdzLmFjLnVrLyJ9.eIS2Fm15PaNyE' +
      'xot2GL5w9Ok1gSQnoGeEnmCegssMOE&jwt_refresh=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcm' +
      'VzaCIsImV4cCI6MTY4MDYwMTkxMSwianRpIjoiODdhYzg3ZmExYWNhNDIzZDk1NzIxMmJiNWM4NzhiNzEiLCJ1c2VySUQiOjIxNSwiaXNz' +
      'IjoiU2VydW1zQXV0aGVudGljYXRpb24iLCJpYXQiOjE2NDkwNjU5MTEsInN1YiI6InRlc3RwYXRpZW50QHVzdGFuLmNvbSIsImdyb3VwSU' +
      'RzIjpbIlBBVElFTlQiXSwib3JnSUQiOiJVU1RBTiIsImRlcHRJRCI6bnVsbCwiZGVwdE5hbWUiOm51bGwsInN0YWZmSUQiOm51bGwsIm5h' +
      'bWUiOm51bGwsImF1ZCI6Imh0dHBzOi8vc2hjcy5zZXJ1bXMuY3Muc3QtYW5kcmV3cy5hYy51ay8ifQ.DLnrbH9WZosXBR7dBT5YLpw2zwV' +
      '8-2AccBquGK_EBX4')

    cy.contains('Access').click()
    cy.wait(5000)

    //Filling in Rule properties
    cy.contains('Create').click()
    cy.get('[id^=action]', {timeout: 100000}).focus().select('ALLOW')
    cy.get('[id^=granteeType]').focus().select('INDIVIDUAL')
    cy.get('[id^=granteeId]').focus().type('Char').type('{downarrow}').type('{enter}').click()
    cy.get('[type="date"]').type('2028-08-08')

    //Creating Rule
    cy.contains('Personal Data').click()
    cy.wait(5000)
    cy.contains('Patient detail', {timeout: 10000}).click()
    cy.wait(5000)

    cy.get('[id^=submitRule]', {timeout: 10000}).click()
    cy.wait(5000)
    cy.url().should('include', '/?jwt_access')

  })
})
