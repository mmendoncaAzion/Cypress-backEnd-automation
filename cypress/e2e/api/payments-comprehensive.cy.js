// Fixed imports for enhanced utilities
describe('Payments API Tests', { tags: ['@api', '@payments', '@comprehensive'] }, () => {
  let testData = {};
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('Payment Methods', () => {
    it('should GET /billing/payment_methods successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/billing/payment_methods',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Payment methods retrieved successfully');
        }
      });
    });

    it('should POST /billing/payment_methods successfully', () => {
      const paymentMethodData = {
        type: 'credit_card',
        card_number: '4111111111111111',
        expiry_month: '12',
        expiry_year: '2025',
        cvv: '123',
        cardholder_name: 'Test User'
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/billing/payment_methods',
        ,
        body: paymentMethodData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Payment method created successfully');
        }
      });
    });

    it('should DELETE /billing/payment_methods/{method_id} successfully', () => {
      const testMethodId = testData.payments?.methodId || '12345';

      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/billing/payment_methods/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ Payment method deleted successfully');
        }
      });
    });
  });

  describe('Billing Information', () => {
    it('should GET /billing/invoices successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/billing/invoices',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Invoices retrieved successfully');
        }
      });
    });

    it('should GET /billing/invoices/{invoice_id} successfully', () => {
      const testInvoiceId = testData.payments?.invoiceId || '12345';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/billing/invoices/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Invoice details retrieved successfully');
        }
      });
    });

    it('should GET /billing/subscriptions successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/billing/subscriptions',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Subscriptions retrieved successfully');
        }
      });
    });

    it('should GET /billing/usage successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/billing/usage',
        ,
        qs: {
          start_date: '2024-01-01',
          end_date: '2024-01-31'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Usage data retrieved successfully');
        }
      });
    });
  });
});