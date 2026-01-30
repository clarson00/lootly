/**
 * Social Media Integrations API
 * Handles OAuth flow for Facebook/Instagram and integration management
 */
const express = require('express');
const router = express.Router();
const { db, schema, generateId } = require('../../db');
const { eq, and, isNull } = require('drizzle-orm');
const { authenticateStaff } = require('../../middleware/auth');
const { encrypt, decrypt, generateOAuthState, shouldRefreshToken } = require('../../lib/crypto');

const { socialIntegrations, businesses, locations } = schema;

// Meta (Facebook/Instagram) OAuth configuration
const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const META_REDIRECT_URI = process.env.META_REDIRECT_URI || 'http://localhost:3001/api/admin/integrations/meta/callback';

// Required scopes for FB/IG posting
const META_SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'instagram_basic',
  'instagram_content_publish',
].join(',');

// In-memory state store (in production, use Redis)
const oauthStates = new Map();

// ============================================
// LIST INTEGRATIONS
// ============================================

/**
 * GET /api/admin/integrations
 * List all connected social integrations for a business
 */
router.get('/', authenticateStaff, async (req, res) => {
  try {
    const { business_id } = req.staff;
    const { location_id } = req.query;

    // Build query conditions
    const conditions = [eq(socialIntegrations.businessId, business_id)];

    if (location_id) {
      conditions.push(eq(socialIntegrations.locationId, location_id));
    }

    const integrations = await db
      .select({
        id: socialIntegrations.id,
        platform: socialIntegrations.platform,
        platformAccountName: socialIntegrations.platformAccountName,
        platformAccountId: socialIntegrations.platformAccountId,
        locationId: socialIntegrations.locationId,
        isActive: socialIntegrations.isActive,
        tokenExpiresAt: socialIntegrations.tokenExpiresAt,
        lastRefreshedAt: socialIntegrations.lastRefreshedAt,
        lastErrorAt: socialIntegrations.lastErrorAt,
        lastErrorMessage: socialIntegrations.lastErrorMessage,
        connectedAt: socialIntegrations.connectedAt,
      })
      .from(socialIntegrations)
      .where(and(...conditions));

    // Add status indicators
    const integrationsWithStatus = integrations.map(integration => ({
      ...integration,
      needsReconnect: integration.lastErrorAt && !integration.lastRefreshedAt,
      tokenExpiring: shouldRefreshToken(integration.tokenExpiresAt),
    }));

    res.json({
      success: true,
      data: { integrations: integrationsWithStatus }
    });
  } catch (error) {
    console.error('[INTEGRATIONS] Error listing integrations:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch integrations' }
    });
  }
});

// ============================================
// META OAUTH FLOW
// ============================================

/**
 * GET /api/admin/integrations/meta/connect
 * Initiate Meta (Facebook/Instagram) OAuth flow
 * Returns the OAuth URL to redirect the user to
 */
router.get('/meta/connect', authenticateStaff, async (req, res) => {
  try {
    if (!META_APP_ID) {
      return res.status(503).json({
        success: false,
        error: { code: 'NOT_CONFIGURED', message: 'Meta OAuth is not configured' }
      });
    }

    const { business_id, id: staff_id } = req.staff;
    const { location_id } = req.query; // Optional: connect for specific location

    // Generate state parameter to prevent CSRF
    const state = generateOAuthState();

    // Store state with context (expires in 10 minutes)
    oauthStates.set(state, {
      business_id,
      staff_id,
      location_id: location_id || null,
      expires: Date.now() + 10 * 60 * 1000
    });

    // Clean up expired states
    for (const [key, value] of oauthStates) {
      if (value.expires < Date.now()) {
        oauthStates.delete(key);
      }
    }

    // Build OAuth URL
    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.set('client_id', META_APP_ID);
    authUrl.searchParams.set('redirect_uri', META_REDIRECT_URI);
    authUrl.searchParams.set('scope', META_SCOPES);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');

    res.json({
      success: true,
      data: {
        authUrl: authUrl.toString(),
        state
      }
    });
  } catch (error) {
    console.error('[INTEGRATIONS] Error initiating OAuth:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to initiate OAuth' }
    });
  }
});

/**
 * GET /api/admin/integrations/meta/callback
 * Handle Meta OAuth callback
 * Exchanges code for access token and saves integration
 */
