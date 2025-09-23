# Fixed API Coverage Report

**Generated:** 2025-09-23T14:15:10.798Z

## Summary

- **Total Endpoints:** 239
- **Covered Endpoints:** 238
- **Missing Endpoints:** 0
- **Extra Tests:** 238
- **Coverage Percentage:** 100%

## Coverage by Context

| Context | Total | Covered | Missing | Coverage |
|---------|-------|---------|---------|----------|
| account | 12 | 12 | 0 | 100% |
| auth | 19 | 19 | 0 | 100% |
| payments | 7 | 7 | 0 | 100% |
| workspace | 119 | 118 | 1 | 99% |
| data_stream | 13 | 13 | 0 | 100% |
| digital_certificates | 14 | 14 | 0 | 100% |
| edge_connector | 6 | 6 | 0 | 100% |
| edge_firewall | 3 | 3 | 0 | 100% |
| edge_functions | 5 | 5 | 0 | 100% |
| edge_sql | 5 | 5 | 0 | 100% |
| edge_storage | 2 | 2 | 0 | 100% |
| orchestrator | 27 | 27 | 0 | 100% |
| identity | 7 | 7 | 0 | 100% |

## Extra Tests (No Matching Postman Endpoint)

- **GET** `:param/account/accounts/:param/info` in account.cy.js
- **PUT** `:param/account/accounts/:param/info` in account.cy.js
- **GET** `:param/account/accounts/:param` in account.cy.js
- **PUT** `:param/account/accounts/:param` in account.cy.js
- **PATCH** `:param/account/accounts/:param` in account.cy.js
- **GET** `:param/account/accounts` in account.cy.js
- **POST** `:param/account/accounts` in account.cy.js
- **GET** `:param/account/account` in account.cy.js
- **PUT** `:param/account/account` in account.cy.js
- **PATCH** `:param/account/account` in account.cy.js
- **POST** `:param/iam/users` in account.cy.js
- **POST** `:param/iam/accounts` in account.cy.js
- **GET** `:param/auth/login/method` in auth.cy.js
- **POST** `:param/auth/login` in auth.cy.js
- **DELETE** `:param/auth/mfa/totp/:param` in auth.cy.js
- **GET** `:param/auth/mfa/totp` in auth.cy.js
- **POST** `:param/auth/mfa/totp` in auth.cy.js
- **POST** `:param/auth/token` in auth.cy.js
- **POST** `:param/auth/revoke` in auth.cy.js
- **POST** `:param/auth/verify` in auth.cy.js
- **GET** `:param/auth/policies/lockout` in auth.cy.js
- **PUT** `:param/auth/policies/lockout` in auth.cy.js
- **GET** `:param/auth/policies/:param` in auth.cy.js
- **PUT** `:param/auth/policies/:param` in auth.cy.js
- **PATCH** `:param/auth/policies/:param` in auth.cy.js
- **DELETE** `:param/auth/policies/:param` in auth.cy.js
- **GET** `:param/auth/policies/session` in auth.cy.js
- **PUT** `:param/auth/policies/session` in auth.cy.js
- **GET** `:param/auth/policies` in auth.cy.js
- **POST** `:param/auth/policies` in auth.cy.js
- **POST** `:param/iam/mfa/totp` in auth.cy.js
- **GET** `:param/data_stream/templates/{{templateId}}` in data_stream.cy.js
- **PUT** `:param/data_stream/templates/{{dataSetId}}` in data_stream.cy.js
- **PATCH** `:param/data_stream/templates/{{dataSetId}}` in data_stream.cy.js
- **DELETE** `:param/data_stream/data_sets/{{dataSetId}}` in data_stream.cy.js
- **GET** `:param/data_stream/templates` in data_stream.cy.js
- **POST** `:param/data_stream/templates` in data_stream.cy.js
- **GET** `:param/data_stream/data_sources` in data_stream.cy.js
- **GET** `:param/data_stream/streams/:param` in data_stream.cy.js
- **PUT** `:param/data_stream/streams/:param` in data_stream.cy.js
- **PATCH** `:param/data_stream/streams/:param` in data_stream.cy.js
- **DELETE** `:param/data_stream/streams/:param` in data_stream.cy.js
- **GET** `:param/data_stream/streams` in data_stream.cy.js
- **POST** `:param/data_stream/streams` in data_stream.cy.js
- **POST** `:param/digital_certificates/certificates/request` in digital_certificates.cy.js
- **GET** `:param/digital_certificates/certificates/:param` in digital_certificates.cy.js
- **PUT** `:param/digital_certificates/certificates/:param` in digital_certificates.cy.js
- **PATCH** `:param/digital_certificates/certificates/:param` in digital_certificates.cy.js
- **DELETE** `:param/digital_certificates/certificates/:param` in digital_certificates.cy.js
- **GET** `:param/digital_certificates/certificates` in digital_certificates.cy.js
- **POST** `:param/digital_certificates/certificates` in digital_certificates.cy.js
- **GET** `:param/digital_certificates/crls/{{crlsId}}` in digital_certificates.cy.js
- **PUT** `:param/digital_certificates/crls/{{crlsId}}` in digital_certificates.cy.js
- **PATCH** `:param/digital_certificates/crls/{{crlsId}}` in digital_certificates.cy.js
- **DELETE** `:param/digital_certificates/crls/{{crlsId}}` in digital_certificates.cy.js
- **GET** `:param/digital_certificates/crls` in digital_certificates.cy.js
- **POST** `:param/digital_certificates/crls` in digital_certificates.cy.js
- **POST** `:param/digital_certificates/csr` in digital_certificates.cy.js
- **GET** `:param/edge_connector/connectors/:param` in edge_connector.cy.js
- **PUT** `:param/edge_connector/connectors/:param` in edge_connector.cy.js
- **PATCH** `:param/edge_connector/connectors/:param` in edge_connector.cy.js
- **DELETE** `:param/edge_connector/connectors/:param` in edge_connector.cy.js
- **GET** `:param/edge_connector/connectors` in edge_connector.cy.js
- **POST** `:param/edge_connector/connectors` in edge_connector.cy.js
- **POST** `:param/edge_firewall/wafs/{{wafId}}/clone` in edge_firewall.cy.js
- **DELETE** `:param/edge_firewall/wafs/{{wafId}}` in edge_firewall.cy.js
- **GET** `:param/edge_firewall/wafs/{{wafId}}/exceptions` in edge_firewall.cy.js
- **GET** `:param/edge_functions/functions/:param` in edge_functions.cy.js
- **PUT** `:param/edge_functions/functions/:param` in edge_functions.cy.js
- **PATCH** `:param/edge_functions/functions/:param` in edge_functions.cy.js
- **DELETE** `:param/edge_functions/functions/:param` in edge_functions.cy.js
- **GET** `:param/edge_functions/functions` in edge_functions.cy.js
- **POST** `:param/edge_sql/databases/:param/query` in edge_sql.cy.js
- **GET** `:param/edge_sql/databases/:param` in edge_sql.cy.js
- **DELETE** `:param/edge_sql/databases/:param` in edge_sql.cy.js
- **GET** `:param/edge_sql/databases` in edge_sql.cy.js
- **POST** `:param/edge_sql/databases` in edge_sql.cy.js
- **PATCH** `:param/wrokspace/storage/buckets/:param` in edge_storage.cy.js
- **DELETE** `:param/worksapce/storage/buckets/:param` in edge_storage.cy.js
- **DELETE** `:param/identity/users/:param/lockout` in identity.cy.js
- **GET** `:param/identity/users/:param` in identity.cy.js
- **PUT** `:param/identity/users/:param` in identity.cy.js
- **PATCH** `:param/identity/users/:param` in identity.cy.js
- **DELETE** `:param/identity/users/:param` in identity.cy.js
- **GET** `:param/identity/users` in identity.cy.js
- **POST** `:param/identity/users` in identity.cy.js
- **GET** `:param/orchestrator/edge_nodes/:param/groups` in orchestrator.cy.js
- **POST** `:param/orchestrator/edge_nodes/:param/groups` in orchestrator.cy.js
- **GET** `:param/orchestrator/edge_nodes/:param/services/:param` in orchestrator.cy.js
- **DELETE** `:param/orchestrator/edge_nodes/:param/services/:param` in orchestrator.cy.js
- **GET** `:param/orchestrator/edge_nodes/:param/services` in orchestrator.cy.js
- **POST** `:param/edge_orchestrator/edge_nodes/:param/services` in orchestrator.cy.js
- **GET** `:param/edge_orchestrator/edge_nodes/:param` in orchestrator.cy.js
- **PUT** `:param/orchestrator/edge_nodes/:param` in orchestrator.cy.js
- **PATCH** `:param/orchestrator/edge_nodes/:param` in orchestrator.cy.js
- **DELETE** `:param/orchestrator/edge_nodes/:param` in orchestrator.cy.js
- **DELETE** `:param/edge_orchestrator/edge_nodes/groups/{{groupId}}` in orchestrator.cy.js
- **GET** `:param/edge_orchestrator/edge_nodes/groups` in orchestrator.cy.js
- **POST** `:param/edge_orchestrator/edge_nodes/groups` in orchestrator.cy.js
- **GET** `:param/edge_orchestrator/edge_nodes` in orchestrator.cy.js
- **GET** `:param/edge_orchestrator/edge_services/:param/resources/{{resourceId}}/content` in orchestrator.cy.js
- **PUT** `:param/orchestrator/edge_services/:param/resources/:param/content` in orchestrator.cy.js
- **GET** `:param/orchestrator/edge_services/:param/resources/:param` in orchestrator.cy.js
- **PUT** `:param/orchestrator/edge_services/:param/resources/:param` in orchestrator.cy.js
- **DELETE** `:param/orchestrator/edge_services/:param/resources/:param` in orchestrator.cy.js
- **GET** `:param/edge_orchestrator/edge_services/:param/resources` in orchestrator.cy.js
- **POST** `:param/edge_orchestrator/edge_services/:param/resources` in orchestrator.cy.js
- **GET** `:param/edge_orchestrator/edge_services/:param` in orchestrator.cy.js
- **PUT** `:param/edge_orchestrator/edge_services/:param` in orchestrator.cy.js
- **PATCH** `:param/edge_orchestrator/edge_services/:param` in orchestrator.cy.js
- **DELETE** `:param/edge_orchestrator/edge_services/:param` in orchestrator.cy.js
- **GET** `:param/edge_orchestrator/edge_services` in orchestrator.cy.js
- **POST** `:param/edge_orchestrator/edge_services` in orchestrator.cy.js
- **GET** `:param/payments/credit_cards/{{creditCardId}}` in payments.cy.js
- **PATCH** `:param/payments/credit_cards/:param` in payments.cy.js
- **DELETE** `:param/payments/credit_cards/:param` in payments.cy.js
- **GET** `:param/payments/credit_cards` in payments.cy.js
- **POST** `:param/payments/credit_cards` in payments.cy.js
- **POST** `:param/payments/credits` in payments.cy.js
- **GET** `:param/payments/history` in payments.cy.js
- **GET** `:param/workspace/custom_pages/{{customPageId}}` in workspace.cy.js
- **PUT** `:param/workspace/custom_pages/{{customPageId}}` in workspace.cy.js
- **PATCH** `:param/workspace/custom_pages/{{customPageId}}` in workspace.cy.js
- **DELETE** `:param/workspace/custom_pages/{{deleteId}}` in workspace.cy.js
- **GET** `:param/workspace/custom_pages` in workspace.cy.js
- **POST** `:param/workspace/custom_pages` in workspace.cy.js
- **GET** `:param/workspace/network_lists/{{networkId}}` in workspace.cy.js
- **PUT** `:param/workspace/network_lists/{{networkId}}` in workspace.cy.js
- **PATCH** `:param/workspace/network_lists/{{networkId}}` in workspace.cy.js
- **DELETE** `:param/workspace/network_lists/{{networkId}}` in workspace.cy.js
- **GET** `:param/workspace/network_lists` in workspace.cy.js
- **POST** `:param/workspace/network_lists` in workspace.cy.js
- **POST** `:param/workspace/purge/url` in workspace.cy.js
- **GET** `:param/workspace/workloads/{{workloadId}}/deployments/{{workloadDeploymentsId}}` in workspace.cy.js
- **PUT** `:param/workspace/workloads/{{workloadId}}/deployments/{{workloadDeploymentsId}}` in workspace.cy.js
- **PATCH** `:param/workspace/workloads/{{workloadId}}/deployments/{{workloadDeploymentsId}}` in workspace.cy.js
- **GET** `:param/workspace/workloads/{{workloadId}}/deployments` in workspace.cy.js
- **GET** `:param/workspace/workloads/{{workloadId}}` in workspace.cy.js
- **PUT** `:param/workspace/workloads/{{workloadId}}` in workspace.cy.js
- **PATCH** `:param/workspace/workloads/{{workloadId}}` in workspace.cy.js
- **DELETE** `:param/workspace/workloads/{{workloadId}}` in workspace.cy.js
- **GET** `:param/workspace/workloads` in workspace.cy.js
- **POST** `:param/workspace/workloads` in workspace.cy.js
- **GET** `:param/workspace/dns/zones/:param/dnssec` in workspace.cy.js
- **PUT** `:param/workspace/dns/zones/:param/dnssec` in workspace.cy.js
- **PATCH** `:param/workspace/dns/zones/:param/dnssec` in workspace.cy.js
- **GET** `:param/workspace/dns/zones/:param/records/{{recordId}}` in workspace.cy.js
- **PUT** `:param/workspace/dns/zones/:param/records/{{recordId}}` in workspace.cy.js
- **PATCH** `:param/workspace/dns/zones/:param/records/{{recordId}}` in workspace.cy.js
- **DELETE** `:param/workspace/dns/zones/:param/records/{{recordId}}` in workspace.cy.js
- **GET** `:param/workspace/dns/zones/:param/records` in workspace.cy.js
- **POST** `:param/workspace/dns/zones/:param/records` in workspace.cy.js
- **GET** `:param/workspace/dns/zones/:param` in workspace.cy.js
- **PUT** `:param/workspace/dns/zones/:param` in workspace.cy.js
- **PATCH** `:param/workspace/dns/zones/:param` in workspace.cy.js
- **DELETE** `:param/workspace/dns/zones/:param` in workspace.cy.js
- **GET** `:param/workspace/dns/zones` in workspace.cy.js
- **POST** `:param/workspace/dns/zones` in workspace.cy.js
- **POST** `:param/workspace/applications/:param/clone` in workspace.cy.js
- **GET** `:param/workspace/applications/:param` in workspace.cy.js
- **PUT** `:param/workspace/applications/:param` in workspace.cy.js
- **PATCH** `:param/workspace/applications/:param` in workspace.cy.js
- **DELETE** `:param/workspace/applications/:param` in workspace.cy.js
- **GET** `:param/workspace/applications/:param/cache_settings/{{edgeCacheSettingsId}}` in workspace.cy.js
- **PUT** `:param/workspace/applications/:param/cache_settings/{{edgeCacheSettingsId}}` in workspace.cy.js
- **PATCH** `:param/workspace/applications/:param/cache_settings/{{edgeCacheSettingsId}}` in workspace.cy.js
- **DELETE** `:param/workspace/applications/:param/cache_settings/{{edgeCacheSettingsId}}` in workspace.cy.js
- **GET** `:param/workspace/applications/:param/cache_settings` in workspace.cy.js
- **POST** `:param/workspace/applications/:param/cache_settings` in workspace.cy.js
- **GET** `:param/workspace/applications/:param/device_groups/{{deviceGroupId}}` in workspace.cy.js
- **PUT** `:param/workspace/applications/:param/device_groups/{{deviceGroupId}}` in workspace.cy.js
- **PATCH** `:param/workspace/applications/:param/device_groups/{{deviceGroupId}}` in workspace.cy.js
- **DELETE** `:param/workspace/applications/:param/device_groups/{{deviceGroupId}}` in workspace.cy.js
- **GET** `:param/workspace/applications/:param/device_groups` in workspace.cy.js
- **POST** `:param/workspace/applications/:param/device_groups` in workspace.cy.js
- **GET** `:param/workspace/applications/:param/functions/{{edgeApplicationFunctionId}}` in workspace.cy.js
- **PUT** `:param/workspace/applications/:param/functions/{{edgeApplicationFunctionId}}` in workspace.cy.js
- **PATCH** `:param/workspace/applications/:param/functions/{{edgeApplicationFunctionId}}` in workspace.cy.js
- **DELETE** `:param/workspace/applications/:param/functions/{{edgeApplicationFunctionId}}` in workspace.cy.js
- **GET** `:param/workspace/applications/:param/functions` in workspace.cy.js
- **POST** `:param/workspace/applications/:param/functions` in workspace.cy.js
- **GET** `:param/workspace/applications/:param/request_rules` in workspace.cy.js
- **GET** `:param/workspace/applications/:param/request_rules/{{ruleId}}` in workspace.cy.js
- **PUT** `:param/workspace/applications/:param/request_rules/{{ruleId}}` in workspace.cy.js
- **PATCH** `:param/workspace/applications/:param/request_rules/{{ruleId}}` in workspace.cy.js
- **DELETE** `:param/workspace/applications/:param/request_rules/{{ruleId}}` in workspace.cy.js
- **POST** `:param/workspace/applications/:param/request_rules` in workspace.cy.js
- **PUT** `:param/workspace/applications/:param/rules/order` in workspace.cy.js
- **GET** `:param/workspace/applications/:param/rules` in workspace.cy.js
- **POST** `:param/workspace/applications/:param/response_rules` in workspace.cy.js
- **GET** `:param/workspace/applications/:param/response_rules/{{ruleId}}` in workspace.cy.js
- **PUT** `:param/workspace/applications/:param/response_rules/{{ruleId}}` in workspace.cy.js
- **PATCH** `:param/workspace/applications/:param/response_rules/{{ruleId}}` in workspace.cy.js
- **DELETE** `:param/workspace/applications/:param/response_rules/{{ruleId}}` in workspace.cy.js
- **GET** `:param/workspace/applications` in workspace.cy.js
- **POST** `:param/workspace/applications` in workspace.cy.js
- **POST** `:param/workspace/firewalls/:param/clone` in workspace.cy.js
- **GET** `:param/workspace/firewalls/:param` in workspace.cy.js
- **PUT** `:param/workspace/firewalls/:param` in workspace.cy.js
- **PATCH** `:param/workspace/firewalls/:param` in workspace.cy.js
- **DELETE** `:param/workspace/firewalls/:param` in workspace.cy.js
- **GET** `:param/workspace/firewalls/:param/functions/{{edgeFirewallFunctionId}}` in workspace.cy.js
- **PUT** `:param/workspace/firewalls/:param/functions/{{edgeFirewallFunctionId}}` in workspace.cy.js
- **PATCH** `:param/workspace/firewalls/:param/functions/{{edgeFirewallFunctionId}}` in workspace.cy.js
- **DELETE** `:param/workspace/firewalls/:param/functions/{{edgeFirewallFunctionId}}` in workspace.cy.js
- **GET** `:param/workspace/firewalls/:param/functions` in workspace.cy.js
- **POST** `:param/workspace/firewalls/:param/functions` in workspace.cy.js
- **GET** `:param/workspace/firewalls/:param/rules/{{ruleId}}` in workspace.cy.js
- **PUT** `:param/workspace/firewalls/:param/rules/{{ruleId}}` in workspace.cy.js
- **PATCH** `:param/workspace/firewalls/:param/rules/{{ruleId}}` in workspace.cy.js
- **DELETE** `:param/workspace/firewalls/:param/rules/{{ruleId}}` in workspace.cy.js
- **PUT** `:param/workspace/firewalls/:param/rules/order` in workspace.cy.js
- **GET** `:param/workspace/firewalls/:param/request_rules` in workspace.cy.js
- **POST** `:param/workspace/firewalls/:param/request_rules` in workspace.cy.js
- **GET** `:param/workspace/firewalls` in workspace.cy.js
- **POST** `:param/workspace/firewalls` in workspace.cy.js
- **GET** `:param/workspace/wafs/{{wafId}}` in workspace.cy.js
- **PUT** `:param/workspace/wafs/{{wafId}}` in workspace.cy.js
- **PATCH** `:param/workspace/wafs/{{wafId}}` in workspace.cy.js
- **GET** `:param/workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}}` in workspace.cy.js
- **PUT** `:param/workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}}` in workspace.cy.js
- **PATCH** `:param/workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}}` in workspace.cy.js
- **DELETE** `:param/workspace/wafs/{{wafId}}/exceptions/{{exceptionWafId}}` in workspace.cy.js
- **POST** `:param/workspace/wafs/{{wafId}}/exceptions` in workspace.cy.js
- **GET** `:param/workspace/wafs` in workspace.cy.js
- **POST** `:param/workspace/wafs` in workspace.cy.js
- **POST** `:param/workspace/functions` in workspace.cy.js
- **GET** `:param/workspace/storage/buckets/:param/objects/{{objectKey}}` in workspace.cy.js
- **POST** `:param/workspace/storage/buckets/:param/objects/{{objectKey}}` in workspace.cy.js
- **PUT** `:param/workspace/storage/buckets/:param/objects/{{objectKey}}` in workspace.cy.js
- **DELETE** `:param/workspace/storage/buckets/:param/objects/{{objectKey}}` in workspace.cy.js
- **GET** `:param/workspace/storage/buckets/:param/objects` in workspace.cy.js
- **GET** `:param/workspace/storage/buckets` in workspace.cy.js
- **POST** `:param/workspace/storage/buckets` in workspace.cy.js
- **GET** `:param/workspace/storage/credentials/:param` in workspace.cy.js
- **DELETE** `:param/workspace/storage/credentials/:param` in workspace.cy.js
- **GET** `:param/workspace/storage/credentials` in workspace.cy.js
- **POST** `:param/workspace/storage/credentials` in workspace.cy.js
