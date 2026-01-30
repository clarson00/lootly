import { useEntitlements } from '../hooks/useEntitlements';
import { FEATURE_INFO } from '../lib/features/registry';

/**
 * FeatureGate Component
 *
 * Conditionally renders children based on feature access.
 * Shows upgrade prompt if feature is not available.
 *
 * Usage:
 *   <FeatureGate feature={FEATURES.AI_ASSISTANT}>
 *     <AIAssistantPanel />
 *   </FeatureGate>
 *
 *   // With custom fallback:
 *   <FeatureGate feature={FEATURES.AI_ASSISTANT} fallback={<BasicVersion />}>
 *     <AdvancedVersion />
 *   </FeatureGate>
 *
 *   // Hide completely if not available:
 *   <FeatureGate feature={FEATURES.AI_ASSISTANT} fallback={null}>
 *     <AIAssistantPanel />
 *   </FeatureGate>
 */
export function FeatureGate({ feature, children, fallback }) {
  const { hasFeature, loading } = useEntitlements();

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // If has access, render children
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // If fallback provided (including null), use it
  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  // Default: show upgrade prompt
  return <UpgradePrompt feature={feature} />;
}

/**
 * UpgradePrompt Component
 *
 * Shown when a feature is not available.
 * Displays feature info and link to upgrade.
 */
export function UpgradePrompt({ feature, className = '' }) {
  const info = FEATURE_INFO[feature] || {
    name: 'Premium Feature',
    description: 'This feature requires a plan upgrade',
    tier: 'pro',
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-4 text-center ${className}`}>
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{info.name}</h3>
      <p className="text-sm text-gray-600 mb-3">{info.description}</p>
      <p className="text-xs text-gray-500 mb-3">
        Available on {info.tier} plan and above
      </p>
      <a
        href={`/settings/billing?feature=${encodeURIComponent(feature)}`}
        className="inline-block bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
      >
        Upgrade to Unlock
      </a>
    </div>
  );
}

/**
 * useFeatureCheck Hook
 *
 * For programmatic feature checks outside of JSX.
 *
 * Usage:
 *   const canUseAI = useFeatureCheck(FEATURES.AI_ASSISTANT);
 *   if (canUseAI) { ... }
 */
export function useFeatureCheck(feature) {
  const { hasFeature } = useEntitlements();
  return hasFeature(feature);
}

export default FeatureGate;
