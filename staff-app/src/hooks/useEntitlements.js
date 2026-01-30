import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { api } from '../api/client';

/**
 * Entitlements Context
 *
 * Provides feature access information throughout the app.
 * Wrap your app with EntitlementsProvider and use useEntitlements() hook.
 */

const EntitlementsContext = createContext(null);

export function EntitlementsProvider({ businessId, children }) {
  const [entitlements, setEntitlements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEntitlements = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await api.getEntitlements(businessId);
      setEntitlements(result.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch entitlements:', err);
      setError(err);
      // Default to free tier on error
      setEntitlements({
        tier: 'free',
        features: {},
        limits: {},
      });
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchEntitlements();
  }, [fetchEntitlements]);

  const hasFeature = useCallback(
    (feature) => {
      if (!entitlements) return false;
      return entitlements.features[feature] === true;
    },
    [entitlements]
  );

  const getLimit = useCallback(
    (limitKey) => {
      if (!entitlements) return { limit: 0, used: 0 };
      return entitlements.limits[limitKey] || { limit: 0, used: 0 };
    },
    [entitlements]
  );

  const value = {
    tier: entitlements?.tier || 'free',
    status: entitlements?.status || 'active',
    features: entitlements?.features || {},
    limits: entitlements?.limits || {},
    hasFeature,
    getLimit,
    loading,
    error,
    refresh: fetchEntitlements,
  };

  return (
    <EntitlementsContext.Provider value={value}>
      {children}
    </EntitlementsContext.Provider>
  );
}

/**
 * Hook to access entitlements
 *
 * Usage:
 *   const { hasFeature, tier, getLimit } = useEntitlements();
 *   if (hasFeature(FEATURES.AI_ASSISTANT)) { ... }
 */
export function useEntitlements() {
  const context = useContext(EntitlementsContext);

  if (!context) {
    // Return a default context if not wrapped in provider
    // This allows components to work without the provider (e.g., in tests)
    return {
      tier: 'free',
      status: 'active',
      features: {},
      limits: {},
      hasFeature: () => false,
      getLimit: () => ({ limit: 0, used: 0 }),
      loading: false,
      error: null,
      refresh: () => {},
    };
  }

  return context;
}

export default useEntitlements;
