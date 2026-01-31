import { useState, useEffect } from 'react';
import api from '../api/client';

// Format relative time
function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function RecentCustomers({ onSelect, loading: externalLoading = false }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecentCustomers();
  }, []);

  const loadRecentCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await api.getRecentCustomers(8);
      if (result.success) {
        setCustomers(result.data.customers);
      } else {
        setError('Failed to load recent customers');
      }
    } catch (err) {
      console.error('Error loading recent customers:', err);
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (customer) => {
    if (!externalLoading) {
      onSelect(customer);
    }
  };

  if (loading) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        Loading recent customers...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm text-center py-4">
        {error}
        <button
          onClick={loadRecentCustomers}
          className="block mx-auto mt-2 text-primary hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        No recent customers at this location
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-gray-400 text-sm font-medium px-1">
        Recent Customers
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {customers.map((customer) => (
          <button
            key={customer.id}
            onClick={() => handleSelect(customer)}
            disabled={externalLoading}
            className="w-full flex items-center justify-between p-3 rounded-lg
                       bg-dark-light border border-gray-700
                       hover:border-primary hover:bg-gray-800
                       active:scale-98 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg">
                {customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="text-left">
                <div className="text-white font-medium">
                  {customer.name || 'Customer'}
                </div>
                <div className="text-gray-400 text-sm">
                  {customer.phone_masked}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-primary font-medium">
                {customer.points_balance} pts
              </div>
              <div className="text-gray-500 text-xs">
                {formatRelativeTime(customer.last_visit)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
