import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const StaffAuthContext = createContext(null);

export function StaffAuthProvider({ children }) {
  const [staff, setStaff] = useState(null);
  const [location, setLocation] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  function checkAuth() {
    // Check if we have a token in session storage
    const token = sessionStorage.getItem('lootly_staff_token');
    const savedStaff = sessionStorage.getItem('lootly_staff');
    const savedLocation = sessionStorage.getItem('lootly_location');
    const savedBusiness = sessionStorage.getItem('lootly_business');

    if (token && savedStaff && savedLocation) {
      setStaff(JSON.parse(savedStaff));
      setLocation(JSON.parse(savedLocation));
      if (savedBusiness) {
        setBusiness(JSON.parse(savedBusiness));
      }
    }

    setLoading(false);
  }

  async function login(locationId, pin) {
    const result = await api.login(locationId, pin);

    setStaff(result.data.staff);
    setLocation(result.data.location);
    setBusiness(result.data.business);

    // Save to session storage
    sessionStorage.setItem('lootly_staff', JSON.stringify(result.data.staff));
    sessionStorage.setItem('lootly_location', JSON.stringify(result.data.location));
    sessionStorage.setItem('lootly_business', JSON.stringify(result.data.business));

    return result;
  }

  function logout() {
    api.logout();
    setStaff(null);
    setLocation(null);
    setBusiness(null);
    sessionStorage.removeItem('lootly_staff');
    sessionStorage.removeItem('lootly_location');
    sessionStorage.removeItem('lootly_business');
  }

  const value = {
    staff,
    location,
    business,
    loading,
    isAuthenticated: !!staff,
    login,
    logout
  };

  return (
    <StaffAuthContext.Provider value={value}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);
  if (!context) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
}
