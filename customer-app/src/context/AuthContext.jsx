import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lootDrop, setLootDrop] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem('lootly_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const result = await api.getMe();
      setCustomer(result.data.customer);
    } catch (error) {
      console.error('Auth check failed:', error);
      api.logout();
    } finally {
      setLoading(false);
    }
  }

  async function login(phone, code) {
    const result = await api.verifyCode(phone, code);
    setCustomer(result.data.customer);
    return result;
  }

  function logout() {
    api.logout();
    setCustomer(null);
  }

  function updateCustomer(data) {
    setCustomer(prev => ({ ...prev, ...data }));
  }

  function triggerLootDrop(rewards) {
    setLootDrop(rewards);
  }

  function clearLootDrop() {
    setLootDrop(null);
  }

  const value = {
    customer,
    loading,
    isAuthenticated: !!customer,
    login,
    logout,
    updateCustomer,
    lootDrop,
    triggerLootDrop,
    clearLootDrop
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
