# Context Coverage Analysis Report

**Generated**: 9/23/2025, 11:05:00 AM  
**Total Contexts**: 16  
**Overall Coverage**: 63%

## 📊 Summary

| Metric | Value |
|--------|-------|
| **Total Endpoints** | 239 |
| **Total Tests** | 1301 |
| **Covered Endpoints** | 151 |
| **Coverage Percentage** | 63% |

## 🎯 Coverage by Context

| Context | Endpoints | Tests | Coverage |
|---------|-----------|-------|----------|
| **account** | 12 | 1121 | 100% |
| **auth** | 19 | 12 | 63% |
| **payments** | 7 | 12 | 100% |
| **workspace** | 23 | 12 | 52% |
| **dns** | 15 | 12 | 80% |
| **data_stream** | 13 | 12 | 92% |
| **digital_certificates** | 14 | 12 | 86% |
| **edge_application** | 39 | 12 | 31% |
| **edge_connector** | 6 | 12 | 100% |
| **edge_firewall** | 33 | 12 | 36% |
| **edge_functions** | 6 | 12 | 100% |
| **edge_sql** | 5 | 12 | 100% |
| **edge_storage** | 13 | 12 | 92% |
| **iam** | 0 | 12 | 0% |
| **orchestrator** | 27 | 12 | 44% |
| **identity** | 7 | 12 | 100% |

## ❌ Coverage Gaps


### auth
**Missing**: 7 endpoints

- `PATCH auth/policies/:id` - Partially update a policy
- `DELETE auth/policies/:id` - Destroy a policy
- `GET auth/policies/session` - Get Session Timeout Policy
- `PUT auth/policies/session` - Put Session Timeout Policy
- `GET auth/policies` - List of account policies
- `POST auth/policies` - Create a new policy
- `POST iam/mfa/totp` - Create a TOTP device


### workspace
**Missing**: 11 endpoints

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


### dns
**Missing**: 3 endpoints

- `DELETE workspace/dns/zones/{{zoneId}}` - Destroy a DNS Zone
- `GET workspace/dns/zones` - List DNS Zones
- `POST workspace/dns/zones` - Create a DNS Zone


### data_stream
**Missing**: 1 endpoints

- `POST data_stream/streams` - Create a Data Stream


### digital_certificates
**Missing**: 2 endpoints

- `POST digital_certificates/crls` - Create a certificate revocation lists (CRL)
- `POST digital_certificates/csr` - Create a certificate signing request (CSR)


### edge_application
**Missing**: 27 endpoints

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
- `PUT workspace/applications/{{edgeApplicationId}}/rules/order` - Ordering Edge Application Request Rules
- `PUT workspace/applications/{{edgeApplicationId}}/rules/order` - Ordering Edge Application Response Rules
- `GET workspace/applications/{{edgeApplicationId}}/rules` - List Edge Application Response Rules
- `POST workspace/applications/{{edgeApplicationId}}/response_rules` - Create an Edge Application Response Rule
- `GET workspace/applications/{{edgeApplicationId}}/response_rules/{{ruleId}}` - Retrieve details of an Edge Application Response Rule
- `PUT workspace/applications/{{edgeApplicationId}}/response_rules/{{ruleId}}` - Update an Edge Application Response Rule
- `PATCH workspace/applications/{{edgeApplicationId}}/response_rules/{{ruleId}}` - Partially update an Edge Application Response Rule
- `DELETE workspace/applications/{{edgeApplicationId}}/response_rules/{{ruleId}}` - Destroy an Edge Application Response Rule
- `GET workspace/applications` - List Edge Applications
- `POST workspace/applications` - Create an Edge Application


### edge_firewall
**Missing**: 21 endpoints

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


### edge_storage
**Missing**: 1 endpoints

- `POST workspace/storage/credentials` - Create a new credential


### orchestrator
**Missing**: 15 endpoints

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


## 📈 Recommendations

🔴 **Needs Improvement** - Significant coverage gaps need attention

---
*Generated by Context Coverage Analyzer*