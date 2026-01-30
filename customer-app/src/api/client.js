const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('lootly_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('lootly_token', token);
    } else {
      localStorage.removeItem('lootly_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw { status: response.status, ...data };
      }

      return data;
    } catch (error) {
      if (error.status === 401) {
        this.setToken(null);
        window.location.href = '/login';
      }
      throw error;
    }
  }

  // Auth
  async requestCode(phone) {
    return this.request('/auth/request-code', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  }

  async verifyCode(phone, code) {
    const result = await this.request('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ phone, code })
    });
    if (result.data?.token) {
      this.setToken(result.data.token);
    }
    return result;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Profile
  async updateProfile(data) {
    return this.request('/customers/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async getQRCode() {
    return this.request('/customers/qr-code');
  }

  // Businesses
  async getBusinesses() {
    return this.request('/businesses');
  }

  async getBusiness(id) {
    return this.request(`/businesses/${id}`);
  }

  // Enrollments
  async getEnrollments() {
    return this.request('/enrollments');
  }

  async getEnrollment(businessId) {
    return this.request(`/enrollments/${businessId}`);
  }

  async enroll(businessId) {
    return this.request('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId })
    });
  }

  // Transactions
  async getTransactionHistory(businessId) {
    const query = businessId ? `?business_id=${businessId}` : '';
    return this.request(`/transactions/history${query}`);
  }

  // Rewards
  async getRewards(businessId) {
    return this.request(`/rewards?business_id=${businessId}`);
  }

  async getReward(id) {
    return this.request(`/rewards/${id}`);
  }

  async unlockReward(id) {
    return this.request(`/rewards/${id}/unlock`, {
      method: 'POST'
    });
  }

  // Entitlements
  async getEntitlements(businessId) {
    return this.request(`/entitlements?businessId=${businessId}`);
  }

  async checkFeature(businessId, feature) {
    return this.request(`/entitlements/check/${encodeURIComponent(feature)}?businessId=${businessId}`);
  }

  // Voyages
  async getVoyages(businessId) {
    return this.request(`/voyages?business_id=${businessId}`);
  }

  async getVoyage(businessId, voyageId) {
    return this.request(`/voyages/${voyageId}?business_id=${businessId}`);
  }

  async startVoyage(businessId, voyageId) {
    return this.request(`/voyages/${voyageId}/start`, {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId })
    });
  }

  // Logout
  logout() {
    this.setToken(null);
  }
}

export const api = new ApiClient();
export default api;
