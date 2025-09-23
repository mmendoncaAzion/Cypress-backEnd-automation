# Relationship & Dependency Analysis Report

**Generated:** 2025-09-23T14:41:46.593Z
**Schemas Analyzed:** 1045
**Relationships Found:** 1076

## 📊 Summary

- **FIELD DEPENDENCIES:** 1045
- **CONDITIONAL LOGIC PATTERNS:** 1045
- **BUSINESS RULES:** 1045
- **MODULE TOGGLES:** 1045
- **CROSS SCHEMA RELATIONS:** 569
- **CRITICAL PATHS:** 2

## 🔗 Field Dependencies

### AUTHLoginRequest
- **email:**
  - format_dependency: email format email may require related fields

### AUTHPolicy
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### AUTHPolicyRule
- **effect:**
  - schema_reference: effect references AUTHEffectEnum schema
- **condition:**
  - schema_reference: condition references AUTHPolicyRuleCondition schema

### AUTHPolicyRuleRequest
- **effect:**
  - schema_reference: effect references AUTHEffectEnum schema
- **condition:**
  - schema_reference: condition references AUTHPolicyRuleConditionRequest schema

### AUTHResponseAsyncLockoutPolicy
- **data:**
  - schema_reference: data references AUTHLockoutPolicy schema

### AUTHResponseAsyncLogin
- **data:**
  - schema_reference: data references AUTHLoginResponse schema

### AUTHResponseAsyncPolicy
- **data:**
  - schema_reference: data references AUTHPolicy schema

### AUTHResponseAsyncSessionTimeoutPolicy
- **data:**
  - schema_reference: data references AUTHSessionTimeoutPolicy schema

### AUTHResponseAsyncTOTPDeviceCreate
- **data:**
  - schema_reference: data references AUTHTOTPDeviceCreate schema

### AUTHResponseAsyncToken
- **data:**
  - schema_reference: data references AUTHToken schema

### AUTHResponseAsyncTokenPair
- **data:**
  - schema_reference: data references AUTHTokenPair schema

### AUTHResponseLockoutPolicy
- **data:**
  - schema_reference: data references AUTHLockoutPolicy schema

### AUTHResponseLogin
- **data:**
  - schema_reference: data references AUTHLoginResponse schema

### AUTHResponsePolicy
- **data:**
  - schema_reference: data references AUTHPolicy schema

### AUTHResponseRetrieveLockoutPolicy
- **data:**
  - schema_reference: data references AUTHLockoutPolicy schema

### AUTHResponseRetrievePolicy
- **data:**
  - schema_reference: data references AUTHPolicy schema

### AUTHResponseRetrieveSessionTimeoutPolicy
- **data:**
  - schema_reference: data references AUTHSessionTimeoutPolicy schema

### AUTHResponseSessionTimeoutPolicy
- **data:**
  - schema_reference: data references AUTHSessionTimeoutPolicy schema

### AUTHResponseTOTPDeviceCreate
- **data:**
  - schema_reference: data references AUTHTOTPDeviceCreate schema

### AUTHResponseToken
- **data:**
  - schema_reference: data references AUTHToken schema

### AUTHResponseTokenPair
- **data:**
  - schema_reference: data references AUTHTokenPair schema

### AUTHuser_login_method_response
- **url:**
  - format_dependency: url format uri may require related fields

### EDGEAWS4HMAC
- **type:**
  - schema_reference: type references EDGEAWS4HMACTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEAWS4HMACAttributes schema

### EDGEAWS4HMACRequest
- **type:**
  - schema_reference: type references EDGEAWS4HMACTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEAWS4HMACAttributesRequest schema

### EDGEAddressModules
- **load_balancer:**
  - schema_reference: load_balancer references EDGEAddressLoadBalancerModule schema

### EDGEAddressModulesRequest
- **load_balancer:**
  - schema_reference: load_balancer references EDGEAddressLoadBalancerModuleRequest schema

### EDGEApplication
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **modules:**
  - schema_reference: modules references EDGEApplicationModules schema

### EDGEApplicationFunctionInstance
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### EDGEApplicationRequest
- **modules:**
  - schema_reference: modules references EDGEApplicationModulesRequest schema

### EDGEApplicationRequestPhaseRuleEngine
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### EDGEApplicationResponsePhaseRuleEngine
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### EDGEApplicationRuleEngineAddHeader
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineAddHeaderTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineAddHeaderAttributes schema

### EDGEApplicationRuleEngineAddHeaderRequest
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineAddHeaderTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineAddHeaderAttributesRequest schema

### EDGEApplicationRuleEngineAddRequestCookie
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineAddRequestCookieTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineAddRequestCookieAttributes schema

### EDGEApplicationRuleEngineAddRequestCookieRequest
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineAddRequestCookieTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineAddRequestCookieAttributesRequest schema

### EDGEApplicationRuleEngineAddResponseHeader
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineAddResponseHeaderTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineAddResponseHeaderAttributes schema

### EDGEApplicationRuleEngineAddResponseHeaderRequest
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineAddResponseHeaderTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineAddResponseHeaderAttributesRequest schema

### EDGEApplicationRuleEngineCaptureMatchGroups
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineCaptureMatchGroupsTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineCaptureMatchGroupsAttributes schema

### EDGEApplicationRuleEngineCaptureMatchGroupsRequest
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineCaptureMatchGroupsTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineCaptureMatchGroupsAttributesRequest schema

### EDGEApplicationRuleEngineFilterHeader
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineFilterHeaderTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineFilterHeaderAttributes schema

### EDGEApplicationRuleEngineFilterHeaderRequest
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineFilterHeaderTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineFilterHeaderAttributesRequest schema

### EDGEApplicationRuleEngineFilterRequestCookie
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineFilterRequestCookieTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineFilterRequestCookieAttributes schema

### EDGEApplicationRuleEngineFilterRequestCookieRequest
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineFilterRequestCookieTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineFilterRequestCookieAttributesRequest schema

### EDGEApplicationRuleEngineFilterResponseHeader
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineFilterResponseHeaderTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineFilterResponseHeaderAttributes schema

### EDGEApplicationRuleEngineFilterResponseHeaderRequest
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineFilterResponseHeaderTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineFilterResponseHeaderAttributesRequest schema

### EDGEApplicationRuleEngineNoArgs
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineNoArgsTypeEnum schema

### EDGEApplicationRuleEngineNoArgsRequest
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineNoArgsTypeEnum schema

### EDGEApplicationRuleEngineResponseNoArgs
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineResponseNoArgsTypeEnum schema

### EDGEApplicationRuleEngineResponseNoArgsRequest
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineResponseNoArgsTypeEnum schema

### EDGEApplicationRuleEngineResponseString
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineResponseStringTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineResponseStringAttributes schema

### EDGEApplicationRuleEngineResponseStringRequest
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineResponseStringTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineResponseStringAttributesRequest schema

### EDGEApplicationRuleEngineRewriteRequest
- **type:**
  - schema_reference: type references EDGETypeF11Enum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineRewriteRequestAttributes schema

### EDGEApplicationRuleEngineRewriteRequestRequest
- **type:**
  - schema_reference: type references EDGETypeF11Enum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineRewriteRequestAttributesRequest schema

### EDGEApplicationRuleEngineRunFunction
- **type:**
  - schema_reference: type references EDGEType689Enum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineRunFunctionAttributes schema

### EDGEApplicationRuleEngineRunFunctionRequest
- **type:**
  - schema_reference: type references EDGEType689Enum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineRunFunctionAttributesRequest schema

### EDGEApplicationRuleEngineRunFunctionResponse
- **type:**
  - schema_reference: type references EDGEType689Enum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineRunFunctionResponseAttributes schema

