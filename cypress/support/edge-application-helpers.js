// ***********************************************
// Edge Application Helper Classes - Adapted from Behave project
// ***********************************************

/**
 * Edge Application Class - Based on the working API project structure
 */
class EdgeApplication {
  constructor() {
    this.id = null;
    this.mainSettings = {
      name: "New Edge App",
      edge_cache_enabled: true,
      edge_functions_enabled: false,
      application_accelerator_enabled: false,
      image_processor_enabled: false,
      tiered_cache_enabled: false,
      active: true,
      debug: false,
    };
    this.domain = null;
    this.origins = [];
    this.cacheSettings = [];
    this.rulesEngine = [];
  }

  update(data) {
    for (const [configName, configValue] of Object.entries(data)) {
      if (configValue === null) {
        delete this.mainSettings[configName];
      } else {
        this.mainSettings[configName] = configValue;
      }
    }
  }

  getData() {
    return this.mainSettings;
  }

  setId(appId) {
    this.id = appId;
  }

  setDomain(domainData) {
    this.domain = domainData;
  }

  getDomainName() {
    if (this.domain && Array.isArray(this.domain) && this.domain.length > 0) {
      return this.domain[0].domain;
    }
    return null;
  }

  getConfigByName(configName) {
    return this.mainSettings[configName];
  }

  addOrigin(origin) {
    this.origins.push(origin);
  }

  addCacheSetting(cacheSetting) {
    this.cacheSettings.push(cacheSetting);
  }

  addRulesEngineRule(rule) {
    this.rulesEngine.push(rule);
  }
}

/**
 * Test Data Factory - Based on existing project patterns
 */
class AzionTestDataFactory {
  static generateEdgeApplicationData(type = "Single Origin") {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    const baseData = {
      name: `Test Edge App ${timestamp}`,
      edge_cache_enabled: true,
      edge_functions_enabled: false,
      application_accelerator_enabled: false,
      image_processor_enabled: false,
      tiered_cache_enabled: false,
      active: true,
      debug: false,
    };

    switch (type) {
      case "Single Origin":
        return {
          ...baseData,
          delivery_protocol: "http,https",
          origin_type: "single_origin"
        };
      case "Load Balancer":
        return {
          ...baseData,
          delivery_protocol: "http,https",
          origin_type: "load_balancer"
        };
      case "Live Ingest":
        return {
          ...baseData,
          delivery_protocol: "http,https",
          origin_type: "live_ingest"
        };
      default:
        return baseData;
    }
  }

  static generateOriginData(type = "single_origin") {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    const baseOrigin = {
      name: `Test Origin ${timestamp}`,
      origin_type: type,
      host_header: "${host}",
    };

    switch (type) {
      case "single_origin":
        return {
          ...baseOrigin,
          addresses: [{ address: "httpbingo.org" }],
          origin_protocol_policy: "preserve"
        };
      case "load_balancer":
        return {
          ...baseOrigin,
          addresses: [
            { address: "httpbingo.org" },
            { address: "www.httpbin.org" }
          ],
          origin_protocol_policy: "preserve"
        };
      case "object_storage":
        return {
          ...baseOrigin,
          bucket: `test-bucket-${random}`,
          prefix: "/test"
        };
      default:
        return baseOrigin;
    }
  }

  static generateDomainData() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    return {
      name: `test${random}-${timestamp}.example.com`,
      cname_access_only: false,
      digital_certificate_id: null,
      edge_application_id: null,
      is_active: true
    };
  }

  static generateCacheSettingData() {
    const timestamp = Date.now();
    
    return {
      name: `Test Cache Setting ${timestamp}`,
      browser_cache_settings: "honor",
      browser_cache_settings_maximum_ttl: 0,
      cdn_cache_settings: "honor",
      cdn_cache_settings_maximum_ttl: 0,
      cache_by_query_string: "ignore",
      query_string_fields: [],
      enable_query_string_sort: false,
      cache_by_cookies: "ignore",
      cookie_names: [],
      adaptive_delivery_action: "ignore",
      device_group: [],
      enable_caching_for_post: false,
      l2_caching_enabled: false,
      is_slice_configuration_enabled: false,
      is_slice_edge_caching_enabled: false,
      is_slice_l2_caching_enabled: false,
      slice_configuration_range: 1024
    };
  }

  static generateRulesEngineData(phase = "request") {
    const timestamp = Date.now();
    
    const baseRule = {
      name: `Test Rule ${timestamp}`,
      phase: phase,
      criteria: [
        [
          {
            variable: "${uri}",
            operator: "starts_with",
            conditional: "if",
            input_value: "/test"
          }
        ]
      ],
      behaviors: []
    };

    if (phase === "request") {
      baseRule.behaviors = [
        {
          name: "set_cache_policy",
          target: null
        }
      ];
    } else {
      baseRule.behaviors = [
        {
          name: "add_response_header",
          target: {
            name: "X-Test-Header",
            value: "test-value"
          }
        }
      ];
    }

    return baseRule;
  }

  static generateRandomName(prefix = "test") {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}_${timestamp}_${random}`;
  }

  static generateRandomUri() {
    const random = Math.floor(Math.random() * 1000);
    return `/test-${random}-${Date.now()}`;
  }
}

/**
 * Environment Configuration - Based on constants.py
 */
class EnvironmentConfig {
  static getConfig() {
    const environment = Cypress.env('environment') || 'stage';
    
    const environments = {
      dev: {
        baseUrl: 'http://localhost:8080/api',
        authEndpoint: 'http://localhost:9999/api/tokens',
        webUI: 'http://localhost:8080'
      },
      stage: {
        baseUrl: 'https://stage-api.azion.com/v4',
        authEndpoint: 'https://stage-api.azion.net/tokens',
        webUI: 'https://stage-manager.azion.com'
      },
      prod: {
        baseUrl: 'https://api.azion.com/v4',
        authEndpoint: 'https://api.azionapi.net/tokens',
        webUI: 'https://manager.azion.com'
      }
    };

    return environments[environment] || environments.stage;
  }

  static getUpstreamAddresses() {
    return {
      ipv4_domain: { address: "httpbingo.org", host_header: "httpbingo.org" },
      ipv6_domain: { address: "ipv6test.google.com", host_header: "ipv6test.google.com" },
      ipv4_ipv6_domain: { address: "google.com", host_header: "google.com" },
      ipv6_address: { address: "2607:f8b0:4006:80f::200e", host_header: "ipv6test.google.com" }
    };
  }
}

// Export classes for use in tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EdgeApplication,
    AzionTestDataFactory,
    EnvironmentConfig
  };
}

// Make classes available globally in Cypress
if (typeof window !== 'undefined') {
  window.EdgeApplication = EdgeApplication;
  window.AzionTestDataFactory = AzionTestDataFactory;
  window.EnvironmentConfig = EnvironmentConfig;
}
