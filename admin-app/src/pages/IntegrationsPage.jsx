import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAdminAuth } from '../context/AdminAuthContext';

/**
 * IntegrationsPage - Manage social media integrations
 */
export default function IntegrationsPage() {
  const { businessId } = useAdminAuth();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check for OAuth callback results
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const errorMsg = params.get('error');

    if (success === 'connected') {
      setSuccessMessage('Successfully connected your social account!');
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
    } else if (errorMsg) {
      setError(`Connection failed: ${errorMsg.replace(/_/g, ' ')}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Load integrations
  useEffect(() => {
    loadIntegrations();
  }, [businessId]);

  async function loadIntegrations() {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getIntegrations(businessId);
      setIntegrations(result.data?.integrations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    try {
      setConnecting(true);
      setError(null);
      const result = await api.getMetaAuthUrl();
      // Redirect to Facebook OAuth
      window.location.href = result.data.authUrl;
    } catch (err) {
      setError(err.message);
      setConnecting(false);
    }
  }

  async function handleDisconnect(integrationId, platform) {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) {
      return;
    }

    try {
      await api.disconnectIntegration(integrationId);
      setSuccessMessage(`${platform} disconnected successfully`);
      loadIntegrations();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRefresh(integrationId) {
    try {
      await api.refreshIntegration(integrationId);
      setSuccessMessage('Token refreshed successfully');
      loadIntegrations();
    } catch (err) {
      setError(err.message);
    }
  }

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const facebookIntegration = integrations.find(i => i.platform === 'facebook');
  const instagramIntegration = integrations.find(i => i.platform === 'instagram');
  const hasMetaConnection = facebookIntegration || instagramIntegration;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Social Integrations</h1>
        <p className="text-gray-600 mt-1">
          Connect your social media accounts to post directly from Lootly
        </p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Meta (Facebook/Instagram) */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.623 3.872 10.328 9.092 11.63-.056-.162-.092-.35-.092-.583v-2.051h-1.508c-.821 0-1.551-.353-1.905-1.009-.393-.729-.461-1.844-1.435-2.526-.289-.227-.069-.486.264-.451.615.174 1.125.596 1.605 1.222.478.627.703.769 1.596.769.433 0 1.081-.025 1.691-.121.328-.833.895-1.6 1.588-1.962-3.996-.411-5.903-2.399-5.903-5.098 0-1.162.495-2.286 1.336-3.233-.276-.94-.623-2.857.106-3.587 1.798 0 2.885 1.166 3.146 1.481A8.993 8.993 0 0112 6.545c1.163 0 2.268.208 3.29.569.258-.307 1.344-1.474 3.131-1.474.735.731.381 2.656.102 3.594.836.945 1.328 2.066 1.328 3.226 0 2.697-1.904 4.684-5.894 5.097C14.633 18.415 15 19.532 15 20.491v2.471c0 .075-.006.148-.015.22C20.431 21.96 24 17.435 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Meta (Facebook & Instagram)</h3>
                  <p className="text-sm text-gray-500">
                    Connect once to post to both Facebook and Instagram
                  </p>
                </div>
              </div>

              {!hasMetaConnection ? (
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="btn-primary flex items-center gap-2"
                >
                  {connecting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <span>+</span>
                      Connect
                    </>
                  )}
                </button>
              ) : (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Connected
                </span>
              )}
            </div>

            {hasMetaConnection && (
              <div className="mt-6 space-y-4 border-t pt-4">
                {/* Facebook */}
                {facebookIntegration && (
                  <IntegrationCard
                    integration={facebookIntegration}
                    icon="📘"
                    onDisconnect={() => handleDisconnect(facebookIntegration.id, 'Facebook')}
                    onRefresh={() => handleRefresh(facebookIntegration.id)}
                  />
                )}

                {/* Instagram */}
                {instagramIntegration && (
                  <IntegrationCard
                    integration={instagramIntegration}
                    icon="📸"
                    onDisconnect={() => handleDisconnect(instagramIntegration.id, 'Instagram')}
                    onRefresh={() => handleRefresh(instagramIntegration.id)}
                  />
                )}

                {/* Note about Instagram */}
                {facebookIntegration && !instagramIntegration && (
                  <p className="text-sm text-gray-500 italic">
                    Note: Instagram wasn't detected. Make sure you have an Instagram Business account linked to your Facebook Page.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Future platforms */}
          <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-6">
            <h3 className="text-lg font-medium text-gray-700">Coming Soon</h3>
            <p className="text-sm text-gray-500 mt-1">
              More platforms will be available in future updates
            </p>
            <div className="flex gap-4 mt-4 text-gray-400">
              <span className="px-3 py-1 bg-white rounded border text-sm">Twitter/X</span>
              <span className="px-3 py-1 bg-white rounded border text-sm">TikTok</span>
              <span className="px-3 py-1 bg-white rounded border text-sm">LinkedIn</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IntegrationCard({ integration, icon, onDisconnect, onRefresh }) {
  const isExpiring = integration.tokenExpiring;
  const hasError = integration.lastErrorAt;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-medium text-gray-900">
            {integration.platformAccountName || integration.platform}
          </p>
          <p className="text-sm text-gray-500">
            Connected {new Date(integration.connectedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status indicators */}
        {hasError && (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs" title={integration.lastErrorMessage}>
            Error
          </span>
        )}
        {isExpiring && !hasError && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
            Token expiring
          </span>
        )}
        {!hasError && !isExpiring && (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
            Active
          </span>
        )}

        {/* Actions */}
        {(isExpiring || hasError) && (
          <button
            onClick={onRefresh}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Refresh
          </button>
        )}
        <button
          onClick={onDisconnect}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