### EDGEApplicationRuleEngineRunFunctionResponseRequest
- **type:**
  - schema_reference: type references EDGEType689Enum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineRunFunctionResponseAttributesRequest schema

### EDGEApplicationRuleEngineSetCachePolicy
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineSetCachePolicyTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineSetCachePolicyAttributes schema

### EDGEApplicationRuleEngineSetCachePolicyRequest
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineSetCachePolicyTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineSetCachePolicyAttributesRequest schema

### EDGEApplicationRuleEngineSetConnector
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineSetConnectorTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineSetConnectorAttributes schema

### EDGEApplicationRuleEngineSetConnectorRequest
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineSetConnectorTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineSetConnectorAttributesRequest schema

### EDGEApplicationRuleEngineSetCookie
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineSetCookieTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineSetCookieAttributes schema

### EDGEApplicationRuleEngineSetCookieRequest
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineSetCookieTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineSetCookieAttributesRequest schema

### EDGEApplicationRuleEngineSetOrigin
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineSetOriginTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineSetOriginAttributes schema

### EDGEApplicationRuleEngineSetOriginRequest
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineSetOriginTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineSetOriginAttributesRequest schema

### EDGEApplicationRuleEngineString
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineStringTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineStringAttributes schema

### EDGEApplicationRuleEngineStringRequest
- **type:**
  - schema_reference: type references EDGEApplicationRuleEngineStringTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEApplicationRuleEngineStringAttributesRequest schema

### EDGECacheSetting
- **browser_cache:**
  - schema_reference: browser_cache references EDGEBrowserCacheModule schema
- **modules:**
  - schema_reference: modules references EDGECacheSettingsModules schema

### EDGECacheSettingRequest
- **browser_cache:**
  - schema_reference: browser_cache references EDGEBrowserCacheModuleRequest schema
- **modules:**
  - schema_reference: modules references EDGECacheSettingsModulesRequest schema

### EDGECacheSettingsApplicationAcceleratorModule
- **cache_vary_by_querystring:**
  - schema_reference: cache_vary_by_querystring references EDGECacheVaryByQuerystringModule schema
- **cache_vary_by_cookies:**
  - schema_reference: cache_vary_by_cookies references EDGECacheVaryByCookiesModule schema
- **cache_vary_by_devices:**
  - schema_reference: cache_vary_by_devices references EDGECacheVaryByDevicesModule schema

### EDGECacheSettingsApplicationAcceleratorModuleRequest
- **cache_vary_by_querystring:**
  - schema_reference: cache_vary_by_querystring references EDGECacheVaryByQuerystringModuleRequest schema
- **cache_vary_by_cookies:**
  - schema_reference: cache_vary_by_cookies references EDGECacheVaryByCookiesModuleRequest schema
- **cache_vary_by_devices:**
  - schema_reference: cache_vary_by_devices references EDGECacheVaryByDevicesModuleRequest schema

### EDGECacheSettingsEdgeCacheModule
- **stale_cache:**
  - schema_reference: stale_cache references EDGEStateCacheModule schema
- **large_file_cache:**
  - schema_reference: large_file_cache references EDGELargeFileCacheModule schema

### EDGECacheSettingsEdgeCacheModuleRequest
- **stale_cache:**
  - schema_reference: stale_cache references EDGEStateCacheModuleRequest schema
- **large_file_cache:**
  - schema_reference: large_file_cache references EDGELargeFileCacheModuleRequest schema

### EDGECacheSettingsModules
- **edge_cache:**
  - schema_reference: edge_cache references EDGECacheSettingsEdgeCacheModule schema
- **application_accelerator:**
  - schema_reference: application_accelerator references EDGECacheSettingsApplicationAcceleratorModule schema

### EDGECacheSettingsModulesRequest
- **edge_cache:**
  - schema_reference: edge_cache references EDGECacheSettingsEdgeCacheModuleRequest schema
- **application_accelerator:**
  - schema_reference: application_accelerator references EDGECacheSettingsApplicationAcceleratorModuleRequest schema

### EDGECacheSettingsTieredCacheModule
- **topology:**
  - schema_reference: topology references EDGETopologyEnum schema

### EDGECacheSettingsTieredCacheModuleRequest
- **topology:**
  - schema_reference: topology references EDGETopologyEnum schema

### EDGEConnectorHTTP
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **attributes:**
  - schema_reference: attributes references EDGEConnectorHTTPAttributes schema

### EDGEConnectorHTTPRequest
- **attributes:**
  - schema_reference: attributes references EDGEConnectorHTTPAttributesRequest schema

### EDGEConnectorLiveIngest
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **attributes:**
  - schema_reference: attributes references EDGEConnectorLiveIngestAttributes schema

### EDGEConnectorLiveIngestAttributes
- **region:**
  - schema_reference: region references EDGERegionEnum schema

### EDGEConnectorLiveIngestAttributesRequest
- **region:**
  - schema_reference: region references EDGERegionEnum schema

### EDGEConnectorLiveIngestRequest
- **attributes:**
  - schema_reference: attributes references EDGEConnectorLiveIngestAttributesRequest schema

### EDGEConnectorStorage
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **attributes:**
  - schema_reference: attributes references EDGEConnectorStorageAttributes schema

### EDGEConnectorStorageRequest
- **attributes:**
  - schema_reference: attributes references EDGEConnectorStorageAttributesRequest schema

### EDGECustomPage
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### EDGEDefaultDeploymentStrategy
- **attributes:**
  - schema_reference: attributes references EDGEDefaultDeploymentStrategyAttrs schema

### EDGEDefaultDeploymentStrategyRequest
- **attributes:**
  - schema_reference: attributes references EDGEDefaultDeploymentStrategyAttrsRequest schema

### EDGEEdgeApplicationCriterionField
- **conditional:**
  - schema_reference: conditional references EDGEConditionalEnum schema
- **variable:**
  - schema_reference: variable references EDGEEdgeApplicationCriterionFieldVariableEnum schema
- **operator:**
  - schema_reference: operator references EDGEOperator565Enum schema

### EDGEEdgeApplicationCriterionFieldRequest
- **conditional:**
  - schema_reference: conditional references EDGEConditionalEnum schema
- **variable:**
  - schema_reference: variable references EDGEEdgeApplicationCriterionFieldVariableEnum schema
- **operator:**
  - schema_reference: operator references EDGEOperator565Enum schema

### EDGEEdgeFirewallCriterionField
- **conditional:**
  - schema_reference: conditional references EDGEConditionalEnum schema
- **variable:**
  - schema_reference: variable references EDGEEdgeFirewallCriterionFieldVariableEnum schema
- **operator:**
  - schema_reference: operator references EDGEOperator565Enum schema

### EDGEEdgeFirewallCriterionFieldRequest
- **conditional:**
  - schema_reference: conditional references EDGEConditionalEnum schema
- **variable:**
  - schema_reference: variable references EDGEEdgeFirewallCriterionFieldVariableEnum schema
- **operator:**
  - schema_reference: operator references EDGEOperator565Enum schema

### EDGEEdgeFunctions
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### EDGEFirewall
- **modules:**
  - schema_reference: modules references EDGEFirewallModules schema
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### EDGEFirewallBehaviorNoArguments
- **type:**
  - schema_reference: type references EDGEFirewallBehaviorNoArgumentsTypeEnum schema

### EDGEFirewallBehaviorNoArgumentsRequest
- **type:**
  - schema_reference: type references EDGEFirewallBehaviorNoArgumentsTypeEnum schema

### EDGEFirewallBehaviorRunFunction
- **type:**
  - schema_reference: type references EDGEType689Enum schema
- **attributes:**
  - schema_reference: attributes references EDGEFirewallBehaviorRunFunctionAttributes schema

