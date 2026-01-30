const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class StaffApiClient {
  constructor() {
    this.token = sessionStorage.getItem('lootly_staff_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      sessionStorage.setItem('lootly_staff_token', token);
    } else {
      sessionStorage.removeItem('lootly_staff_token');
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
        window.location.href = '/';
      }
      throw error;
    }
  }

  // Auth
  async login(locationId, pin) {
    const result = await this.request('/staff/login', {
      method: 'POST',
      body: JSON.stringify({ location_id: locationId, pin })
    });
    if (result.data?.token) {
      this.setToken(result.data.token);
    }
    return result;
  }

  // Get locations for login dropdown
  async getLocations() {
    return this.request('/businesses/biz_pilot/locations');
  }

  // Look up customer by QR code
  async getCustomer(qrCode) {
    return this.request(`/staff/customer/${encodeURIComponent(qrCode)}`);
  }

  // Record visit/spend
  async recordVisit(customerQr, spendAmount) {
    return this.request('/staff/record-visit', {
      method: 'POST',
      body: JSON.stringify({
        customer_qr: customerQr,
        spend_amount: spendAmount
      })
    });
  }

  // Redeem reward
  async redeemReward(redemptionCode) {
    return this.request('/staff/redeem', {
      method: 'POST',
      body: JSON.stringify({ redemption_code: redemptionCode })
    });
  }

  // Verify redemption code (before confirming)
  async verifyRedemption(code) {
    return this.request(`/rewards/redemption/${encodeURIComponent(code)}`);
  }

  // Logout
  logout() {
    this.setToken(null);
  }
}

export const api = new StaffApiClient();
export default api;
