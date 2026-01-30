import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAdminAuth } from '../context/AdminAuthContext';

// Common emoji categories for picker
const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😍', '🥰', '😘'],
  'Gestures': ['👍', '👎', '👏', '🙌', '🤝', '🙏', '💪', '🎉', '🔥', '⭐', '✨', '💯', '❤️', '🧡', '💛'],
  'Objects': ['🏴‍☠️', '⚓', '🗺️', '💰', '🎁', '🏆', '🎯', '📣', '🔔', '⏰', '📅', '📍', '🎫', '🎪', '🛍️'],
  'Food': ['🍕', '🍔', '🍟', '🌮', '🍜', '☕', '🍺', '🍷', '🍰', '🎂', '🍩', '🍪', '🍫', '🍦', '🥤'],
};

/**
 * PostBuilderPage - Create or edit a marketing post
 */
export default function PostBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { businessId } = useAdminAuth();

  const isEditing = Boolean(id);

  // Form state
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [platforms, setPlatforms] = useState(['facebook']);
  const [scheduledAt, setScheduledAt] = useState('');
  const [sourceType, setSourceType] = useState(searchParams.get('source') || '');
  const [sourceId, setSourceId] = useState(searchParams.get('source_id') || '');
  const [locationId, setLocationId] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [integrations, setIntegrations] = useState([]);
  const [rules, setRules] = useState([]);
  const [voyages, setVoyages] = useState([]);
  const [locations, setLocations] = useState([]);
  const [step, setStep] = useState(1); // 1: Source, 2: Edit, 3: Publish

  // Character limits
  const FB_LIMIT = 63206;
  const IG_LIMIT = 2200;
  const charLimit = platforms.includes('instagram') ? IG_LIMIT : FB_LIMIT;

  // Load existing post if editing
  useEffect(() => {
    if (isEditing) {
      loadPost();
    }
  }, [id]);

  // Load integrations, rules, voyages
  useEffect(() => {
    loadResources();
  }, [businessId]);

  // Auto-generate content from source
  useEffect(() => {
    if (sourceType && sourceId && !isEditing) {
      generateFromSource();
    }
  }, [sourceType, sourceId]);

  async function loadPost() {
    try {
      setLoading(true);
      const result = await api.getMarketingPost(id);
      const post = result.data?.post;
      if (post) {
        setContent(post.content || '');
        setImageUrl(post.imageUrl || '');
        setPlatforms(post.platforms || ['facebook']);
        setScheduledAt(post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '');
        setSourceType(post.sourceType || '');
        setSourceId(post.sourceId || '');
        setLocationId(post.locationId || '');
        setStep(2); // Go directly to edit step
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadResources() {
    try {
      const [integrationsRes, rulesRes, voyagesRes, locationsRes] = await Promise.all([
        api.getIntegrations().catch(() => ({ data: { integrations: [] } })),
        api.getRules(businessId).catch(() => ({ data: { rules: [] } })),
        api.getRulesets(businessId).catch(() => ({ data: { rulesets: [] } })),
        api.getLocations(businessId).catch(() => ({ data: { locations: [] } })),
      ]);

      setIntegrations(integrationsRes.data?.integrations || []);
      setRules(rulesRes.data?.rules || []);
      setVoyages(voyagesRes.data?.rulesets || []);
      setLocations(locationsRes.data?.locations || []);
    } catch (err) {
      console.error('Failed to load resources:', err);
    }
  }

  async function generateFromSource() {
    try {
      const result = await api.getMarketingPreview(sourceType, sourceId);
      if (result.data?.content) {
        setContent(result.data.content);
      }
    } catch (err) {
      console.error('Failed to generate content:', err);
    }
  }

  function handleSourceSelect(type, id) {
    setSourceType(type);
    setSourceId(id);
    setStep(2);
  }

  function handleCustomSelect() {
    setSourceType('custom');
    setSourceId('');
    setStep(2);
  }

  function togglePlatform(platform) {
    if (platforms.includes(platform)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter(p => p !== platform));
      }
    } else {
      setPlatforms([...platforms, platform]);
    }
  }

  function insertEmoji(emoji) {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  }

  async function handleSave(publishNow = false) {
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    if (platforms.includes('instagram') && !imageUrl) {
      setError('Instagram posts require an image');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const postData = {
        content: content.trim(),
        image_url: imageUrl || null,
        platforms,
        source_type: sourceType || null,
        source_id: sourceId || null,
        location_id: locationId || null,
        scheduled_at: scheduledAt || null,
        publish_now: publishNow,
      };

      if (isEditing) {
        await api.updateMarketingPost(id, postData);
      } else {
        await api.createMarketingPost(postData);
      }

      navigate('/marketing');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Check if connected platforms match selected platforms
  const connectedPlatforms = integrations
    .filter(i => i.isActive)
    .map(i => i.platform);

  const missingPlatforms = platforms.filter(p => !connectedPlatforms.includes(p));

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Post' : 'Create Post'}
        </h1>
        <p className="text-gray-600 mt-1">
          {step === 1 && 'Choose what to promote'}
          {step === 2 && 'Write your post'}
          {step === 3 && 'Choose platforms and publish'}
        </p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={`w-20 h-1 ml-2 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Step 1: Source Selection */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Rules */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">📋 Promote a Rule</h3>
            {rules.length === 0 ? (
              <p className="text-gray-500">No rules available</p>
            ) : (
              <div className="grid gap-3">
                {rules.slice(0, 5).map(rule => (
                  <button
                    key={rule.id}
                    onClick={() => handleSourceSelect('rule', rule.id)}
                    className="text-left p-3 border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    <p className="font-medium">{rule.displayName || rule.name}</p>
                    {rule.description && (
                      <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voyages */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">🗺️ Promote a Voyage</h3>
            {voyages.length === 0 ? (
              <p className="text-gray-500">No voyages available</p>
            ) : (
              <div className="grid gap-3">
                {voyages.slice(0, 5).map(voyage => (
                  <button
                    key={voyage.id}
                    onClick={() => handleSourceSelect('voyage', voyage.id)}
                    className="text-left p-3 border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    <p className="font-medium">{voyage.displayName || voyage.name}</p>
                    {voyage.tagline && (
                      <p className="text-sm text-gray-500 mt-1">{voyage.tagline}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">✏️ Write Custom Post</h3>
            <button
              onClick={handleCustomSelect}
              className="w-full text-left p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <p className="font-medium text-gray-700">Start from scratch</p>
              <p className="text-sm text-gray-500 mt-1">Write your own content</p>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Edit Content */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Content Editor */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Post Content
              </label>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                😀 Add Emoji
              </button>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
                {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                  <div key={category} className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">{category}</p>
                    <div className="flex flex-wrap gap-1">
                      {emojis.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="text-xl hover:bg-gray-200 p-1 rounded"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="input-field w-full font-mono"
              placeholder="Write your post content here..."
            />
            <div className="flex justify-between mt-2 text-sm">
              <span className={content.length > charLimit ? 'text-red-600' : 'text-gray-500'}>
                {content.length} / {charLimit} characters
              </span>
              {sourceType && sourceType !== 'custom' && (
                <button
                  onClick={generateFromSource}
                  className="text-primary-600 hover:text-primary-700"
                >
                  🔄 Regenerate from {sourceType}
                </button>
              )}
            </div>
          </div>

          {/* Image URL (optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL (optional, required for Instagram)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-field w-full"
              placeholder="https://example.com/image.jpg"
            />
            {imageUrl && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-xs rounded-lg border"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            {!isEditing && (
              <button
                onClick={() => setStep(1)}
                className="btn-secondary"
              >
                ← Back
              </button>
            )}
            <button
              onClick={() => setStep(3)}
              className="btn-primary ml-auto"
            >
              Next: Publish Options →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Publish Options */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Platform Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Platforms
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={platforms.includes('facebook')}
                  onChange={() => togglePlatform('facebook')}
                  className="rounded"
                />
                <span>📘 Facebook</span>
                {!connectedPlatforms.includes('facebook') && (
                  <span className="text-xs text-red-600">(not connected)</span>
                )}
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={platforms.includes('instagram')}
                  onChange={() => togglePlatform('instagram')}
                  className="rounded"
                />
                <span>📸 Instagram</span>
                {!connectedPlatforms.includes('instagram') && (
                  <span className="text-xs text-red-600">(not connected)</span>
                )}
              </label>
            </div>
            {missingPlatforms.length > 0 && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ Connect your {missingPlatforms.join(' and ')} account(s) in{' '}
                <a href="/settings/integrations" className="underline">Settings</a> before publishing.
              </p>
            )}
          </div>

          {/* Location Targeting */}
          {locations.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (optional)
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="input-field w-full"
              >
                <option value="">All locations</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.icon} {loc.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Choose a specific location or leave blank to post for all
              </p>
            </div>
          )}

          {/* Schedule */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule (optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="input-field"
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave blank to publish immediately or save as draft
            </p>
          </div>

          {/* Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <p className="whitespace-pre-wrap text-gray-900">{content}</p>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="mt-2 max-w-xs rounded"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="btn-secondary"
            >
              ← Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="btn-secondary"
              >
                {scheduledAt ? 'Schedule' : 'Save as Draft'}
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving || missingPlatforms.length > 0}
                className="btn-primary"
              >
                {saving ? 'Publishing...' : 'Publish Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