### EDGEFirewallBehaviorRunFunctionRequest
- **type:**
  - schema_reference: type references EDGEType689Enum schema
- **attributes:**
  - schema_reference: attributes references EDGEFirewallBehaviorRunFunctionAttributesRequest schema

### EDGEFirewallBehaviorSetCustomResponse
- **type:**
  - schema_reference: type references EDGEFirewallBehaviorSetCustomResponseTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEFirewallBehaviorSetCustomResponseAttributes schema

### EDGEFirewallBehaviorSetCustomResponseRequest
- **type:**
  - schema_reference: type references EDGEFirewallBehaviorSetCustomResponseTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEFirewallBehaviorSetCustomResponseAttributesRequest schema

### EDGEFirewallBehaviorSetRateLimit
- **type:**
  - schema_reference: type references EDGEFirewallBehaviorSetRateLimitTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEFirewallBehaviorSetRateLimitAttributes schema

### EDGEFirewallBehaviorSetRateLimitAttributes
- **limit_by:**
  - schema_reference: limit_by references EDGELimitByEnum schema

### EDGEFirewallBehaviorSetRateLimitAttributesRequest
- **limit_by:**
  - schema_reference: limit_by references EDGELimitByEnum schema

### EDGEFirewallBehaviorSetRateLimitRequest
- **type:**
  - schema_reference: type references EDGEFirewallBehaviorSetRateLimitTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEFirewallBehaviorSetRateLimitAttributesRequest schema

### EDGEFirewallBehaviorSetWaf
- **type:**
  - schema_reference: type references EDGEFirewallBehaviorSetWafTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEFirewallBehaviorSetWafAttributes schema

### EDGEFirewallBehaviorSetWafAttributes
- **mode:**
  - schema_reference: mode references EDGEModeEnum schema

### EDGEFirewallBehaviorSetWafAttributesRequest
- **mode:**
  - schema_reference: mode references EDGEModeEnum schema

### EDGEFirewallBehaviorSetWafRequest
- **type:**
  - schema_reference: type references EDGEFirewallBehaviorSetWafTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEFirewallBehaviorSetWafAttributesRequest schema

### EDGEFirewallBehaviorTagEvent
- **type:**
  - schema_reference: type references EDGEFirewallBehaviorTagEventTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEFirewallBehaviorTagEventAttributes schema

### EDGEFirewallBehaviorTagEventRequest
- **type:**
  - schema_reference: type references EDGEFirewallBehaviorTagEventTypeEnum schema
- **attributes:**
  - schema_reference: attributes references EDGEFirewallBehaviorTagEventAttributesRequest schema

### EDGEFirewallFunctionInstance
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### EDGEFirewallRequest
- **modules:**
  - schema_reference: modules references EDGEFirewallModulesRequest schema

### EDGEFirewallRuleEngine
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### EDGENetworkList
- **type:**
  - schema_reference: type references EDGEType528Enum schema
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### EDGENetworkListDetail
- **type:**
  - schema_reference: type references EDGEType528Enum schema
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### EDGENetworkListDetailRequest
- **type:**
  - schema_reference: type references EDGEType528Enum schema

### EDGEOriginShieldConfig
- **origin_ip_acl:**
  - schema_reference: origin_ip_acl references EDGEOriginIPACL schema
- **hmac:**
  - schema_reference: hmac references EDGEHMAC schema

### EDGEOriginShieldConfigRequest
- **origin_ip_acl:**
  - schema_reference: origin_ip_acl references EDGEOriginIPACLRequest schema
- **hmac:**
  - schema_reference: hmac references EDGEHMACRequest schema

### EDGEPage
- **code:**
  - schema_reference: code references EDGECodeEnum schema
- **page:**
  - schema_reference: page references EDGEPagePolymorphic schema

### EDGEPageConnector
- **attributes:**
  - schema_reference: attributes references EDGEPageConnectorAttributes schema

### EDGEPageConnectorRequest
- **attributes:**
  - schema_reference: attributes references EDGEPageConnectorAttributesRequest schema

### EDGEPageRequest
- **code:**
  - schema_reference: code references EDGECodeEnum schema
- **page:**
  - schema_reference: page references EDGEPagePolymorphicRequest schema

### EDGEPatchedApplicationRequest
- **modules:**
  - schema_reference: modules references EDGEApplicationModulesRequest schema

### EDGEPatchedCacheSettingRequest
- **browser_cache:**
  - schema_reference: browser_cache references EDGEBrowserCacheModuleRequest schema
- **modules:**
  - schema_reference: modules references EDGECacheSettingsModulesRequest schema

### EDGEPatchedConnectorHTTPRequest
- **attributes:**
  - schema_reference: attributes references EDGEConnectorHTTPAttributesRequest schema

### EDGEPatchedConnectorLiveIngestRequest
- **attributes:**
  - schema_reference: attributes references EDGEConnectorLiveIngestAttributesRequest schema

### EDGEPatchedConnectorStorageRequest
- **attributes:**
  - schema_reference: attributes references EDGEConnectorStorageAttributesRequest schema

### EDGEPatchedFirewallRequest
- **modules:**
  - schema_reference: modules references EDGEFirewallModulesRequest schema

### EDGEPatchedNetworkListDetailRequest
- **type:**
  - schema_reference: type references EDGEType528Enum schema

### EDGEPatchedWAFRequest
- **engine_settings:**
  - schema_reference: engine_settings references EDGEWAFEngineSettingsFieldRequest schema

### EDGEPatchedWorkloadDeploymentRequest
- **strategy:**
  - schema_reference: strategy references EDGEDeploymentStrategyRequest schema

### EDGEPatchedWorkloadRequest
- **mtls:**
  - schema_reference: mtls references EDGEMTLSRequest schema

### EDGEResponseApplication
- **data:**
  - schema_reference: data references EDGEApplication schema

### EDGEResponseApplicationDeviceGroups
- **data:**
  - schema_reference: data references EDGEApplicationDeviceGroups schema

### EDGEResponseApplicationFunctionInstance
- **data:**
  - schema_reference: data references EDGEApplicationFunctionInstance schema

### EDGEResponseApplicationRequestPhaseRuleEngine
- **data:**
  - schema_reference: data references EDGEApplicationRequestPhaseRuleEngine schema

### EDGEResponseApplicationResponsePhaseRuleEngine
- **data:**
  - schema_reference: data references EDGEApplicationResponsePhaseRuleEngine schema

### EDGEResponseAsyncApplication
- **data:**
  - schema_reference: data references EDGEApplication schema

### EDGEResponseAsyncApplicationDeviceGroups
- **data:**
  - schema_reference: data references EDGEApplicationDeviceGroups schema

### EDGEResponseAsyncApplicationFunctionInstance
- **data:**
  - schema_reference: data references EDGEApplicationFunctionInstance schema

### EDGEResponseAsyncApplicationRequestPhaseRuleEngine
- **data:**
  - schema_reference: data references EDGEApplicationRequestPhaseRuleEngine schema

### EDGEResponseAsyncApplicationResponsePhaseRuleEngine
- **data:**
  - schema_reference: data references EDGEApplicationResponsePhaseRuleEngine schema

### EDGEResponseAsyncCacheSetting
- **data:**
  - schema_reference: data references EDGECacheSetting schema

### EDGEResponseAsyncConnectorPolymorphic
- **data:**
  - schema_reference: data references EDGEConnectorPolymorphic schema

### EDGEResponseAsyncCustomPage
- **data:**
  - schema_reference: data references EDGECustomPage schema

### EDGEResponseAsyncFirewall
- **data:**
  - schema_reference: data references EDGEFirewall schema

### EDGEResponseAsyncFirewallFunctionInstance
- **data:**
  - schema_reference: data references EDGEFirewallFunctionInstance schema

### EDGEResponseAsyncFirewallRuleEngine
- **data:**
  - schema_reference: data references EDGEFirewallRuleEngine schema

