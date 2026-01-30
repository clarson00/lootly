import { useState, useEffect } from 'react';
import {
  describeConditions,
  describeAwards,
  describeAwardsAsText
} from '../../lib/plainLanguage';

export default function WalkthroughDrawer({
  // Rule/Step data
  name,
  icon,
  description,
  conditions,
  awards,
  startDate,
  endDate,
  isRepeatable,
  cooldownDays,
  // Context data
  locations = [],
  locationGroups = [],
  // For voyages
  isVoyage = false,
  voyageName,
  voyageIcon,
  voyageDescription,
  sequenceType,
  steps = [],
  // Drawer state
  defaultOpen = true,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-close on mobile by default
  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [isMobile]);

  const conditionsText = describeConditions(conditions, locations, locationGroups);
  const awardsData = describeAwards(awards, locations);

  // Toggle button that's always visible
  const ToggleButton = () => (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={`fixed z-50 transition-all duration-300 ${
        isOpen ? 'right-[320px]' : 'right-0'
      } bg-white border border-gray-200 shadow-lg rounded-l-lg p-2 hover:bg-gray-50`}
      style={{ top: 'calc(64px + 30vh)' }}
      title={isOpen ? 'Hide preview' : 'Show preview'}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-lg">{isOpen ? '›' : '📖'}</span>
        {!isOpen && (
          <span className="text-[10px] font-medium text-gray-500" style={{ writingMode: 'vertical-rl' }}>
            Preview
          </span>
        )}
      </div>
    </button>
  );

  // Drawer content
  const DrawerContent = () => (
    <div className={`bg-gradient-to-br ${isVoyage ? 'from-purple-50 to-indigo-50' : 'from-amber-50 to-orange-50'} h-full overflow-y-auto`}>
      <div className="p-4 sticky top-0 bg-white/80 backdrop-blur border-b border-gray-200 z-10">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${isVoyage ? 'text-purple-900' : 'text-amber-900'}`}>
            {isVoyage ? '🗺️ Voyage Preview' : '📖 Rule Preview'}
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* For single rules */}
        {!isVoyage && (
          <>
            {/* Header */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{icon || '📜'}</span>
              <div>
                <p className="font-semibold text-gray-900">{name || 'Untitled Rule'}</p>
                {description && <p className="text-xs text-gray-500">{description}</p>}
              </div>
            </div>

            {/* Conditions */}
            <div className="bg-white/70 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <span>⚡</span> When
              </p>
              <p className="text-sm text-gray-800">{conditionsText}</p>
            </div>

            {/* Awards */}
            <div className="bg-white/70 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <span>🎁</span> Then
              </p>
              {typeof awardsData === 'string' ? (
                <p className="text-sm text-gray-800">{awardsData}</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 italic">
                    {awardsData.type === 'choice' ? 'Customer chooses ONE:' : 'Customer receives ALL:'}
                  </p>
                  {awardsData.groups.map((g, i) => (
                    <div key={i} className="pl-3 border-l-2 border-amber-300">
                      <p className="text-xs font-medium text-amber-700">{g.label}</p>
                      <p className="text-sm text-gray-800">{g.desc}{g.location}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Time bounds */}
            {(startDate || endDate) && (
              <div className="bg-white/70 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <span>📅</span> Active Period
                </p>
                <p className="text-sm text-gray-800">
                  {startDate && `From ${new Date(startDate).toLocaleDateString()}`}
                  {startDate && endDate && ' '}
                  {endDate && `until ${new Date(endDate).toLocaleDateString()}`}
                </p>
              </div>
            )}

            {/* Behavior */}
            <div className="bg-white/70 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <span>⚙️</span> Behavior
              </p>
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${isRepeatable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {isRepeatable ? '🔄 Repeatable' : '1️⃣ One-time'}
                </span>
                {cooldownDays > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    ⏰ {cooldownDays} day cooldown
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {/* For voyages */}
        {isVoyage && (
          <>
            {/* Voyage Header */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{voyageIcon || '🗺️'}</span>
              <div>
                <p className="font-semibold text-gray-900">{voyageName || 'Untitled Voyage'}</p>
                {voyageDescription && <p className="text-xs text-gray-500">{voyageDescription}</p>}
              </div>
            </div>

            {/* Sequence type */}
            <div className="bg-white/70 rounded-lg p-3">
              <p className="text-sm text-gray-800">
                {sequenceType === 'ordered'
                  ? '📋 Steps must be completed in order'
                  : '🔀 Steps can be completed in any order'}
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <span>📍</span> Journey Steps ({steps.length})
              </p>

              {steps.length === 0 ? (
                <div className="bg-white/50 rounded-lg p-4 border border-dashed border-purple-300 text-center">
                  <p className="text-sm text-purple-600">No steps added yet</p>
                  <p className="text-xs text-purple-400 mt-1">Add steps to build your voyage</p>
                </div>
              ) : (
                steps.map((step, index) => (
                  <div key={step.id || index} className="relative pl-6">
                    {/* Connector */}
                    <div className="absolute left-0 top-0 flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-0.5 flex-1 bg-purple-200 mt-1 min-h-[40px]" />
                      )}
                    </div>

                    <div className="bg-white/80 rounded-lg p-3 border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span>{step.icon || '📍'}</span>
                        <span className="font-medium text-gray-900 text-sm">{step.name || 'Untitled Step'}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        <span className="font-medium text-purple-600">When:</span>{' '}
                        {describeConditions(step.conditions, locations, locationGroups)}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-medium text-purple-600">Then:</span>{' '}
                        {describeAwardsAsText(step.awards, locations)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Live indicator */}
        <div className="text-center pt-4 border-t border-gray-200/50">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Updates as you edit
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <ToggleButton />

      {/* Desktop: Sticky sidebar */}
      <div
        className={`hidden lg:block fixed right-0 top-0 h-screen w-[320px] border-l border-gray-200 shadow-lg transition-transform duration-300 z-30 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ top: '64px', height: 'calc(100vh - 64px)' }}
      >
        <DrawerContent />
      </div>

      {/* Mobile: Overlay drawer */}
      {isMobile && (
        <>
          {/* Backdrop */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Drawer */}
          <div
            className={`fixed right-0 top-0 h-full w-[85vw] max-w-[320px] border-l border-gray-200 shadow-xl transition-transform duration-300 z-50 lg:hidden ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <DrawerContent />
          </div>
        </>
      )}

      {/* Spacer for desktop layout - pushes content left when drawer is open */}
      {!isMobile && isOpen && (
        <div className="hidden lg:block w-[320px] flex-shrink-0" />
      )}
    </>
  );
}
