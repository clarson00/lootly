/**
 * API Integration Tests
 *
 * Tests the main API flows: auth, check-in, rewards, entitlements
 * Run with: npm test
 */

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

// Test state
let customerToken = null;
let staffToken = null;
let customerQrCode = null;

// Simple test runner
const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

async function runTests() {
  console.log('\n🧪 Running API Integration Tests\n');
  console.log('='.repeat(50));

  for (const { name, fn } of tests) {
    try {
      await fn();
      passed++;
      console.log(`✅ ${name}`);
    } catch (error) {
      failed++;
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('='.repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  process.exit(failed > 0 ? 1 : 0);
}

// Helper to make API requests
async function api(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok && !options.expectError) {
    throw new Error(`API error: ${data.error?.message || response.status}`);
  }

  return { status: response.status, data };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ============================================
// HEALTH & BASIC TESTS
// ============================================

test('Health check returns ok', async () => {
  const { data } = await api('/health');
  assert(data.status === 'ok', 'Health status should be ok');
});

test('Get businesses returns pilot business', async () => {
  const { data } = await api('/businesses');
  assert(data.success, 'Response should be successful');
  assert(data.data.businesses.length > 0, 'Should have at least one business');
  assert(data.data.businesses[0].id === 'biz_pilot', 'Should have pilot business');
});

test('Get business details', async () => {
  const { data } = await api('/businesses/biz_pilot');
  assert(data.success, 'Response should be successful');
  assert(data.data.business.name === "Tony's Restaurant Group", 'Business name should match');
  assert(data.data.locations.length >= 4, 'Should have at least 4 locations');
});

// ============================================
// CUSTOMER AUTH TESTS
// ============================================

test('Request verification code', async () => {
  const { data } = await api('/auth/request-code', {
    method: 'POST',
    body: JSON.stringify({ phone: '+15551234567' }),
  });
  assert(data.success, 'Response should be successful');
});

test('Verify code and get token', async () => {
  const { data } = await api('/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify({ phone: '+15551234567', code: '1234' }),
  });
  assert(data.success, 'Response should be successful');
  assert(data.data.token, 'Should return a token');
  customerToken = data.data.token;
});

test('Get current user (authenticated)', async () => {
  const { data } = await api('/auth/me', { token: customerToken });
  assert(data.success, 'Response should be successful');
  assert(data.data.customer.phone === '+15551234567', 'Phone should match');
});

test('Get customer QR code', async () => {
  const { data } = await api('/customers/qr-code', { token: customerToken });
  assert(data.success, 'Response should be successful');
  assert(data.data.qr_code, 'Should return QR code');
  customerQrCode = data.data.qr_code;
});

// ============================================
// STAFF AUTH TESTS
// ============================================

test('Get locations for staff login', async () => {
  const { data } = await api('/businesses/biz_pilot/locations');
  assert(data.success, 'Response should be successful');
  assert(data.data.locations.length > 0, 'Should have locations');
});

test('Staff login with PIN', async () => {
  const { data: locData } = await api('/businesses/biz_pilot/locations');
  const locationId = locData.data.locations[0].id;

  const { data } = await api('/staff/login', {
    method: 'POST',
    body: JSON.stringify({ location_id: locationId, pin: '1234' }),
  });
  assert(data.success, 'Response should be successful');
  assert(data.data.token, 'Should return a token');
  staffToken = data.data.token;
});

test('Staff lookup customer by QR', async () => {
  const { data } = await api(`/staff/customer/${encodeURIComponent(customerQrCode)}`, {
    token: staffToken,
  });
  assert(data.success, 'Response should be successful');
  assert(data.data.customer, 'Should return customer');
  assert(data.data.enrollment, 'Should return enrollment');
});

// ============================================
// TRANSACTION TESTS
// ============================================

test('Record customer visit', async () => {
  const { data } = await api('/staff/record-visit', {
    method: 'POST',
    token: staffToken,
    body: JSON.stringify({
      customer_qr: customerQrCode,
      spend_amount: 25.00,
    }),
  });
  assert(data.success, 'Response should be successful');
  assert(data.data.transaction.points_earned > 0, 'Should earn points');
});

test('Get transaction history', async () => {
  const { data } = await api('/transactions/history?business_id=biz_pilot', {
    token: customerToken,
  });
  assert(data.success, 'Response should be successful');
  assert(Array.isArray(data.data.transactions), 'Should return transactions array');
});

// ============================================
// REWARDS TESTS
// ============================================

test('Get rewards catalog', async () => {
  const { data } = await api('/rewards?business_id=biz_pilot', {
    token: customerToken,
  });
  assert(data.success, 'Response should be successful');
  // Check that rewards exist (available + locked)
  const totalRewards = (data.data.available_rewards?.length || 0) + (data.data.locked_rewards?.length || 0);
  assert(totalRewards > 0, 'Should have rewards in catalog');
  assert(typeof data.data.points_balance === 'number', 'Should have points balance');
});

// ============================================
// ENTITLEMENTS TESTS
// ============================================

test('Get entitlements for business', async () => {
  const { data } = await api('/entitlements?businessId=biz_pilot');
  assert(data.success, 'Response should be successful');
  assert(data.data.tier === 'free', 'Pilot should be on free tier');
  assert(data.data.features['core:points'] === true, 'Should have core points feature');
  assert(data.data.features['ai:assistant'] === false, 'Should not have AI assistant on free');
});

test('Check specific feature access', async () => {
  const { data } = await api('/entitlements/check/core:checkin?businessId=biz_pilot');
  assert(data.success, 'Response should be successful');
  assert(data.data.hasAccess === true, 'Should have access to core checkin');
});

test('Check premium feature (should be denied)', async () => {
  const { data } = await api('/entitlements/check/ai:assistant?businessId=biz_pilot');
  assert(data.success, 'Response should be successful');
  assert(data.data.hasAccess === false, 'Should not have access to AI assistant');
});

test('Get all tiers info', async () => {
  const { data } = await api('/entitlements/tiers');
  assert(data.success, 'Response should be successful');
  assert(data.data.tiers.length === 4, 'Should have 4 tiers');
});

// ============================================
// ENROLLMENT TESTS
// ============================================

test('Get customer enrollments', async () => {
  const { data } = await api('/enrollments', { token: customerToken });
  assert(data.success, 'Response should be successful');
  assert(data.data.enrollments.length > 0, 'Should have at least one enrollment');
});

test('Get specific enrollment', async () => {
  const { data } = await api('/enrollments/biz_pilot', { token: customerToken });
  assert(data.success, 'Response should be successful');
  assert(data.data.enrollment.business_id === 'biz_pilot', 'Should be for pilot business');
  assert(typeof data.data.enrollment.points_balance === 'number', 'Should have points balance');
});

// ============================================
// ERROR HANDLING TESTS
// ============================================

test('Invalid auth returns 401', async () => {
  const { status } = await api('/auth/me', {
    token: 'invalid-token',
    expectError: true,
  });
  assert(status === 401, 'Should return 401 for invalid token');
});

test('Invalid verification code returns error', async () => {
  const { data } = await api('/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify({ phone: '+15551234567', code: 'abcd' }),
    expectError: true,
  });
  assert(!data.success, 'Should not be successful');
});

test('Non-existent route returns 404', async () => {
  const { status } = await api('/nonexistent', { expectError: true });
  assert(status === 404, 'Should return 404');
});

// Run all tests
runTests();