### EDGEResponseAsyncFunctionsDoc
- **data:**
  - schema_reference: data references EDGEEdgeFunctions schema

### EDGEResponseAsyncNetworkListDetail
- **data:**
  - schema_reference: data references EDGENetworkListDetail schema

### EDGEResponseAsyncPurgeInput
- **data:**
  - schema_reference: data references EDGEPurgeInput schema

### EDGEResponseAsyncWAF
- **data:**
  - schema_reference: data references EDGEWAF schema

### EDGEResponseAsyncWAFRule
- **data:**
  - schema_reference: data references EDGEWAFRule schema

### EDGEResponseAsyncWorkload
- **data:**
  - schema_reference: data references EDGEWorkload schema

### EDGEResponseAsyncWorkloadDeployment
- **data:**
  - schema_reference: data references EDGEWorkloadDeployment schema

### EDGEResponseBadRequestApplication
- **modules:**
  - schema_reference: modules references EDGEResponseBadRequestSerializerMetaclassModulesField schema

### EDGEResponseBadRequestCacheSetting
- **browser_cache:**
  - schema_reference: browser_cache references EDGEResponseBadRequestSerializerMetaclassBrowser_cacheField schema
- **modules:**
  - schema_reference: modules references EDGEResponseBadRequestSerializerMetaclassModulesField schema

### EDGEResponseBadRequestCacheSettingsModulesApplication_acceleratorField
- **cache_vary_by_querystring:**
  - schema_reference: cache_vary_by_querystring references EDGEResponseBadRequestCacheSettingsApplicationAcceleratorModuleCache_vary_by_querystringField schema
- **cache_vary_by_cookies:**
  - schema_reference: cache_vary_by_cookies references EDGEResponseBadRequestCacheSettingsApplicationAcceleratorModuleCache_vary_by_cookiesField schema
- **cache_vary_by_devices:**
  - schema_reference: cache_vary_by_devices references EDGEResponseBadRequestCacheSettingsApplicationAcceleratorModuleCache_vary_by_devicesField schema

### EDGEResponseBadRequestCacheSettingsModulesEdge_cacheField
- **stale_cache:**
  - schema_reference: stale_cache references EDGEResponseBadRequestCacheSettingsEdgeCacheModuleStale_cacheField schema
- **large_file_cache:**
  - schema_reference: large_file_cache references EDGEResponseBadRequestCacheSettingsEdgeCacheModuleLarge_file_cacheField schema

### EDGEResponseBadRequestSerializerMetaclassModulesField
- **edge_cache:**
  - schema_reference: edge_cache references EDGEResponseBadRequestCacheSettingsModulesEdge_cacheField schema
- **tiered_cache:**
  - schema_reference: tiered_cache references EDGEResponseBadRequestCacheSettingsModulesTiered_cacheField schema
- **application_accelerator:**
  - schema_reference: application_accelerator references EDGEResponseBadRequestCacheSettingsModulesApplication_acceleratorField schema

### EDGEResponseBadRequestWorkloadDeployment
- **strategy:**
  - schema_reference: strategy references EDGEResponseBadRequestSerializerMetaclassStrategyField schema

### EDGEResponseConnectorPolymorphic
- **data:**
  - schema_reference: data references EDGEConnectorPolymorphic schema

### EDGEResponseCustomPage
- **data:**
  - schema_reference: data references EDGECustomPage schema

### EDGEResponseFirewall
- **data:**
  - schema_reference: data references EDGEFirewall schema

### EDGEResponseFirewallFunctionInstance
- **data:**
  - schema_reference: data references EDGEFirewallFunctionInstance schema

### EDGEResponseFirewallRuleEngine
- **data:**
  - schema_reference: data references EDGEFirewallRuleEngine schema

### EDGEResponseFunctionsDoc
- **data:**
  - schema_reference: data references EDGEEdgeFunctions schema

### EDGEResponseListCacheSetting
- **browser_cache:**
  - schema_reference: browser_cache references EDGEBrowserCacheModule schema
- **modules:**
  - schema_reference: modules references EDGECacheSettingsModules schema

### EDGEResponseNetworkListDetail
- **data:**
  - schema_reference: data references EDGENetworkListDetail schema

### EDGEResponsePurgeInput
- **data:**
  - schema_reference: data references EDGEPurgeInput schema

### EDGEResponseRetrieveApplication
- **data:**
  - schema_reference: data references EDGEApplication schema

### EDGEResponseRetrieveApplicationDeviceGroups
- **data:**
  - schema_reference: data references EDGEApplicationDeviceGroups schema

### EDGEResponseRetrieveApplicationFunctionInstance
- **data:**
  - schema_reference: data references EDGEApplicationFunctionInstance schema

### EDGEResponseRetrieveApplicationRequestPhaseRuleEngine
- **data:**
  - schema_reference: data references EDGEApplicationRequestPhaseRuleEngine schema

### EDGEResponseRetrieveCacheSetting
- **data:**
  - schema_reference: data references EDGECacheSetting schema

### EDGEResponseRetrieveConnectorPolymorphic
- **data:**
  - schema_reference: data references EDGEConnectorPolymorphic schema

### EDGEResponseRetrieveCustomPage
- **data:**
  - schema_reference: data references EDGECustomPage schema

### EDGEResponseRetrieveFirewall
- **data:**
  - schema_reference: data references EDGEFirewall schema

### EDGEResponseRetrieveFirewallFunctionInstance
- **data:**
  - schema_reference: data references EDGEFirewallFunctionInstance schema

### EDGEResponseRetrieveFirewallRuleEngine
- **data:**
  - schema_reference: data references EDGEFirewallRuleEngine schema

### EDGEResponseRetrieveFunctionsDoc
- **data:**
  - schema_reference: data references EDGEEdgeFunctions schema

### EDGEResponseRetrieveNetworkListDetail
- **data:**
  - schema_reference: data references EDGENetworkListDetail schema

### EDGEResponseRetrieveWAF
- **data:**
  - schema_reference: data references EDGEWAF schema

### EDGEResponseRetrieveWAFRule
- **data:**
  - schema_reference: data references EDGEWAFRule schema

### EDGEResponseRetrieveWorkload
- **data:**
  - schema_reference: data references EDGEWorkload schema

### EDGEResponseRetrieveWorkloadDeployment
- **data:**
  - schema_reference: data references EDGEWorkloadDeployment schema

### EDGEResponseWAF
- **data:**
  - schema_reference: data references EDGEWAF schema

### EDGEResponseWAFRule
- **data:**
  - schema_reference: data references EDGEWAFRule schema

### EDGEResponseWorkload
- **data:**
  - schema_reference: data references EDGEWorkload schema

### EDGEResponseWorkloadDeployment
- **data:**
  - schema_reference: data references EDGEWorkloadDeployment schema

### EDGEThresholdsConfigField
- **threat:**
  - schema_reference: threat references EDGEThreatEnum schema

### EDGEThresholdsConfigFieldRequest
- **threat:**
  - schema_reference: threat references EDGEThreatEnum schema

### EDGEWAF
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **engine_settings:**
  - schema_reference: engine_settings references EDGEWAFEngineSettingsField schema

### EDGEWAFEngineSettingsField
- **attributes:**
  - schema_reference: attributes references EDGEWAFEngineSettingsAttributesField schema

### EDGEWAFEngineSettingsFieldRequest
- **attributes:**
  - schema_reference: attributes references EDGEWAFEngineSettingsAttributesFieldRequest schema

### EDGEWAFExceptionGenericCondition
- **match:**
  - schema_reference: match references EDGEWAFExceptionGenericConditionMatchEnum schema

### EDGEWAFExceptionGenericConditionRequest
- **match:**
  - schema_reference: match references EDGEWAFExceptionGenericConditionMatchEnum schema

