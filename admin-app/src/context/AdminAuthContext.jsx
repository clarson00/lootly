import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('admin_token');
    const savedBusinessId = localStorage.getItem('admin_business_id');

    if (token) {
      // For now, assume valid if token exists
      // TODO: Validate token with backend
      setAdmin({ token });
      if (savedBusinessId) {
        setBusinessId(savedBusinessId);
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const result = await api.login(email, password);
    setAdmin(result.data);
    return result;
  };

  const logout = () => {
    api.logout();
    setAdmin(null);
    setBusinessId(null);
    localStorage.removeItem('admin_business_id');
  };

  const selectBusiness = (id) => {
    setBusinessId(id);
    localStorage.setItem('admin_business_id', id);
  };

  // For development, auto-set business ID if not set
  useEffect(() => {
    if (!businessId && admin) {
      // Default to pilot business for development
      setBusinessId('biz_pilot');
      localStorage.setItem('admin_business_id', 'biz_pilot');
    }
  }, [admin, businessId]);

  const value = {
    admin,
    businessId,
    loading,
    isAuthenticated: !!admin,
    login,
    logout,
    selectBusiness,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
