// Fixed imports for enhanced utilities
/// <reference types="cypress" />

describe('Domains API V4 Tests', { tags: ['@api', '@migrated'] }, () => {
  let domainsApi
  let testDataFactory
  let createdDomains = []

  beforeEach(() => {
//     domainsApi = new DomainsApi() // TODO: Add proper import
    testDataFactory = new Azion()
    cy.logTestInfo('Domains API Tests', '/workspace/workspace/domains')
  })

  afterEach(() => {
    // Cleanup created domains
    createdDomains.forEach(domainId => {
      if (domainId) {
        domainsApi.deleteDomain(domainId).then((response) => {
          cy.log(`Cleaned up domain ${domainId}: ${response.status}`)
        })
      }
    })
    createdDomains = []
  })

  describe('List Domains', { tags: ['@api', '@migrated'] }, () => {
    it('should list domains successfully', () => {
      cy.logTestInfo('List Domains', 'GET /workspace/workspace/domains')

      domainsApi.listDomains().then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('results')
        expect(response.body.results).to.be.an('array')

        if (response.body.results.length > 0) {
          const firstDomain = response.body.results[0]
          expect(firstDomain).to.have.property('id')
          expect(firstDomain).to.have.property('name')
          expect(firstDomain.id).to.be.a('number')
          expect(firstDomain.name).to.be.a('string')
        }
      })
    })

    it('should support pagination', () => {
      cy.logTestInfo('Test Domain Pagination', 'GET /workspace/workspace/domains?page=1&page_size=5')

      domainsApi.listDomains(1, 5).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.results.length).to.be.at.most(5)

        return cy.wrap(response)
      })
    })
  })

  describe('Create Domain', { tags: ['@api', '@migrated'] }, () => {
    it('should create domain successfully', () => {
      cy.logTestInfo('Create Domain', 'POST /workspace/workspace/domains')

      const domainData = testDataFactory.generateDomainData()

      domainsApi.createDomain(domainData).then((response) => {
        expect(response.status).to.be.oneOf([200, 201])
        expect(response.body).to.have.property('results')
        expect(response.body.results).to.have.property('id')
        expect(response.body.results.name).to.equal(domainData.name)

        createdDomains.push(response.body.results.id)
        cy.wrap(response.body.results.id).as('createdDomainId')
      })
    })

    it('should handle invalid domain data', () => {
      cy.logTestInfo('Handle Invalid Domain Data', 'POST /workspace/workspace/domains')

      const invalidData = {
        name: '', // Empty name
        invalid_field: 'invalid_value'
      }

      domainsApi.createDomain(invalidData).then((response) => {
        expect(response.status).to.be.oneOf([400, 422])

        if (response.body.errors || response.body.info) {
          expect(response.body.errors || response.body.info).to.be.an('array')
        }
      })
    })

    it('should validate domain name format', () => {
      cy.logTestInfo('Validate Domain Name Format', 'POST /workspace/workspace/domains')

      const invalidDomainData = {
        name: 'invalid-domain-name-without-tld',
        cname_access_only: false
      }

      domainsApi.createDomain(invalidDomainData).then((response) => {
        expect(response.status).to.be.oneOf([400, 422])

        return cy.wrap(response)
      })
    })
  })

  describe('Get Domain', { tags: ['@api', '@migrated'] }, () => {
    it('should retrieve specific domain', function() {
      cy.logTestInfo('Get Specific Domain', 'GET /workspace/workspace/domains/{id}')

      const domainData = testDataFactory.generateDomainData()

      domainsApi.createDomain(domainData).then((createResponse) => {
        const domainId = createResponse.body.results.id
        createdDomains.push(domainId)

        domainsApi.getDomain(domainId).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.have.property('results')
          expect(response.body.results.id).to.equal(domainId)
          expect(response.body.results.name).to.equal(domainData.name)

          return cy.wrap(response)
        })
      })
    })

    it('should handle non-existent domain ID', () => {
      cy.logTestInfo('Handle Non-existent Domain', 'GET /workspace/workspace/domains/999999')

      domainsApi.getDomain(999999).then((response) => {
        expect(response.status).to.eq(404)
        expect(response.body).to.have.property('detail')

        return cy.wrap(response)
      })
    })
  })

  describe('Update Domain', { tags: ['@api', '@migrated'] }, () => {
    it('should update domain successfully', function() {
      cy.logTestInfo('Update Domain', 'PUT /workspace/workspace/domains/{id}')

      const domainData = testDataFactory.generateDomainData()

      domainsApi.createDomain(domainData).then((createResponse) => {
        const domainId = createResponse.body.results.id
        createdDomains.push(domainId)

        const updateData = {
          name: `updated-${domainData.name}`,
          cname_access_only: true
        }

        domainsApi.updateDomain(domainId, updateData).then((response) => {
          expect(response.status).to.be.oneOf([200, 202])
          expect(response.body.results.name).to.equal(updateData.name)
          expect(response.body.results.cname_access_only).to.be.true

          return cy.wrap(response)
        })
      })
    })

    it('should handle partial updates', function() {
      cy.logTestInfo('Handle Partial Domain Updates', 'PUT /workspace/workspace/domains/{id}')

      const domainData = testDataFactory.generateDomainData()

      domainsApi.createDomain(domainData).then((createResponse) => {
        const domainId = createResponse.body.results.id
        createdDomains.push(domainId)

        const partialUpdate = {
          cname_access_only: true
        }

        domainsApi.updateDomain(domainId, partialUpdate).then((response) => {
          expect(response.status).to.be.oneOf([200, 202])
          expect(response.body.results.cname_access_only).to.be.true

          return cy.wrap(response)
        })
      })
    })
  })

  describe('Delete Domain', { tags: ['@api', '@migrated'] }, () => {
    it('should delete domain successfully', function() {
      cy.logTestInfo('Delete Domain', 'DELETE /workspace/workspace/domains/{id}')

      const domainData = testDataFactory.generateDomainData()

      domainsApi.createDomain(domainData).then((createResponse) => {
        const domainId = createResponse.body.results.id

        domainsApi.deleteDomain(domainId).then((response) => {
          expect(response.status).to.be.oneOf([200, 202, 204])

          // Verify deletion
          domainsApi.getDomain(domainId).then((getResponse) => {
            expect(getResponse.status).to.eq(404)

            return cy.wrap(response)
          })
        })
      })
    })

    it('should handle deletion of non-existent domain', () => {
      cy.logTestInfo('Handle Non-existent Domain Deletion', 'DELETE /workspace/workspace/domains/999999')

      domainsApi.deleteDomain(999999).then((response) => {
        expect(response.status).to.be.oneOf([404, 204])

        return cy.wrap(response)
      })
    })
  })

  describe('Domain Validation', { tags: ['@api', '@migrated'] }, () => {
    it('should validate domain name uniqueness', () => {
      cy.logTestInfo('Validate Domain Uniqueness', 'POST /workspace/workspace/domains')

      const domainData = testDataFactory.generateDomainData()

      // Create first domain
      domainsApi.createDomain(domainData).then((firstResponse) => {
        expect(firstResponse.status).to.be.oneOf([200, 201])
        createdDomains.push(firstResponse.body.results.id)

        // Try to create another domain with same name
        domainsApi.createDomain(domainData).then((secondResponse) => {
          expect(secondResponse.status).to.be.oneOf([400, 409, 422])
        })
      })
    })

    it('should validate CNAME access only setting', () => {
      cy.logTestInfo('Validate CNAME Access Only', 'POST /workspace/workspace/domains')

      const domainData = {
        ...testDataFactory.generateDomainData(),
        cname_access_only: true
      }

      domainsApi.createDomain(domainData).then((response) => {
        expect(response.status).to.be.oneOf([200, 201])
        expect(response.body.results.cname_access_only).to.be.true

        createdDomains.push(response.body.results.id)

        return cy.wrap(response)
      })
    })
  })

  describe('Error Handling', { tags: ['@api', '@migrated'] }, () => {
    it('should handle unauthorized access', () => {
      cy.logTestInfo('Handle Unauthorized Domain Access', 'GET /workspace/workspace/domains')

      cy.azionApiRequest('GET', '/workspace/workspace/domains', null, {

      }).then((response) => {
        expect(response.status).to.eq(401)
        expect(response.body).to.have.property('detail')

        return cy.wrap(response)
      })
    })

    it('should handle method not allowed', () => {
      cy.logTestInfo('Handle Method Not Allowed', 'PATCH /workspace/workspace/domains')

      cy.azionApiRequest('PATCH', '/workspace/workspace/domains').then((response) => {
        expect(response.status).to.eq(405)

        return cy.wrap(response)
      })
    })

    it('should validate response time', () => {
      cy.logTestInfo('Validate Domain Response Time', 'GET /workspace/workspace/domains')

      domainsApi.listDomains().then((response) => {
        cy.validateResponseTime(response, 5000)
      })
    })
  })
})