### EDGEWAFExceptionSpecificConditionOnName
- **match:**
  - schema_reference: match references EDGEWAFExceptionSpecificConditionOnNameMatchEnum schema

### EDGEWAFExceptionSpecificConditionOnNameRequest
- **match:**
  - schema_reference: match references EDGEWAFExceptionSpecificConditionOnNameMatchEnum schema

### EDGEWAFExceptionSpecificConditionOnValue
- **match:**
  - schema_reference: match references EDGEWAFExceptionSpecificConditionOnValueMatchEnum schema

### EDGEWAFExceptionSpecificConditionOnValueRequest
- **match:**
  - schema_reference: match references EDGEWAFExceptionSpecificConditionOnValueMatchEnum schema

### EDGEWAFRequest
- **engine_settings:**
  - schema_reference: engine_settings references EDGEWAFEngineSettingsFieldRequest schema

### EDGEWAFRule
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### EDGEWorkload
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **mtls:**
  - schema_reference: mtls references EDGEMTLS schema

### EDGEWorkloadDeployment
- **strategy:**
  - schema_reference: strategy references EDGEDeploymentStrategy schema
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### EDGEWorkloadDeploymentRequest
- **strategy:**
  - schema_reference: strategy references EDGEDeploymentStrategyRequest schema

### EDGEWorkloadRequest
- **mtls:**
  - schema_reference: mtls references EDGEMTLSRequest schema

### METRICSBaseQuery
- **order_direction:**
  - schema_reference: order_direction references METRICSOrderDirectionEnum schema

### METRICSBaseQueryRequest
- **order_direction:**
  - schema_reference: order_direction references METRICSOrderDirectionEnum schema

### METRICSDashboard
- **scope:**
  - schema_reference: scope references METRICSScopeEnum schema

### METRICSDashboardRequest
- **scope:**
  - schema_reference: scope references METRICSScopeEnum schema

### METRICSFolder
- **scope:**
  - schema_reference: scope references METRICSScopeEnum schema

### METRICSFolderRequest
- **scope:**
  - schema_reference: scope references METRICSScopeEnum schema

### METRICSLibraryReportRequest
- **type:**
  - schema_reference: type references METRICSTypeEnum schema
- **aggregation_type:**
  - schema_reference: aggregation_type references METRICSAggregationTypeEnum schema
- **data_unit:**
  - schema_reference: data_unit references METRICSDataUnitEnum schema
- **scope:**
  - schema_reference: scope references METRICSScopeEnum schema
- **comparison_type:**
  - schema_reference: comparison_type references METRICSComparisonTypeEnum schema

### METRICSPatchedDashboardRequest
- **scope:**
  - schema_reference: scope references METRICSScopeEnum schema

### METRICSPatchedFolderRequest
- **scope:**
  - schema_reference: scope references METRICSScopeEnum schema

### METRICSReport
- **type:**
  - schema_reference: type references METRICSTypeEnum schema
- **aggregation_type:**
  - schema_reference: aggregation_type references METRICSAggregationTypeEnum schema
- **data_unit:**
  - schema_reference: data_unit references METRICSDataUnitEnum schema
- **comparison_type:**
  - schema_reference: comparison_type references METRICSComparisonTypeEnum schema

### METRICSReportRequest
- **type:**
  - schema_reference: type references METRICSTypeEnum schema
- **aggregation_type:**
  - schema_reference: aggregation_type references METRICSAggregationTypeEnum schema
- **data_unit:**
  - schema_reference: data_unit references METRICSDataUnitEnum schema
- **comparison_type:**
  - schema_reference: comparison_type references METRICSComparisonTypeEnum schema

### METRICSResponseAsyncDashboard
- **data:**
  - schema_reference: data references METRICSDashboard schema

### METRICSResponseAsyncFolder
- **data:**
  - schema_reference: data references METRICSFolder schema

### METRICSResponseAsyncOrder
- **data:**
  - schema_reference: data references METRICSOrder schema

### METRICSResponseAsyncReport
- **data:**
  - schema_reference: data references METRICSReport schema

### METRICSResponseAsyncRow
- **data:**
  - schema_reference: data references METRICSRow schema

### METRICSResponseDashboard
- **data:**
  - schema_reference: data references METRICSDashboard schema

### METRICSResponseFolder
- **data:**
  - schema_reference: data references METRICSFolder schema

### METRICSResponseListDashboard
- **scope:**
  - schema_reference: scope references METRICSScopeEnum schema

### METRICSResponseListFolder
- **scope:**
  - schema_reference: scope references METRICSScopeEnum schema

### METRICSResponseListReport
- **type:**
  - schema_reference: type references METRICSTypeEnum schema
- **aggregation_type:**
  - schema_reference: aggregation_type references METRICSAggregationTypeEnum schema
- **data_unit:**
  - schema_reference: data_unit references METRICSDataUnitEnum schema
- **comparison_type:**
  - schema_reference: comparison_type references METRICSComparisonTypeEnum schema

### METRICSResponseOrder
- **data:**
  - schema_reference: data references METRICSOrder schema

### METRICSResponseReport
- **data:**
  - schema_reference: data references METRICSReport schema

### METRICSResponseRetrieveDashboard
- **data:**
  - schema_reference: data references METRICSDashboard schema

### METRICSResponseRetrieveFolder
- **data:**
  - schema_reference: data references METRICSFolder schema

### METRICSResponseRetrieveReport
- **data:**
  - schema_reference: data references METRICSReport schema

### METRICSResponseRetrieveRow
- **data:**
  - schema_reference: data references METRICSRow schema

### METRICSResponseRow
- **data:**
  - schema_reference: data references METRICSRow schema

### EDGESQLOpenAPISchema
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### EDGESQLResponseAsyncOpenAPISchema
- **data:**
  - schema_reference: data references EDGESQLOpenAPISchema schema

### EDGESQLResponseAsyncSQLResult
- **data:**
  - schema_reference: data references EDGESQLSQLResult schema

### EDGESQLResponseOpenAPISchema
- **data:**
  - schema_reference: data references EDGESQLOpenAPISchema schema

### EDGESQLResponseRetrieveOpenAPISchema
- **data:**
  - schema_reference: data references EDGESQLOpenAPISchema schema

### EDGESQLResponseSQLResult
- **data:**
  - schema_reference: data references EDGESQLSQLResult schema

### PAYMENTSResponseAsyncCredit
- **data:**
  - schema_reference: data references PAYMENTSCredit schema

### PAYMENTSResponseAsyncPaymentMethod
- **data:**
  - schema_reference: data references PAYMENTSPaymentMethod schema

### PAYMENTSResponseCredit
- **data:**
  - schema_reference: data references PAYMENTSCredit schema

### PAYMENTSResponsePaymentMethod
- **data:**
  - schema_reference: data references PAYMENTSPaymentMethod schema

### ACCOUNTSBrand
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **created:**
  - format_dependency: created format date-time may require related fields
- **type:**
  - schema_reference: type references ACCOUNTSTypeEnum schema

### ACCOUNTSBrandRequest
- **type:**
  - schema_reference: type references ACCOUNTSTypeEnum schema

### ACCOUNTSCreateBrandRequest
- **type:**
  - schema_reference: type references ACCOUNTSTypeEnum schema

### ACCOUNTSCreateOrganizationRequest
- **type:**
  - schema_reference: type references ACCOUNTSTypeEnum schema

### ACCOUNTSCreateResellerRequest
- **currency_iso_code:**
  - schema_reference: currency_iso_code references ACCOUNTSCurrencyIsoCodeEnum schema
- **type:**
  - schema_reference: type references ACCOUNTSTypeEnum schema

### ACCOUNTSCreateWorkspaceRequest
- **type:**
  - schema_reference: type references ACCOUNTSTypeEnum schema

