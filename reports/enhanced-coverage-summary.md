# Enhanced Coverage Validation Report

**Generated**: 9/23/2025, 11:07:58 AM  
**Total Endpoints**: 239  
**Total Tests**: 0  
**Coverage**: 0%

## 📊 Overall Summary

| Metric | Value |
|--------|-------|
| **Endpoints in Postman** | 239 |
| **API Calls in Tests** | 0 |
| **Covered Endpoints** | 0 |
| **Missing Endpoints** | 238 |
| **Extra Tests** | 0 |
| **Coverage Percentage** | 0% |

## 🎯 Coverage by Context

| Context | Total | Covered | Missing | Coverage |
|---------|-------|---------|---------|----------|
| **account** | 12 | 0 | 12 | 0% |
| **auth** | 19 | 0 | 19 | 0% |
| **payments** | 7 | 0 | 7 | 0% |
| **workspace** | 119 | 0 | 118 | 0% |
| **dns** | 0 | 0 | 0 | 0% |
| **data_stream** | 13 | 0 | 13 | 0% |
| **digital_certificates** | 14 | 0 | 14 | 0% |
| **edge_application** | 0 | 0 | 0 | 0% |
| **edge_connector** | 6 | 0 | 6 | 0% |
| **edge_firewall** | 3 | 0 | 3 | 0% |
| **edge_functions** | 5 | 0 | 5 | 0% |
| **edge_sql** | 5 | 0 | 5 | 0% |
| **edge_storage** | 2 | 0 | 2 | 0% |
| **iam** | 0 | 0 | 0 | 0% |
| **orchestrator** | 27 | 0 | 27 | 0% |
| **identity** | 7 | 0 | 7 | 0% |

## ❌ Missing Endpoints (238)

