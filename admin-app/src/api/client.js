/**
 * Admin API Client
 *
 * Handles all API calls to the backend for admin functionality.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('admin_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.error?.message || 'Request failed',
      data.error?.code || 'UNKNOWN_ERROR',
      response.status
    );
  }

  return data;
}

export const api = {
  // Auth
  async login(email, password) {
    const result = await request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.data?.token) {
      localStorage.setItem('admin_token', result.data.token);
    }
    return result;
  },

  logout() {
    localStorage.removeItem('admin_token');
  },

  // Rules
  async getRules(businessId, options = {}) {
    const params = new URLSearchParams({ business_id: businessId, ...options });
    return request(`/admin/rules?${params}`);
  },

  async getRule(businessId, ruleId) {
    return request(`/admin/rules/${ruleId}?business_id=${businessId}`);
  },

  async createRule(businessId, ruleData) {
    return request('/admin/rules', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, ...ruleData }),
    });
  },

  async updateRule(businessId, ruleId, ruleData) {
    return request(`/admin/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify({ business_id: businessId, ...ruleData }),
    });
  },

  async deleteRule(businessId, ruleId) {
    return request(`/admin/rules/${ruleId}?business_id=${businessId}`, {
      method: 'DELETE',
    });
  },

  // Rule Simulation
  async simulateBulk(businessId, ruleId) {
    return request('/admin/rules/simulate/bulk', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, rule_id: ruleId }),
    });
  },

  async simulateCustomer(businessId, ruleId, customerId) {
    return request('/admin/rules/simulate/customer', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, rule_id: ruleId, customer_id: customerId }),
    });
  },

  async simulateWhatIf(businessId, ruleId, customerId, scenario) {
    return request('/admin/rules/simulate/what-if', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, rule_id: ruleId, customer_id: customerId, scenario }),
    });
  },

  // Rulesets (Voyages)
  async getRulesets(businessId, options = {}) {
    const params = new URLSearchParams({ business_id: businessId, ...options });
    return request(`/admin/rulesets?${params}`);
  },

  async getRuleset(businessId, rulesetId) {
    return request(`/admin/rulesets/${rulesetId}?business_id=${businessId}`);
  },

  async createRuleset(businessId, rulesetData) {
    return request('/admin/rulesets', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, ...rulesetData }),
    });
  },

  async updateRuleset(businessId, rulesetId, rulesetData) {
    return request(`/admin/rulesets/${rulesetId}`, {
      method: 'PUT',
      body: JSON.stringify({ business_id: businessId, ...rulesetData }),
    });
  },

  async deleteRuleset(businessId, rulesetId) {
    return request(`/admin/rulesets/${rulesetId}?business_id=${businessId}`, {
      method: 'DELETE',
    });
  },

  async addRulesToRuleset(businessId, rulesetId, ruleIds) {
    return request(`/admin/rulesets/${rulesetId}/rules`, {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, rule_ids: ruleIds }),
    });
  },

  async getRulesetProgress(businessId, rulesetId, customerId = null) {
    const params = new URLSearchParams({ business_id: businessId });
    if (customerId) params.append('customer_id', customerId);
    return request(`/admin/rulesets/${rulesetId}/progress?${params}`);
  },

  // Entitlements
  async getEntitlements(businessId) {
    return request(`/entitlements?business_id=${businessId}`);
  },

  // Businesses (for business selector)
  async getBusinesses() {
    return request('/businesses');
  },

  // Locations
  async getLocations(businessId) {
    return request(`/businesses/${businessId}`);
  },

  // ==========================================
  // Social Integrations
  // ==========================================

  async getIntegrations(businessId, locationId = null) {
    const params = new URLSearchParams({ business_id: businessId });
    if (locationId) params.append('location_id', locationId);
    return request(`/admin/integrations?${params}`);
  },

  async getMetaAuthUrl(locationId = null) {
    const params = new URLSearchParams();
    if (locationId) params.append('location_id', locationId);
    return request(`/admin/integrations/meta/connect?${params}`);
  },

  async disconnectIntegration(integrationId) {
    return request(`/admin/integrations/${integrationId}`, {
      method: 'DELETE',
    });
  },

  async refreshIntegration(integrationId) {
    return request(`/admin/integrations/${integrationId}/refresh`, {
      method: 'POST',
    });
  },

  // ==========================================
  // Marketing Posts
  // ==========================================

  async getMarketingPosts(businessId, options = {}) {
    const params = new URLSearchParams({ business_id: businessId, ...options });
    return request(`/admin/marketing/posts?${params}`);
  },

  async getMarketingPost(businessId, postId) {
    return request(`/admin/marketing/posts/${postId}?business_id=${businessId}`);
  },

  async createMarketingPost(businessId, postData) {
    return request(`/admin/marketing/posts?business_id=${businessId}`, {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  async updateMarketingPost(businessId, postId, postData) {
    return request(`/admin/marketing/posts/${postId}?business_id=${businessId}`, {
      method: 'PATCH',
      body: JSON.stringify(postData),
    });
  },

  async deleteMarketingPost(businessId, postId) {
    return request(`/admin/marketing/posts/${postId}?business_id=${businessId}`, {
      method: 'DELETE',
    });
  },

  async publishMarketingPost(businessId, postId) {
    return request(`/admin/marketing/posts/${postId}/publish?business_id=${businessId}`, {
      method: 'POST',
    });
  },

  async cloneMarketingPost(businessId, postId, locationId = null) {
    return request(`/admin/marketing/posts/${postId}/clone?business_id=${businessId}`, {
      method: 'POST',
      body: JSON.stringify({ location_id: locationId }),
    });
  },

  async getMarketingPreview(businessId, sourceType, sourceId) {
    const params = new URLSearchParams({ business_id: businessId, source_type: sourceType, source_id: sourceId });
    return request(`/admin/marketing/preview?${params}`);
  },

  async getMarketingCalendar(businessId, startDate, endDate, locationId = null) {
    const params = new URLSearchParams({ business_id: businessId, start_date: startDate, end_date: endDate });
    if (locationId) params.append('location_id', locationId);
    return request(`/admin/marketing/calendar?${params}`);
  },
};

export { ApiError };