### ACCOUNTSOrganization
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **created:**
  - format_dependency: created format date-time may require related fields
- **type:**
  - schema_reference: type references ACCOUNTSTypeEnum schema

### ACCOUNTSOrganizationRequest
- **type:**
  - schema_reference: type references ACCOUNTSTypeEnum schema

### ACCOUNTSPatchedBrandRequest
- **type:**
  - schema_reference: type references ACCOUNTSTypeEnum schema

### ACCOUNTSPatchedOrganizationRequest
- **type:**
  - schema_reference: type references ACCOUNTSTypeEnum schema

### ACCOUNTSPatchedResellerRequest
- **currency_iso_code:**
  - schema_reference: currency_iso_code references ACCOUNTSCurrencyIsoCodeEnum schema
- **type:**
  - schema_reference: type references ACCOUNTSTypeEnum schema

### ACCOUNTSPatchedWorkspaceRequest
- **type:**
  - schema_reference: type references ACCOUNTSTypeEnum schema

### ACCOUNTSReseller
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **created:**
  - format_dependency: created format date-time may require related fields
- **currency_iso_code:**
  - schema_reference: currency_iso_code references ACCOUNTSCurrencyIsoCodeEnum schema
- **type:**
  - schema_reference: type references ACCOUNTSTypeEnum schema

### ACCOUNTSResellerRequest
- **currency_iso_code:**
  - schema_reference: currency_iso_code references ACCOUNTSCurrencyIsoCodeEnum schema
- **type:**
  - schema_reference: type references ACCOUNTSTypeEnum schema

### ACCOUNTSResponseAccount
- **data:**
  - schema_reference: data references ACCOUNTSAccount schema

### ACCOUNTSResponseAccountInfo
- **data:**
  - schema_reference: data references ACCOUNTSAccountInfo schema

### ACCOUNTSResponseAsyncAccount
- **data:**
  - schema_reference: data references ACCOUNTSAccount schema

### ACCOUNTSResponseAsyncAccountInfo
- **data:**
  - schema_reference: data references ACCOUNTSAccountInfo schema

### ACCOUNTSResponseRetrieveAccount
- **data:**
  - schema_reference: data references ACCOUNTSAccount schema

### ACCOUNTSResponseRetrieveAccountInfo
- **data:**
  - schema_reference: data references ACCOUNTSAccountInfo schema

### ACCOUNTSWorkspace
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **created:**
  - format_dependency: created format date-time may require related fields
- **type:**
  - schema_reference: type references ACCOUNTSTypeEnum schema

### ACCOUNTSWorkspaceRequest
- **type:**
  - schema_reference: type references ACCOUNTSTypeEnum schema

### STORAGEBucket
- **edge_access:**
  - schema_reference: edge_access references STORAGEEdgeAccessEnum schema
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### STORAGEBucketCreate
- **edge_access:**
  - schema_reference: edge_access references STORAGEEdgeAccessEnum schema
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### STORAGEBucketCreateRequest
- **edge_access:**
  - schema_reference: edge_access references STORAGEEdgeAccessEnum schema

### STORAGEBucketObject
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### STORAGECredential
- **expiration_date:**
  - format_dependency: expiration_date format date-time may require related fields
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### STORAGECredentialCreateRequest
- **expiration_date:**
  - format_dependency: expiration_date format date-time may require related fields

### STORAGEPatchedBucketRequest
- **edge_access:**
  - schema_reference: edge_access references STORAGEEdgeAccessEnum schema

### STORAGEResponseAsyncBucketCreate
- **data:**
  - schema_reference: data references STORAGEBucketCreate schema

### STORAGEResponseAsyncCredential
- **data:**
  - schema_reference: data references STORAGECredential schema

### STORAGEResponseBucketCreate
- **data:**
  - schema_reference: data references STORAGEBucketCreate schema

### STORAGEResponseCredential
- **data:**
  - schema_reference: data references STORAGECredential schema

### STORAGEResponseListCredential
- **expiration_date:**
  - format_dependency: expiration_date format date-time may require related fields
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### STORAGEResponseRetrieveBucket
- **data:**
  - schema_reference: data references STORAGEBucket schema

### STORAGEResponseRetrieveCredential
- **data:**
  - schema_reference: data references STORAGECredential schema

### STORAGESuccessObjectOperation
- **data:**
  - schema_reference: data references STORAGEObjectResponseData schema

### STORAGESuccessObjectOperationAsync
- **data:**
  - schema_reference: data references STORAGEObjectResponseAsyncData schema

### DATADataStream
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### DATADatadogEndpoint
- **url:**
  - format_dependency: url format uri may require related fields

### DATADatadogEndpointRequest
- **url:**
  - format_dependency: url format uri may require related fields

### DATAElasticsearchEndpoint
- **url:**
  - format_dependency: url format uri may require related fields

### DATAElasticsearchEndpointRequest
- **url:**
  - format_dependency: url format uri may require related fields

### DATAHttpPostEndpoint
- **url:**
  - format_dependency: url format uri may require related fields

### DATAHttpPostEndpointRequest
- **url:**
  - format_dependency: url format uri may require related fields

### DATAInputDataSource
- **data_source:**
  - schema_reference: data_source references DATADataSourceEnum schema

### DATAInputDataSourceAttributes
- **type:**
  - schema_reference: type references DATAInputDataSourceAttributesTypeEnum schema
- **attributes:**
  - schema_reference: attributes references DATAInputDataSource schema

### DATAInputDataSourceAttributesRequest
- **type:**
  - schema_reference: type references DATAInputDataSourceAttributesTypeEnum schema
- **attributes:**
  - schema_reference: attributes references DATAInputDataSourceRequest schema

### DATAInputDataSourceRequest
- **data_source:**
  - schema_reference: data_source references DATADataSourceEnum schema

### DATAOutput
- **type:**
  - schema_reference: type references DATAOutputTypeEnum schema
- **attributes:**
  - schema_reference: attributes references DATAOutputPolymorphic schema

### DATAOutputRequest
- **type:**
  - schema_reference: type references DATAOutputTypeEnum schema
- **attributes:**
  - schema_reference: attributes references DATAOutputPolymorphicRequest schema

### DATAQRadarEndpoint
- **url:**
  - format_dependency: url format uri may require related fields

### DATAQRadarEndpointRequest
- **url:**
  - format_dependency: url format uri may require related fields

### DATAResponseAsyncDataStream
- **data:**
  - schema_reference: data references DATADataStream schema

### DATAResponseAsyncTemplate
- **data:**
  - schema_reference: data references DATATemplate schema

### DATAResponseDataStream
- **data:**
  - schema_reference: data references DATADataStream schema

### DATAResponseListDataStream
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### DATAResponseListTemplate
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### DATAResponseRetrieveDataStream
- **data:**
  - schema_reference: data references DATADataStream schema

### DATAResponseRetrieveTemplate
- **data:**
  - schema_reference: data references DATATemplate schema

### DATAResponseTemplate
- **data:**
  - schema_reference: data references DATATemplate schema

### DATAS3Endpoint
- **content_type:**
  - schema_reference: content_type references DATAContentTypeEnum schema
- **host_url:**
  - format_dependency: host_url format uri may require related fields

### DATAS3EndpointRequest
- **content_type:**
  - schema_reference: content_type references DATAContentTypeEnum schema
- **host_url:**
  - format_dependency: host_url format uri may require related fields

### DATASplunkEndpoint
- **url:**
  - format_dependency: url format uri may require related fields

### DATASplunkEndpointRequest
- **url:**
  - format_dependency: url format uri may require related fields

### DATATemplate
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### DATATransformFilterWorkloadsAttributes
- **type:**
  - schema_reference: type references DATATransformFilterWorkloadsAttributesTypeEnum schema
- **attributes:**
  - schema_reference: attributes references DATATransformFilterWorkloads schema