- `GET account/accounts/{{accountId}}/info` - Retrieve account information details
- `PUT account/accounts/{{accountId}}/info` - Update account information details
- `GET account/accounts/{{accountId}}` - Retrieve account details
- `PUT account/accounts/:id` - Update account details
- `PATCH account/accounts/:id` - Partially update account details
- `GET account/accounts` - List accounts
- `POST account/accounts` - Create a new account
- `GET account/account` - Retrieve logged account details
- `PUT account/account` - Update logged account details
- `PATCH account/account` - Partially update logged account details
- `GET auth/login/method` - Retrieve user login method
- `POST auth/login` - Retrieve user JWT tokens
- `DELETE auth/mfa/totp/:id` - Destroy a TOTP device
- `GET auth/mfa/totp` - List of TOTP devices
- `POST auth/mfa/totp` - Create a TOTP device
- `POST auth/token` - Refresh user JWT access token
- `POST auth/revoke` - Revoke user JWT refresh token
- `POST auth/verify` - Retrieve user JWT tokens by MFA auth
- `GET auth/policies/lockout` - Get Lockout Policy
- `PUT auth/policies/lockout` - Put Lockout Policy
- `GET auth/policies/:id` - Retrieve details from a policy
- `PUT auth/policies/:id` - Update a policy
- `PATCH auth/policies/:id` - Partially update a policy
- `DELETE auth/policies/:id` - Destroy a policy
- `GET auth/policies/session` - Get Session Timeout Policy
- `PUT auth/policies/session` - Put Session Timeout Policy
- `GET auth/policies` - List of account policies
- `POST auth/policies` - Create a new policy
- `GET payments/credit_cards/{{creditCardId}}` - Retrieve details from a credit card
- `PATCH payments/credit_cards/:id` - Partially update a credit card
- `DELETE payments/credit_cards/:id` - Destroy a credit card
- `GET payments/credit_cards` - List of the credit cards
- `POST payments/credit_cards` - Create a new credit card
- `POST payments/credits` - Add credits using the default credit card
- `GET payments/history` - List of the payment history
- `GET workspace/custom_pages/{{customPageId}}` - Retrieve details of a Custom Page
- `PUT workspace/custom_pages/{{customPageId}}` - Update a Custom Page
- `PATCH workspace/custom_pages/{{customPageId}}` - Partially update a Custom Page
- `DELETE workspace/custom_pages/{{deleteId}}` - Destroy a Custom Page
- `GET workspace/custom_pages` - List Custom Pages
- `POST workspace/custom_pages` - Create a Custom Page
- `GET workspace/network_lists/{{networkId}}` - Retrieve details of a Network List
- `PUT workspace/network_lists/{{networkId}}` - Update a Network List
- `PATCH workspace/network_lists/{{networkId}}` - Partially update a Network List
- `DELETE workspace/network_lists/{{networkId}}` - Destroy a Network List
- `GET workspace/network_lists` - List Network Lists
- `POST workspace/network_lists` - Create a Network List
- `POST workspace/purge/url` - Create a Purge Request
- `GET workspace/workloads/{{workloadId}}/deployments/{{workloadDeploymentsId}}` - Retrieve details of a Workload Deployment
- `PUT workspace/workloads/{{workloadId}}/deployments/{{workloadDeploymentsId}}` - Update a Workload Deployment
- `PATCH workspace/workloads/{{workloadId}}/deployments/{{workloadDeploymentsId}}` - Partially update a Workload Deployment
- `GET workspace/workloads/{{workloadId}}/deployments` - List Workload Deployments
- `GET workspace/workloads/{{workloadId}}` - Retrieve details of an Workload
- `PUT workspace/workloads/{{workloadId}}` - Update an Workload
- `PATCH workspace/workloads/{{workloadId}}` - Partially update an Workload
- `DELETE workspace/workloads/{{workloadId}}` - Destroy an Workload
- `GET workspace/workloads` - List Workloads
- `POST workspace/workloads` - Create an Workload
- `GET workspace/dns/zones/{{zoneId}}/dnssec` - Retrieve details of a DNSSEC
- `PUT workspace/dns/zones/{{zoneId}}/dnssec` - Update a DNSSEC
- `PATCH workspace/dns/zones/{{zoneId}}/dnssec` - Partially update a DNSSEC
- `GET workspace/dns/zones/{{zoneId}}/records/{{recordId}}` - Retrieve details of a DNS Record
- `PUT workspace/dns/zones/{{zoneId}}/records/{{recordId}}` - Update a DNS Record
- `PATCH workspace/dns/zones/{{zoneId}}/records/{{recordId}}` - Partially update a DNS Record
- `DELETE workspace/dns/zones/{{zoneId}}/records/{{recordId}}` - Destroy a DNS Record
- `GET workspace/dns/zones/{{zoneId}}/records` - List DNS Records
- `POST workspace/dns/zones/{{zoneId}}/records` - Create a DNS Record
- `GET workspace/dns/zones/{{zoneId}}` - Retrieve details of a DNS Zone
- `PUT workspace/dns/zones/{{zoneId}}` - Update a DNS Zone
- `PATCH workspace/dns/zones/{{zoneId}}` - Partially update a DNS Zone
- `DELETE workspace/dns/zones/{{zoneId}}` - Destroy a DNS Zone
- `GET workspace/dns/zones` - List DNS Zones
- `POST workspace/dns/zones` - Create a DNS Zone
- `GET data_stream/templates/{{templateId}}` - Retrieve details of a template
- `PUT data_stream/templates/{{dataSetId}}` - Update a template
- `PATCH data_stream/templates/{{dataSetId}}` - Partially update a template
- `DELETE data_stream/data_sets/{{dataSetId}}` - Destroy a template
- `GET data_stream/templates` - List Template
- `POST data_stream/templates` - Create a Template
- `GET data_stream/data_sources` - List of Data Sources
- `GET data_stream/streams/{{dataStreamingId}}` - Retrieve details of a Data Stream
- `PUT data_stream/streams/{{dataStreamingId}}` - Update a Data Stream
- `PATCH data_stream/streams/{{dataStreamingId}}` - Partially update a Data Stream
- `DELETE data_stream/streams/{{dataStreamingId}}` - Destroy a Data Stream
- `GET data_stream/streams` - List Data Streams
- `POST data_stream/streams` - Create a Data Stream
- `POST digital_certificates/certificates/request` - Create a certificate request (CR)
- `GET digital_certificates/certificates/{{certificateId}}` - Retrieve details from a certificate
- `PUT digital_certificates/certificates/{{certificateId}}` - Update a certificate
- `PATCH digital_certificates/certificates/{{certificateId}}` - Partially update a certificate
- `DELETE digital_certificates/certificates/{{certificateId}}` - Destroy a certificate
- `GET digital_certificates/certificates` - List certificates
- `POST digital_certificates/certificates` - Create a certificate
- `GET digital_certificates/crls/{{crlsId}}` - Retrieve details from a certificate revocation lists (CRL)
- `PUT digital_certificates/crls/{{crlsId}}` - Update a certificate revocation lists (CRL)
- `PATCH digital_certificates/crls/{{crlsId}}` - Update a certificate revocation lists (CRL)
- `DELETE digital_certificates/crls/{{crlsId}}` - Destroy a certificate revocation lists (CRL)
- `GET digital_certificates/crls` - List certificate revocation lists (CRL)
- `POST digital_certificates/crls` - Create a certificate revocation lists (CRL)
- `POST digital_certificates/csr` - Create a certificate signing request (CSR)
- `POST workspace/applications/{{edgeApplicationId}}/clone` - Clone an Edge Application
- `GET workspace/applications/{{edgeApplicationId}}` - Retrieve details of an Edge Application
- `PUT workspace/applications/{{edgeApplicationId}}` - Update an Edge Application
- `PATCH workspace/applications/{{edgeApplicationId}}` - Partially update an Edge Application
- `DELETE workspace/applications/{{edgeApplicationId}}` - Destroy an Edge Application
- `GET workspace/applications/{{edgeApplicationId}}/cache_settings/{{edgeCacheSettingsId}}` - Retrieve details of an Edge Applications Cache Setting
- `PUT workspace/applications/{{edgeApplicationId}}/cache_settings/{{edgeCacheSettingsId}}` - Update an Edge Applications Cache Setting
- `PATCH workspace/applications/{{edgeApplicationId}}/cache_settings/{{edgeCacheSettingsId}}` - Partially update an Edge Applications Cache Setting
- `DELETE workspace/applications/{{edgeApplicationId}}/cache_settings/{{edgeCacheSettingsId}}` - Destroy an Edge Applications Cache Setting
- `GET workspace/applications/{{edgeApplicationId}}/cache_settings` - List all Edge Applications Cache Settings
- `POST workspace/applications/{{edgeApplicationId}}/cache_settings` - Create an Edge Applications Cache Setting
- `GET workspace/applications/{{edgeApplicationId}}/device_groups/{{deviceGroupId}}` - Retrieve details of a Device Group
- `PUT workspace/applications/{{edgeApplicationId}}/device_groups/{{deviceGroupId}}` - Update an Edge Applications Device Group
- `PATCH workspace/applications/{{edgeApplicationId}}/device_groups/{{deviceGroupId}}` - Partially update an Edge Applications Device Group
- `DELETE workspace/applications/{{edgeApplicationId}}/device_groups/{{deviceGroupId}}` - Destroy an Edge Applications Device Group
- `GET workspace/applications/{{edgeApplicationId}}/device_groups` - List Edge Applications Device Groups
- `POST workspace/applications/{{edgeApplicationId}}/device_groups` - Create an Edge Applications Device Group
- `GET workspace/applications/{{edgeApplicationId}}/functions/{{edgeApplicationFunctionId}}` - Retrieve details of an Edge Application Function Instance
- `PUT workspace/applications/{{edgeApplicationId}}/functions/{{edgeApplicationFunctionId}}` - Update an Edge Application Function Instance
- `PATCH workspace/applications/{{edgeApplicationId}}/functions/{{edgeApplicationFunctionId}}` - Partially update an Edge Application Function Instance
- `DELETE workspace/applications/{{edgeApplicationId}}/functions/{{edgeApplicationFunctionId}}` - Destroy an Edge Application Function Instance
- `GET workspace/applications/{{edgeApplicationId}}/functions` - List Function Instances
- `POST workspace/applications/{{edgeApplicationId}}/functions` - Create an Edge Application Function Instance
- `GET workspace/applications/{{edgeApplicationId}}/request_rules` - List Edge Application Request Rules
- `GET workspace/applications/{{edgeApplicationId}}/request_rules/{{ruleId}}` - Retrieve details of an Edge Application Rule
- `PUT workspace/applications/{{edgeApplicationId}}/request_rules/{{ruleId}}` - Update an Edge Application Rule
- `PATCH workspace/applications/{{edgeApplicationId}}/request_rules/{{ruleId}}` - Partially update an Edge Application Rule
- `DELETE workspace/applications/{{edgeApplicationId}}/request_rules/{{ruleId}}` - Destroy an Edge Application Rule
- `POST workspace/applications/{{edgeApplicationId}}/request_rules` - Create an Edge Application Request Rule
- `PUT workspace/applications/{{edgeApplicationId}}/rules/order` - Ordering Edge Application Response Rules
- `GET workspace/applications/{{edgeApplicationId}}/rules` - List Edge Application Response Rules
- `POST workspace/applications/{{edgeApplicationId}}/response_rules` - Create an Edge Application Response Rule
- `GET workspace/applications/{{edgeApplicationId}}/response_rules/{{ruleId}}` - Retrieve details of an Edge Application Response Rule
- `PUT workspace/applications/{{edgeApplicationId}}/response_rules/{{ruleId}}` - Update an Edge Application Response Rule
- `PATCH workspace/applications/{{edgeApplicationId}}/response_rules/{{ruleId}}` - Partially update an Edge Application Response Rule
- `DELETE workspace/applications/{{edgeApplicationId}}/response_rules/{{ruleId}}` - Destroy an Edge Application Response Rule
- `GET workspace/applications` - List Edge Applications
- `POST workspace/applications` - Create an Edge Application
- `GET edge_connector/connectors/{{connector_id}}` - Retrieve details of an Edge Connector
- `PUT edge_connector/connectors/{{connector_id}}` - Update an Edge Connector
- `PATCH edge_connector/connectors/{{connector_id}}` - Partially update an Edge Connector
- `DELETE edge_connector/connectors/{{connector_id}}` - Destroy an Edge Connector
- `GET edge_connector/connectors` - List Edge Connectors
- `POST edge_connector/connectors` - Create an Edge Connector
- `POST workspace/firewalls/{{edgeFirewallId}}/clone` - Clone an Edge Firewall
- `GET workspace/firewalls/{{edgeFirewallId}}` - Retrieve details from an Edge Firewall
- `PUT workspace/firewalls/{{edgeFirewallId}}` - Update an Edge Firewall
- `PATCH workspace/firewalls/{{edgeFirewallId}}` - Partially update an Edge Firewall
- `DELETE workspace/firewalls/{{edgeFirewallId}}` - Destroy an Edge Firewall
- `GET workspace/firewalls/{{edgeFirewallId}}/functions/{{edgeFirewallFunctionId}}` - Retrieve details of an Edge Firewall Function
- `PUT workspace/firewalls/{{edgeFirewallId}}/functions/{{edgeFirewallFunctionId}}` - Update an Edge Firewall Function
- `PATCH workspace/firewalls/{{edgeFirewallId}}/functions/{{edgeFirewallFunctionId}}` - Partially update an Edge Firewall Function
- `DELETE workspace/firewalls/{{edgeFirewallId}}/functions/{{edgeFirewallFunctionId}}` - Destroy an Edge Firewall Function
- `GET workspace/firewalls/{{edgeFirewallId}}/functions` - List Edge Firewall Function
- `POST workspace/firewalls/{{edgeFirewallId}}/functions` - Create an Edge Firewall Function
- `GET workspace/firewalls/{{edgeFirewallId}}/rules/{{ruleId}}` - Retrieve details of an Edge Firewall Rule
- `PUT workspace/firewalls/{{edgeFirewallId}}/rules/{{ruleId}}` - Update an Edge Firewall Rule
- `PATCH workspace/firewalls/{{edgeFirewallId}}/rules/{{ruleId}}` - Partially update an Edge Firewall Rule
- `DELETE workspace/firewalls/{{edgeFirewallId}}/rules/{{ruleId}}` - Destroy an Edge Firewall Rule
- `PUT workspace/firewalls/{{edgeFirewallId}}/rules/order` - Ordering Edge Firewall Rules
- `GET workspace/firewalls/{{edgeFirewallId}}/request_rules` - List Edge Firewall Rules
- `POST workspace/firewalls/{{edgeFirewallId}}/request_rules` - Create an Edge Firewall Rule
- `GET workspace/firewalls` - List Edge Firewalls
- `POST workspace/firewalls` - Create an Edge Firewall
- `POST edge_firewall/wafs/{{wafId}}/clone` - Clone a Web Application Firewall (WAF)
- `GET workspace/wafs/{{wafId}}` - Retrieve details from a Web Application Firewall (WAF)
- `PUT workspace/wafs/{{wafId}}` - Update a Web Application Firewall (WAF)
- `PATCH workspace/wafs/{{wafId}}` - Partially update a Web Application Firewall (WAF)
- `DELETE edge_firewall/wafs/{{wafId}}` - Destroy a Web Application Firewall (WAF)
- `GET workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}}` - Retrieve details of an Exception from a Web Application Firewall (WAF)
- `PUT workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}}` - Update an Exception for a Web Application Firewall (WAF)
- `PATCH workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}}` - Partially update an Exception for a Web Application Firewall (WAF)
- `DELETE workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}}` - Destroy an Exception from a Web Application Firewall (WAF)
- `GET edge_firewall/wafs/{{wafId}}/exceptions` - List Exceptions for a Web Application Firewall (WAF)
- `POST workspace/wafs/{{wafId}}/exceptions` - Create an Exception for a Web Application Firewall (WAF)
- `GET workspace/wafs` - List Web Application Firewalls (WAFs)
- `POST workspace/wafs` - Create a Web Application Firewall (WAF)
- `GET edge_functions/functions/{{functionId}}` - Retrieve details of an Edge Function
- `PUT edge_functions/functions/{{functionId}}` - Update an Edge Function
- `PATCH edge_functions/functions/{{functionId}}` - Partially update an Edge Function
- `DELETE edge_functions/functions/{{functionId}}` - Destroy an Edge Function
- `GET edge_functions/functions` - List Edge Functions
- `POST workspace/functions` - Create an Edge Function
- `POST edge_sql/databases/{{databaseId}}/query` - Execute a query into a database
- `GET edge_sql/databases/{{databaseId}}` - Retrieve details from a database
- `DELETE edge_sql/databases/{{databaseId}}` - Destroy a database
- `GET edge_sql/databases` - List databases
- `POST edge_sql/databases` - Create a database
- `PATCH wrokspace/storage/buckets/{{bucketName}}` - Update bucket info
- `DELETE worksapce/storage/buckets/{{bucketName}}` - Delete a bucket
- `GET workspace/storage/buckets/{{bucketName}}/objects/{{objectKey}}` - Download object
- `POST workspace/storage/buckets/{{bucketName}}/objects/{{objectKey}}` - Create new object key
- `PUT workspace/storage/buckets/{{bucketName}}/objects/{{objectKey}}` - Update the object key
- `DELETE workspace/storage/buckets/{{bucketName}}/objects/{{objectKey}}` - Delete object key
- `GET workspace/storage/buckets/{{bucketName}}/objects` - List buckets objects
- `GET workspace/storage/buckets` - List buckets
- `POST workspace/storage/buckets` - Create a new bucket
- `GET workspace/storage/credentials/{{credentialId}}` - Retrieve details from a credential
- `DELETE workspace/storage/credentials/{{credentialId}}` - Delete a Credential
- `GET workspace/storage/credentials` - List credentials
- `POST workspace/storage/credentials` - Create a new credential
- `POST iam/mfa/totp` - Create a TOTP device
- `POST iam/users` - Create User
- `POST iam/accounts` - Create new account
- `GET orchestrator/edge_nodes/:nodeId/groups` - List Edge Node Groups by id
- `POST orchestrator/edge_nodes/:nodeId/groups` - Bind Node Group
- `GET orchestrator/edge_nodes/:nodeId/services/:bindId` - Retrieve details of an Edge Node Service Bind
- `DELETE orchestrator/edge_nodes/:nodeId/services/:bindId` - Unbind Node Service
- `GET orchestrator/edge_nodes/:nodeId/services` - List Node Services
- `POST edge_orchestrator/edge_nodes/:nodeId/services` - Bind Node Service
- `GET edge_orchestrator/edge_nodes/:nodeId` - Retrieve details of an Edge Node
- `PUT orchestrator/edge_nodes/:nodeId` - Update an Edge Node
- `PATCH orchestrator/edge_nodes/:nodeId` - Partially update an Edge Node
- `DELETE orchestrator/edge_nodes/:nodeId` - Delete an Edge Node
- `DELETE edge_orchestrator/edge_nodes/groups/{{groupId}}` - Remove Node Group
- `GET edge_orchestrator/edge_nodes/groups` - List Edge Node Groups
- `POST edge_orchestrator/edge_nodes/groups` - Create Edge Node Group
- `GET edge_orchestrator/edge_nodes` - List Edge Nodes
- `GET edge_orchestrator/edge_services/{{serviceId}}/resources/{{resourceId}}/content` - Retrieve content of a Resource
- `PUT orchestrator/edge_services/:serviceId/resources/:resourceId/content` - Upload content of a Resource
- `GET orchestrator/edge_services/:serviceId/resources/:resourceId` - Retrieve details of a Resource
- `PUT orchestrator/edge_services/:serviceId/resources/:resourceId` - Update Resource
- `DELETE orchestrator/edge_services/:serviceId/resources/:resourceId` - Delete Resource
- `GET edge_orchestrator/edge_services/{{serviceId}}/resources` - List Service Resources
- `POST edge_orchestrator/edge_services/{{serviceId}}/resources` - Create Service Resource
- `GET edge_orchestrator/edge_services/{{serviceId}}` - Retrieve details of an Edge Service
- `PUT edge_orchestrator/edge_services/{{serviceId}}` - Update an Edge Service
- `PATCH edge_orchestrator/edge_services/{{serviceId}}` - Partially update an Edge Service
- `DELETE edge_orchestrator/edge_services/{{serviceId}}` - Destroy an Edge Service
- `GET edge_orchestrator/edge_services` - List Edge Services
- `POST edge_orchestrator/edge_services` - Create Edge Service
- `DELETE identity/users/{{userId}}/lockout` - Unlock user
- `GET identity/users/{{userId}}` - Retrieve details from a user
- `PUT identity/users/{{userId}}` - Update a user
- `PATCH identity/users/{{userId}}` - Partially update a user
- `DELETE identity/users/{{userId}}` - Destroy a user
- `GET identity/users` - List of the account users
- `POST identity/users` - Create a new user

## ➕ Extra Tests (0)

No extra tests found.

## 📈 Recommendations

🔴 **Needs Improvement** - Significant coverage gaps

---
*Generated by Enhanced Coverage Validator*