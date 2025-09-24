// ***********************************************
// Edge Application Helper Classes - Adapted from Behave project
// ***********************************************

/**
 * Edge Application Class - Based on the working API project structure
 */
class EdgeApplication {}
  constructor() {}
    this.id = null
    this.mainSettings = {}
      name: 'New Edge App'
      edge_cache_enabled: true
      edge_functions_enabled: false
      application_accelerator_enabled: false
      image_processor_enabled: false
      tiered_cache_enabled: false
      active: true
      debug: false
    }
    this.domain = null
    this.origins = []
    this.cacheSettings = []
    this.rulesEngine = []
  }

  update(data) {}
    for (const [configName, configValue] of Object.entries(data)) {}
      if (configValue === null) {}
        delete this.mainSettings[configName]
      } else {}
        this.mainSettings[configName] = configValue
      }
    }
  }

  getData() {}
    return this.mainSettings
  }

  setId(appId) {}
    this.id = appId
  }

  setDomain(domainData) {}
    this.domain = domainData
  }

  getDomainName() {}
    if (this.domain && Array.isArray(this.domain) && this.domain.length > 0) {}
      return this.domain[0].domain
    }
    return null
  }

  getConfigByName(configName) {}
    return this.mainSettings[configName]
  }

  addOrigin(origin) {}
    this.origins.push(origin)
  }

  addCacheSetting(cacheSetting) {}
    this.cacheSettings.push(cacheSetting)
  }

  addRulesEngineRule(rule) {}
    this.rulesEngine.push(rule)
  }
}

/**
 * Test Data Factory - Based on existing project patterns
 */

  static generateEdgeApplicationData(type = 'Single Origin') {}
    const timestamp = Date.now()