import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAdminAuth } from '../context/AdminAuthContext';

/**
 * MarketingPage - List posts and calendar view
 */
export default function MarketingPage() {
  const { businessId } = useAdminAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState(searchParams.get('view') || 'list'); // 'list' or 'calendar'
  const [filter, setFilter] = useState({
    status: searchParams.get('status') || '',
    platform: searchParams.get('platform') || '',
  });

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);

  // Load posts
  useEffect(() => {
    loadPosts();
  }, [businessId, filter]);

  // Load calendar events when in calendar view
  useEffect(() => {
    if (view === 'calendar') {
      loadCalendarEvents();
    }
  }, [view, calendarMonth, businessId]);

  async function loadPosts() {
    try {
      setLoading(true);
      setError(null);
      const options = {};
      if (filter.status) options.status = filter.status;
      if (filter.platform) options.platform = filter.platform;

      const result = await api.getMarketingPosts(businessId, options);
      setPosts(result.data?.posts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCalendarEvents() {
    try {
      const year = calendarMonth.getFullYear();
      const month = calendarMonth.getMonth();
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0).toISOString();

      const result = await api.getMarketingCalendar(businessId, startDate, endDate);
      setCalendarEvents(result.data?.events || []);
    } catch (err) {
      console.error('Failed to load calendar:', err);
    }
  }

  async function handleDelete(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.deleteMarketingPost(businessId, postId);
      loadPosts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePublish(postId) {
    if (!confirm('Publish this post now?')) return;

    try {
      await api.publishMarketingPost(businessId, postId);
      loadPosts();
    } catch (err) {
      setError(err.message);
    }
  }

  function updateView(newView) {
    setView(newView);
    setSearchParams({ ...Object.fromEntries(searchParams), view: newView });
  }

  function updateFilter(key, value) {
    const newFilter = { ...filter, [key]: value };
    setFilter(newFilter);
    const params = { ...Object.fromEntries(searchParams), ...newFilter };
    if (!params.status) delete params.status;
    if (!params.platform) delete params.platform;
    setSearchParams(params);
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
          <p className="text-gray-600 mt-1">
            Create and manage social media posts
          </p>
        </div>
        <Link to="/marketing/new" className="btn-primary">
          + Create Post
        </Link>
      </div>

      {/* View Toggle & Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => updateView('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === 'list'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📋 List
          </button>
          <button
            onClick={() => updateView('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === 'calendar'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📅 Calendar
          </button>
        </div>

        {view === 'list' && (
          <div className="flex gap-3">
            <select
              value={filter.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="input-field text-sm"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={filter.platform}
              onChange={(e) => updateFilter('platform', e.target.value)}
              className="input-field text-sm"
            >
              <option value="">All Platforms</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : view === 'list' ? (
        <PostList posts={posts} onDelete={handleDelete} onPublish={handlePublish} />
      ) : (
        <CalendarView
          events={calendarEvents}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
        />
      )}
    </div>
  );
}

function PostList({ posts, onDelete, onPublish }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg">No posts yet</p>
        <p className="text-gray-400 mt-1">Create your first post to get started</p>
        <Link to="/marketing/new" className="btn-primary mt-4 inline-block">
          Create Post
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onDelete={() => onDelete(post.id)}
          onPublish={() => onPublish(post.id)}
        />
      ))}
    </div>
  );
}

function PostCard({ post, onDelete, onPublish }) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-700',
    publishing: 'bg-yellow-100 text-yellow-700',
    published: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    partial: 'bg-orange-100 text-orange-700',
  };

  const platformIcons = {
    facebook: '📘',
    instagram: '📸',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Status & Platforms */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[post.status]}`}>
              {post.status}
            </span>
            <div className="flex gap-1">
              {post.platforms?.map(platform => (
                <span key={platform} title={platform}>
                  {platformIcons[platform]}
                </span>
              ))}
            </div>
            {post.sourceType && (
              <span className="text-xs text-gray-500">
                From: {post.sourceType}
              </span>
            )}
          </div>

          {/* Content preview */}
          <p className="text-gray-900 line-clamp-2">
            {post.content}
          </p>

          {/* Dates */}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            {post.scheduledAt && (
              <span>📅 Scheduled: {new Date(post.scheduledAt).toLocaleString()}</span>
            )}
            {post.publishedAt && (
              <span>✅ Published: {new Date(post.publishedAt).toLocaleString()}</span>
            )}
            {!post.scheduledAt && !post.publishedAt && (
              <span>Created: {new Date(post.createdAt).toLocaleString()}</span>
            )}
          </div>

          {/* Errors */}
          {post.errorMessage && (
            <p className="text-red-600 text-sm mt-2">
              ⚠️ {post.errorMessage}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {['draft', 'scheduled'].includes(post.status) && (
            <>
              <Link
                to={`/marketing/${post.id}`}
                className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
              >
                Edit
              </Link>
              <button
                onClick={onPublish}
                className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Publish
              </button>
            </>
          )}
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function CalendarView({ events, month, onMonthChange }) {
  const daysInMonth = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startPadding = firstDay.getDay();

    const days = [];

    // Padding for previous month
    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, events: [] });
    }

    // Days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, monthIndex, day);
      const dayEvents = events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.getDate() === day;
      });
      days.push({ date, events: dayEvents });
    }

    return days;
  }, [month, events]);

  const monthName = month.toLocaleString('default', { month: 'long', year: 'numeric' });

  function goToPrevMonth() {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1));
  }

  function goToNextMonth() {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1));
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-100 rounded">
          ←
        </button>
        <h2 className="text-lg font-semibold">{monthName}</h2>
        <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded">
          →
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {daysInMonth.map((day, index) => (
          <div
            key={index}
            className={`min-h-24 border-b border-r p-1 ${
              !day.date ? 'bg-gray-50' : ''
            }`}
          >
            {day.date && (
              <>
                <div className="text-sm font-medium text-gray-700">
                  {day.date.getDate()}
                </div>
                <div className="space-y-1 mt-1">
                  {day.events.slice(0, 3).map(event => (
                    <Link
                      key={event.id}
                      to={`/marketing/${event.id}`}
                      className={`block text-xs p-1 rounded truncate ${
                        event.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                      title={event.title}
                    >
                      {event.platforms?.map(p => p === 'facebook' ? '📘' : '📸').join('')}
                      {' '}
                      {event.title}
                    </Link>
                  ))}
                  {day.events.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{day.events.length - 3} more
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
