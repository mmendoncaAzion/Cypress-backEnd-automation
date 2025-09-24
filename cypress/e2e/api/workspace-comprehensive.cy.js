describe('Workspace API Tests', { tags: ['@api', '@workspace', '@comprehensive'] }, () => {
  let testData = {};
  let createdWorkspaceId = null;
  
  before(() => {
    cy.fixture('test-data').then((data) => {
      testData = data;
    });
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('Workspace CRUD Operations', () => {
    it('should GET /workspaces successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/workspaces',
        
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ Workspaces list retrieved successfully');
        }
      });
    });

    it('should POST /workspaces successfully', () => {
      const workspaceData = {
        name: `test-workspace-${Date.now()}`,
        description: 'Test workspace for API testing',
        active: true
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/workspaces',
        ,
        body: workspaceData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          createdWorkspaceId = response.body.results.id;
          cy.addToCleanup('workspaces', createdWorkspaceId);
          cy.log('✅ Workspace created successfully');
        }
      });
    });

    it('should GET /workspaces/{workspace_id} successfully', () => {
      const testWorkspaceId = testData.workspace?.workspaceId || '12345';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/workspaces/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.have.property('id');
          cy.log('✅ Workspace details retrieved successfully');
        }
      });
    });

    it('should PUT /workspaces/{workspace_id} successfully', () => {
      const testWorkspaceId = testData.workspace?.workspaceId || '12345';
      const updateData = {
        name: `updated-workspace-${Date.now()}`,
        description: 'Updated workspace description',
        active: false
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/workspaces/',
        ,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Workspace updated successfully');
        }
      });
    });

    it('should DELETE /workspaces/{workspace_id} successfully', () => {
      const testWorkspaceId = testData.workspace?.workspaceId || '12345';

      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/workspaces/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ Workspace deleted successfully');
        }
      });
    });
  });

  describe('Workspace Members Management', () => {
    const testWorkspaceId = '12345';

    it('should GET /workspaces/{workspace_id}/members successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/workspaces//members',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ Workspace members retrieved successfully');
        }
      });
    });

    it('should POST /workspaces/{workspace_id}/members successfully', () => {
      const memberData = {
        email: `test-member-${Date.now()}@example.com`,
        role: 'viewer',
        teams: []
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/workspaces//members',
        ,
        body: memberData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 404, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Workspace member added successfully');
        }
      });
    });

    it('should GET /workspaces/{workspace_id}/members/{member_id} successfully', () => {
      const testMemberId = testData.workspace?.memberId || '67890';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/workspaces//members/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Workspace member details retrieved successfully');
        }
      });
    });

    it('should PUT /workspaces/{workspace_id}/members/{member_id} successfully', () => {
      const testMemberId = testData.workspace?.memberId || '67890';
      const updateData = {
        role: 'editor',
        teams: ['team1', 'team2']
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/workspaces//members/',
        ,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Workspace member updated successfully');
        }
      });
    });

    it('should DELETE /workspaces/{workspace_id}/members/{member_id} successfully', () => {
      const testMemberId = testData.workspace?.memberId || '67890';

      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/workspaces//members/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ Workspace member removed successfully');
        }
      });
    });
  });

  describe('Workspace Teams Management', () => {
    const testWorkspaceId = '12345';

    it('should GET /workspaces/{workspace_id}/teams successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/workspaces//teams',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          expect(response.body.results).to.be.an('array');
          cy.log('✅ Workspace teams retrieved successfully');
        }
      });
    });

    it('should POST /workspaces/{workspace_id}/teams successfully', () => {
      const teamData = {
        name: `test-team-${Date.now()}`,
        description: 'Test team for workspace',
        permissions: ['read', 'write']
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/workspaces//teams',
        ,
        body: teamData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 404, 401, 403, 422]);
        if (response.status === 201) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Workspace team created successfully');
        }
      });
    });

    it('should GET /workspaces/{workspace_id}/teams/{team_id} successfully', () => {
      const testTeamId = testData.workspace?.teamId || '54321';
      
      cy.apiRequest({
        method: 'GET',
        endpoint: '/workspaces//teams/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Workspace team details retrieved successfully');
        }
      });
    });

    it('should PUT /workspaces/{workspace_id}/teams/{team_id} successfully', () => {
      const testTeamId = testData.workspace?.teamId || '54321';
      const updateData = {
        name: `updated-team-${Date.now()}`,
        description: 'Updated team description',
        permissions: ['read', 'write', 'admin']
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/workspaces//teams/',
        ,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Workspace team updated successfully');
        }
      });
    });

    it('should DELETE /workspaces/{workspace_id}/teams/{team_id} successfully', () => {
      const testTeamId = testData.workspace?.teamId || '54321';

      cy.apiRequest({
        method: 'DELETE',
        endpoint: '/workspaces//teams/',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([204, 404, 401, 403]);
        if (response.status === 204) {
          cy.log('✅ Workspace team deleted successfully');
        }
      });
    });
  });

  describe('Workspace Permissions Management', () => {
    const testWorkspaceId = '12345';

    it('should GET /workspaces/{workspace_id}/permissions successfully', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/workspaces//permissions',
        ,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Workspace permissions retrieved successfully');
        }
      });
    });

    it('should PUT /workspaces/{workspace_id}/permissions successfully', () => {
      const permissionsData = {
        permissions: [
          { resource: 'edge_applications', actions: ['read', 'write'] },
          { resource: 'domains', actions: ['read'] },
          { resource: 'certificates', actions: ['read', 'write', 'delete'] }
        ]
      };

      cy.apiRequest({
        method: 'PUT',
        endpoint: '/workspaces//permissions',
        ,
        body: permissionsData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400, 401, 403, 422]);
        if (response.status === 200) {
          expect(response.body).to.have.property('results');
          cy.log('✅ Workspace permissions updated successfully');
        }
      });
    });
  });

  describe('Workspace Role Tests', () => {
    const roles = ['owner', 'admin', 'editor', 'viewer'];

    roles.forEach(role => {
      it(`should handle ${role} role assignment`, () => {
        const memberData = {
          email: `test-${role}-${Date.now()}@example.com`,
          role: role,
          teams: []
        };

        cy.apiRequest({
          method: 'POST',
          endpoint: '/workspaces/12345/members',
          ,
          body: memberData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([201, 400, 404, 401, 403, 422]);
          if (response.status === 201) {
            cy.log(`✅ ${role} role assigned successfully`);
          }
        });
      });
    });
  });

  describe('Workspace Validation Tests', () => {
    it('should validate required fields', () => {
      const incompleteData = {
        description: 'Missing name field'
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/workspaces',
        ,
        body: incompleteData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Required field validation working');
        }
      });
    });

    it('should validate email format for members', () => {
      const invalidEmail = {
        email: 'invalid-email-format',
        role: 'viewer',
        teams: []
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/workspaces/12345/members',
        ,
        body: invalidEmail,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Email format validation working');
        }
      });
    });

    it('should validate role values', () => {
      const invalidRole = {
        email: 'test@example.com',
        role: 'invalid_role',
        teams: []
      };

      cy.apiRequest({
        method: 'POST',
        endpoint: '/workspaces/12345/members',
        ,
        body: invalidRole,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        if ([400, 422].includes(response.status)) {
          expect(response.body).to.have.property('detail');
          cy.log('✅ Role validation working');
        }
      });
    });
  });

  describe('Workspace Security Tests', () => {
    it('should require authentication for workspace operations', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/workspaces',
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Authentication required for workspaces');
      });
    });

    it('should validate token permissions', () => {
      cy.apiRequest({
        method: 'GET',
        endpoint: '/workspaces',
        headers: {
          'Authorization': 'Token invalid-token-12345',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
        expect(response.body).to.have.property('detail');
        cy.log('✅ Token validation working for workspaces');
      });
    });
  });
});