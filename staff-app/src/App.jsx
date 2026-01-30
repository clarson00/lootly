import { Routes, Route, Navigate } from 'react-router-dom';
import { useStaffAuth } from './context/StaffAuthContext';
import Login from './pages/Login';
import Scan from './pages/Scan';
import Customer from './pages/Customer';
import EnterSpend from './pages/EnterSpend';
import Confirm from './pages/Confirm';
import RedeemReward from './pages/RedeemReward';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useStaffAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useStaffAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/scan" /> : children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-dark">
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/scan" element={
          <PrivateRoute>
            <Scan />
          </PrivateRoute>
        } />
        <Route path="/customer" element={
          <PrivateRoute>
            <Customer />
          </PrivateRoute>
        } />
        <Route path="/spend" element={
          <PrivateRoute>
            <EnterSpend />
          </PrivateRoute>
        } />
        <Route path="/confirm" element={
          <PrivateRoute>
            <Confirm />
          </PrivateRoute>
        } />
        <Route path="/redeem" element={
          <PrivateRoute>
            <RedeemReward />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