### DATATransformFilterWorkloadsAttributesRequest
- **type:**
  - schema_reference: type references DATATransformFilterWorkloadsAttributesTypeEnum schema
- **attributes:**
  - schema_reference: attributes references DATATransformFilterWorkloadsRequest schema

### DATATransformRenderTemplateAttributes
- **type:**
  - schema_reference: type references DATATransformRenderTemplateAttributesTypeEnum schema
- **attributes:**
  - schema_reference: attributes references DATATransformRenderTemplate schema

### DATATransformRenderTemplateAttributesRequest
- **type:**
  - schema_reference: type references DATATransformRenderTemplateAttributesTypeEnum schema
- **attributes:**
  - schema_reference: attributes references DATATransformRenderTemplateRequest schema

### DATATransformSamplingAttributes
- **type:**
  - schema_reference: type references DATATransformSamplingAttributesTypeEnum schema
- **attributes:**
  - schema_reference: attributes references DATATransformSampling schema

### DATATransformSamplingAttributesRequest
- **type:**
  - schema_reference: type references DATATransformSamplingAttributesTypeEnum schema
- **attributes:**
  - schema_reference: attributes references DATATransformSamplingRequest schema

### ORCHESTRATORNodes
- **status:**
  - schema_reference: status references ORCHESTRATORStatusEnum schema

### ORCHESTRATORNodesRequest
- **status:**
  - schema_reference: status references ORCHESTRATORStatusEnum schema

### ORCHESTRATORPatchedNodesRequest
- **status:**
  - schema_reference: status references ORCHESTRATORStatusEnum schema

### ORCHESTRATORResponseDeleteNodeServiceBind
- **state:**
  - schema_reference: state references ORCHESTRATORStateEnum schema

### ORCHESTRATORResponseDeleteNodes
- **state:**
  - schema_reference: state references ORCHESTRATORStateEnum schema

### ORCHESTRATORResponseDeleteServices
- **state:**
  - schema_reference: state references ORCHESTRATORStateEnum schema

### ORCHESTRATORResponseListNodes
- **status:**
  - schema_reference: status references ORCHESTRATORStatusEnum schema

### ORCHESTRATORResponseNodeGroupsById
- **state:**
  - schema_reference: state references ORCHESTRATORStateEnum schema
- **data:**
  - schema_reference: data references ORCHESTRATORNodeGroupsById schema

### ORCHESTRATORResponseNodeServices
- **state:**
  - schema_reference: state references ORCHESTRATORStateEnum schema
- **data:**
  - schema_reference: data references ORCHESTRATORNodeServices schema

### ORCHESTRATORResponseNodes
- **state:**
  - schema_reference: state references ORCHESTRATORStateEnum schema
- **data:**
  - schema_reference: data references ORCHESTRATORNodes schema

### ORCHESTRATORResponseRetrieveNodeServiceBind
- **data:**
  - schema_reference: data references ORCHESTRATORNodeServiceBind schema

### ORCHESTRATORResponseRetrieveNodes
- **data:**
  - schema_reference: data references ORCHESTRATORNodes schema

### ORCHESTRATORResponseRetrieveServices
- **data:**
  - schema_reference: data references ORCHESTRATORServices schema

### ORCHESTRATORResponseServices
- **state:**
  - schema_reference: state references ORCHESTRATORStateEnum schema
- **data:**
  - schema_reference: data references ORCHESTRATORServices schema

### VCSContinuousDeployment
- **created:**
  - format_dependency: created format date-time may require related fields
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### VCSExecution
- **created_at:**
  - format_dependency: created_at format date-time may require related fields
- **updated_at:**
  - format_dependency: updated_at format date-time may require related fields

### VCSIntegration
- **provider:**
  - schema_reference: provider references VCSPlatform schema

### VCSResponseAsyncContinuousDeployment
- **data:**
  - schema_reference: data references VCSContinuousDeployment schema

### VCSResponseAsyncExecution
- **data:**
  - schema_reference: data references VCSExecution schema

### VCSResponseAsyncExecutor
- **data:**
  - schema_reference: data references VCSExecutor schema

### VCSResponseContinuousDeployment
- **data:**
  - schema_reference: data references VCSContinuousDeployment schema

### VCSResponseExecution
- **data:**
  - schema_reference: data references VCSExecution schema

### VCSResponseExecutor
- **data:**
  - schema_reference: data references VCSExecutor schema

### VCSResponseListContinuousDeployment
- **created:**
  - format_dependency: created format date-time may require related fields
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### VCSResponseListExecution
- **created_at:**
  - format_dependency: created_at format date-time may require related fields
- **updated_at:**
  - format_dependency: updated_at format date-time may require related fields

### VCSResponseListIntegration
- **provider:**
  - schema_reference: provider references VCSPlatform schema

### VCSResponseListRepository
- **url:**
  - format_dependency: url format uri may require related fields

### VCSResponseRetrieveContinuousDeployment
- **data:**
  - schema_reference: data references VCSContinuousDeployment schema

### VCSResponseRetrieveExecutionScript
- **data:**
  - schema_reference: data references VCSExecutionScript schema

### VCSResponseRetrieveExecutor
- **data:**
  - schema_reference: data references VCSExecutor schema

### VCSResponseRetrieveIntegration
- **data:**
  - schema_reference: data references VCSIntegration schema

### DNSDelegationSigner
- **algorithm_type:**
  - schema_reference: algorithm_type references DNSAlgType schema
- **digest_type:**
  - schema_reference: digest_type references DNSAlgType schema

### DNSDelegationSignerRequest
- **algorithm_type:**
  - schema_reference: algorithm_type references DNSAlgTypeRequest schema
- **digest_type:**
  - schema_reference: digest_type references DNSAlgTypeRequest schema

### DNSPatchedRecordRequest
- **type:**
  - schema_reference: type references DNSTypeEnum schema

### DNSRecord
- **type:**
  - schema_reference: type references DNSTypeEnum schema

### DNSRecordRequest
- **type:**
  - schema_reference: type references DNSTypeEnum schema

### DNSResponseAsyncDNSSEC
- **data:**
  - schema_reference: data references DNSDNSSEC schema

### DNSResponseAsyncRecord
- **data:**
  - schema_reference: data references DNSRecord schema

### DNSResponseAsyncZone
- **data:**
  - schema_reference: data references DNSZone schema

### DNSResponseDNSSEC
- **data:**
  - schema_reference: data references DNSDNSSEC schema

### DNSResponseRecord
- **data:**
  - schema_reference: data references DNSRecord schema

### DNSResponseRetrieveDNSSEC
- **data:**
  - schema_reference: data references DNSDNSSEC schema

### DNSResponseRetrieveRecord
- **data:**
  - schema_reference: data references DNSRecord schema

### DNSResponseRetrieveZone
- **data:**
  - schema_reference: data references DNSZone schema

### DNSResponseZone
- **data:**
  - schema_reference: data references DNSZone schema

### TLSCertificate
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **renewed_at:**
  - format_dependency: renewed_at format date-time may require related fields

### TLSCertificateRequestRequest
- **challenge:**
  - schema_reference: challenge references TLSChallengeEnum schema
- **authority:**
  - schema_reference: authority references TLSAuthorityEnum schema

### TLSCertificateRevocationList
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **last_update:**
  - format_dependency: last_update format date-time may require related fields
- **next_update:**
  - format_dependency: next_update format date-time may require related fields

### TLSCertificateSigningRequestRequest
- **email:**
  - format_dependency: email format email may require related fields

### TLSResponseAsyncCertificate
- **data:**
  - schema_reference: data references TLSCertificate schema

### TLSResponseAsyncCertificateRevocationList
- **data:**
  - schema_reference: data references TLSCertificateRevocationList schema

### TLSResponseCertificate
- **data:**
  - schema_reference: data references TLSCertificate schema