router.get('/meta/callback', async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    // Handle OAuth errors
    if (error) {
      console.error('[INTEGRATIONS] OAuth error:', error, error_description);
      return res.redirect(`${process.env.ADMIN_APP_URL || 'http://localhost:5173'}/settings/integrations?error=${encodeURIComponent(error_description || error)}`);
    }

    if (!code || !state) {
      return res.redirect(`${process.env.ADMIN_APP_URL || 'http://localhost:5173'}/settings/integrations?error=missing_params`);
    }

    // Validate state
    const stateData = oauthStates.get(state);
    if (!stateData || stateData.expires < Date.now()) {
      oauthStates.delete(state);
      return res.redirect(`${process.env.ADMIN_APP_URL || 'http://localhost:5173'}/settings/integrations?error=invalid_state`);
    }

    // Clear used state
    oauthStates.delete(state);

    const { business_id, staff_id, location_id } = stateData;

    // Exchange code for access token
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', META_APP_ID);
    tokenUrl.searchParams.set('client_secret', META_APP_SECRET);
    tokenUrl.searchParams.set('redirect_uri', META_REDIRECT_URI);
    tokenUrl.searchParams.set('code', code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('[INTEGRATIONS] Token exchange error:', tokenData.error);
      return res.redirect(`${process.env.ADMIN_APP_URL || 'http://localhost:5173'}/settings/integrations?error=token_exchange_failed`);
    }

    const { access_token, expires_in } = tokenData;

    // Get user's Facebook Pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${access_token}`
    );
    const pagesData = await pagesResponse.json();

    if (pagesData.error) {
      console.error('[INTEGRATIONS] Pages fetch error:', pagesData.error);
      return res.redirect(`${process.env.ADMIN_APP_URL || 'http://localhost:5173'}/settings/integrations?error=pages_fetch_failed`);
    }

    const pages = pagesData.data || [];

    if (pages.length === 0) {
      return res.redirect(`${process.env.ADMIN_APP_URL || 'http://localhost:5173'}/settings/integrations?error=no_pages`);
    }

    // For MVP, use the first page (in future, let user select)
    const page = pages[0];
    const pageAccessToken = page.access_token;

    // Get long-lived page token
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${pageAccessToken}`
    );
    const longLivedData = await longLivedResponse.json();

    const longLivedToken = longLivedData.access_token || pageAccessToken;
    const tokenExpiry = longLivedData.expires_in
      ? new Date(Date.now() + longLivedData.expires_in * 1000)
      : new Date(Date.now() + expires_in * 1000);

    // Check for linked Instagram Business account
    const igResponse = await fetch(
      `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${longLivedToken}`
    );
    const igData = await igResponse.json();
    const igAccountId = igData.instagram_business_account?.id;

    // Save Facebook integration
    const fbIntegrationId = generateId('sint');
    await db.insert(socialIntegrations).values({
      id: fbIntegrationId,
      businessId: business_id,
      locationId: location_id,
      platform: 'facebook',
      platformAccountId: page.id,
      platformAccountName: page.name,
      platformPageId: page.id,
      accessToken: encrypt(longLivedToken),
      tokenExpiresAt: tokenExpiry,
      scopes: META_SCOPES.split(','),
      connectedBy: staff_id,
    }).onConflictDoUpdate({
      target: [socialIntegrations.businessId, socialIntegrations.platform, socialIntegrations.locationId],
      set: {
        platformAccountId: page.id,
        platformAccountName: page.name,
        platformPageId: page.id,
        accessToken: encrypt(longLivedToken),
        tokenExpiresAt: tokenExpiry,
        scopes: META_SCOPES.split(','),
        isActive: true,
        lastErrorAt: null,
        lastErrorMessage: null,
        updatedAt: new Date(),
      }
    });

    console.log(`[INTEGRATIONS] Facebook connected for business ${business_id}: ${page.name}`);

    // Save Instagram integration if available
    if (igAccountId) {
      // Get IG account info
      const igInfoResponse = await fetch(
        `https://graph.facebook.com/v18.0/${igAccountId}?fields=username&access_token=${longLivedToken}`
      );
      const igInfo = await igInfoResponse.json();

      await db.insert(socialIntegrations).values({
        id: generateId('sint'),
        businessId: business_id,
        locationId: location_id,
        platform: 'instagram',
        platformAccountId: igAccountId,
        platformAccountName: igInfo.username || 'Instagram',
        platformPageId: page.id, // Uses FB page token
        accessToken: encrypt(longLivedToken), // Same token as FB
        tokenExpiresAt: tokenExpiry,
        scopes: META_SCOPES.split(','),
        connectedBy: staff_id,
      }).onConflictDoUpdate({
        target: [socialIntegrations.businessId, socialIntegrations.platform, socialIntegrations.locationId],
        set: {
          platformAccountId: igAccountId,
          platformAccountName: igInfo.username || 'Instagram',
          platformPageId: page.id,
          accessToken: encrypt(longLivedToken),
          tokenExpiresAt: tokenExpiry,
          scopes: META_SCOPES.split(','),
          isActive: true,
          lastErrorAt: null,
          lastErrorMessage: null,
          updatedAt: new Date(),
        }
      });

      console.log(`[INTEGRATIONS] Instagram connected for business ${business_id}: ${igInfo.username}`);
    }

    // Redirect back to admin app
    res.redirect(`${process.env.ADMIN_APP_URL || 'http://localhost:5173'}/settings/integrations?success=connected`);
  } catch (error) {
    console.error('[INTEGRATIONS] OAuth callback error:', error);
    res.redirect(`${process.env.ADMIN_APP_URL || 'http://localhost:5173'}/settings/integrations?error=callback_failed`);
  }
});