### TLSResponseCertificateRevocationList
- **data:**
  - schema_reference: data references TLSCertificateRevocationList schema

### TLSResponseRetrieveCertificate
- **data:**
  - schema_reference: data references TLSCertificate schema

### TLSResponseRetrieveCertificateRevocationList
- **data:**
  - schema_reference: data references TLSCertificateRevocationList schema

### MARKETPLACEPublisher
- **icon:**
  - format_dependency: icon format uri may require related fields
- **created:**
  - format_dependency: created format date-time may require related fields
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### MARKETPLACEPublisherRequest
- **icon:**
  - format_dependency: icon format uri may require related fields

### MARKETPLACEResponsePublisher
- **state:**
  - schema_reference: state references MARKETPLACEStateEnum schema
- **data:**
  - schema_reference: data references MARKETPLACEPublisher schema

### MARKETPLACEResponseRetrievePublisher
- **data:**
  - schema_reference: data references MARKETPLACEPublisher schema

### IDENTITYGrant
- **expires:**
  - format_dependency: expires format date-time may require related fields

### IDENTITYGrantRequest
- **expires:**
  - format_dependency: expires format date-time may require related fields

### IDENTITYGroup
- **email:**
  - format_dependency: email format email may require related fields
- **created:**
  - format_dependency: created format date-time may require related fields
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### IDENTITYPatchedGrantRequest
- **expires:**
  - format_dependency: expires format date-time may require related fields

### IDENTITYPatchedUserRequest
- **email:**
  - format_dependency: email format email may require related fields

### IDENTITYResponseDeleteFavorite
- **state:**
  - schema_reference: state references IDENTITYStateEnum schema

### IDENTITYResponseDeleteGrant
- **state:**
  - schema_reference: state references IDENTITYStateEnum schema

### IDENTITYResponseDeleteGroup
- **state:**
  - schema_reference: state references IDENTITYStateEnum schema

### IDENTITYResponseDeleteServiceToken
- **state:**
  - schema_reference: state references IDENTITYStateEnum schema

### IDENTITYResponseDeleteUser
- **state:**
  - schema_reference: state references IDENTITYStateEnum schema

### IDENTITYResponseFavorite
- **state:**
  - schema_reference: state references IDENTITYStateEnum schema
- **data:**
  - schema_reference: data references IDENTITYFavorite schema

### IDENTITYResponseGrant
- **state:**
  - schema_reference: state references IDENTITYStateEnum schema
- **data:**
  - schema_reference: data references IDENTITYGrant schema

### IDENTITYResponseGroup
- **state:**
  - schema_reference: state references IDENTITYStateEnum schema
- **data:**
  - schema_reference: data references IDENTITYGroup schema

### IDENTITYResponseGroupMembers
- **state:**
  - schema_reference: state references IDENTITYStateEnum schema
- **data:**
  - schema_reference: data references IDENTITYGroupMembers schema

### IDENTITYResponseListGrant
- **expires:**
  - format_dependency: expires format date-time may require related fields

### IDENTITYResponseListGroup
- **email:**
  - format_dependency: email format email may require related fields
- **created:**
  - format_dependency: created format date-time may require related fields
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields

### IDENTITYResponseListServiceToken
- **email:**
  - format_dependency: email format email may require related fields
- **created:**
  - format_dependency: created format date-time may require related fields
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **expires:**
  - format_dependency: expires format date-time may require related fields
- **last_used:**
  - format_dependency: last_used format date-time may require related fields

### IDENTITYResponseListUser
- **email:**
  - format_dependency: email format email may require related fields
- **created:**
  - format_dependency: created format date-time may require related fields
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **last_login:**
  - format_dependency: last_login format date-time may require related fields

### IDENTITYResponseRetrieveGrant
- **data:**
  - schema_reference: data references IDENTITYGrant schema

### IDENTITYResponseRetrieveGroup
- **data:**
  - schema_reference: data references IDENTITYGroup schema

### IDENTITYResponseRetrieveGroupMembers
- **data:**
  - schema_reference: data references IDENTITYGroupMembers schema

### IDENTITYResponseRetrieveServiceToken
- **data:**
  - schema_reference: data references IDENTITYServiceToken schema

### IDENTITYResponseRetrieveUser
- **data:**
  - schema_reference: data references IDENTITYUser schema

### IDENTITYResponseRetrieveUserInfo
- **data:**
  - schema_reference: data references IDENTITYUserInfo schema

### IDENTITYResponseServiceToken
- **state:**
  - schema_reference: state references IDENTITYStateEnum schema
- **data:**
  - schema_reference: data references IDENTITYServiceToken schema

### IDENTITYResponseServiceTokenCreate
- **state:**
  - schema_reference: state references IDENTITYStateEnum schema
- **data:**
  - schema_reference: data references IDENTITYServiceTokenCreate schema

### IDENTITYResponseServiceTokenRenew
- **state:**
  - schema_reference: state references IDENTITYStateEnum schema
- **data:**
  - schema_reference: data references IDENTITYServiceTokenRenew schema

### IDENTITYResponseUser
- **state:**
  - schema_reference: state references IDENTITYStateEnum schema
- **data:**
  - schema_reference: data references IDENTITYUser schema

### IDENTITYResponseUserInfo
- **state:**
  - schema_reference: state references IDENTITYStateEnum schema
- **data:**
  - schema_reference: data references IDENTITYUserInfo schema

### IDENTITYServiceToken
- **email:**
  - format_dependency: email format email may require related fields
- **created:**
  - format_dependency: created format date-time may require related fields
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **expires:**
  - format_dependency: expires format date-time may require related fields
- **last_used:**
  - format_dependency: last_used format date-time may require related fields

### IDENTITYServiceTokenCreate
- **email:**
  - format_dependency: email format email may require related fields
- **created:**
  - format_dependency: created format date-time may require related fields
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **expires:**
  - format_dependency: expires format date-time may require related fields
- **last_used:**
  - format_dependency: last_used format date-time may require related fields

### IDENTITYServiceTokenCreateRequest
- **expires:**
  - format_dependency: expires format date-time may require related fields

### IDENTITYServiceTokenRenew
- **email:**
  - format_dependency: email format email may require related fields
- **created:**
  - format_dependency: created format date-time may require related fields
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **expires:**
  - format_dependency: expires format date-time may require related fields
- **last_used:**
  - format_dependency: last_used format date-time may require related fields

### IDENTITYServiceTokenRenewRequest
- **expires:**
  - format_dependency: expires format date-time may require related fields

### IDENTITYUser
- **email:**
  - format_dependency: email format email may require related fields
- **created:**
  - format_dependency: created format date-time may require related fields
- **last_modified:**
  - format_dependency: last_modified format date-time may require related fields
- **last_login:**
  - format_dependency: last_login format date-time may require related fields

### IDENTITYUserRequest
- **email:**
  - format_dependency: email format email may require related fields

## 🔘 Module Toggles

### EDGECacheVaryByQuerystringModule
- **sort** (sort_enabled)

### EDGECacheVaryByQuerystringModuleRequest
- **sort** (sort_enabled)

### DATAKafkaEndpoint
- **tls** (use_tls)

### DATAKafkaEndpointRequest
- **tls** (use_tls)

### VCSExecutor
- **is** (is_active)

### IDENTITYPatchedUserRequest
- **two_factor** (two_factor_enabled)

### IDENTITYResponseListUser
- **two_factor** (two_factor_enabled)

### IDENTITYUser
- **two_factor** (two_factor_enabled)

### IDENTITYUserRequest
- **two_factor** (two_factor_enabled)

## ⚠️ Critical Dependency Paths

- **HIGH_COUPLING:** ACCOUNTSTypeEnum has high coupling (16 dependencies)
- **HIGH_COUPLING:** IDENTITYStateEnum has high coupling (14 dependencies)