// ============================================
// DISCONNECT INTEGRATION
// ============================================

/**
 * DELETE /api/admin/integrations/:id
 * Disconnect (deactivate) a social integration
 */
router.delete('/:id', authenticateStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.staff;

    // Verify ownership
    const [integration] = await db
      .select()
      .from(socialIntegrations)
      .where(and(
        eq(socialIntegrations.id, id),
        eq(socialIntegrations.businessId, business_id)
      ));

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Integration not found' }
      });
    }

    // Soft delete - mark as inactive and clear tokens
    await db.update(socialIntegrations)
      .set({
        isActive: false,
        accessToken: null,
        refreshToken: null,
        updatedAt: new Date(),
      })
      .where(eq(socialIntegrations.id, id));

    console.log(`[INTEGRATIONS] Disconnected ${integration.platform} for business ${business_id}`);

    res.json({
      success: true,
      message: 'Integration disconnected'
    });
  } catch (error) {
    console.error('[INTEGRATIONS] Error disconnecting:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to disconnect integration' }
    });
  }
});

// ============================================
// REFRESH TOKEN (Proactive)
// ============================================

/**
 * POST /api/admin/integrations/:id/refresh
 * Manually refresh an integration's access token
 */
router.post('/:id/refresh', authenticateStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.staff;

    // Get integration
    const [integration] = await db
      .select()
      .from(socialIntegrations)
      .where(and(
        eq(socialIntegrations.id, id),
        eq(socialIntegrations.businessId, business_id),
        eq(socialIntegrations.isActive, true)
      ));

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Integration not found' }
      });
    }

    if (integration.platform !== 'facebook' && integration.platform !== 'instagram') {
      return res.status(400).json({
        success: false,
        error: { code: 'UNSUPPORTED', message: 'Token refresh not supported for this platform' }
      });
    }

    // Decrypt current token
    const currentToken = decrypt(integration.accessToken);
    if (!currentToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Unable to decrypt stored token' }
      });
    }

    // Exchange for new long-lived token
    const refreshResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${currentToken}`
    );
    const refreshData = await refreshResponse.json();

    if (refreshData.error) {
      // Mark integration as having an error
      await db.update(socialIntegrations)
        .set({
          lastErrorAt: new Date(),
          lastErrorMessage: refreshData.error.message,
          updatedAt: new Date(),
        })
        .where(eq(socialIntegrations.id, id));

      return res.status(400).json({
        success: false,
        error: { code: 'REFRESH_FAILED', message: refreshData.error.message }
      });
    }

    const { access_token: newToken, expires_in } = refreshData;
    const newExpiry = new Date(Date.now() + expires_in * 1000);

    // Update integration
    await db.update(socialIntegrations)
      .set({
        accessToken: encrypt(newToken),
        tokenExpiresAt: newExpiry,
        lastRefreshedAt: new Date(),
        lastErrorAt: null,
        lastErrorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(socialIntegrations.id, id));

    // Also update paired integration (FB/IG share token)
    if (integration.platform === 'facebook') {
      await db.update(socialIntegrations)
        .set({
          accessToken: encrypt(newToken),
          tokenExpiresAt: newExpiry,
          lastRefreshedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(socialIntegrations.businessId, business_id),
          eq(socialIntegrations.platform, 'instagram'),
          eq(socialIntegrations.locationId, integration.locationId)
        ));
    }

    console.log(`[INTEGRATIONS] Token refreshed for ${integration.platform}, business ${business_id}`);

    res.json({
      success: true,
      data: {
        tokenExpiresAt: newExpiry,
        lastRefreshedAt: new Date()
      }
    });
  } catch (error) {
    console.error('[INTEGRATIONS] Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to refresh token' }
    });
  }
});

module.exports = router;
