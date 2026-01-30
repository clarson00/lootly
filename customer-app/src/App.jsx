import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Home from './pages/Home';
import MyCode from './pages/MyCode';
import Rewards from './pages/Rewards';
import RewardDetail from './pages/RewardDetail';
import TreasureMap from './pages/TreasureMap';
import VoyageDetail from './pages/VoyageDetail';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';
import LootDrop from './components/LootDrop';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/home" /> : children;
}

export default function App() {
  const { lootDrop, clearLootDrop } = useAuth();

  return (
    <div className="min-h-screen bg-dark">
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <Welcome />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/home" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/code" element={
          <PrivateRoute>
            <MyCode />
          </PrivateRoute>
        } />
        <Route path="/rewards" element={
          <PrivateRoute>
            <Rewards />
          </PrivateRoute>
        } />
        <Route path="/rewards/:id" element={
          <PrivateRoute>
            <RewardDetail />
          </PrivateRoute>
        } />
        <Route path="/voyages" element={
          <PrivateRoute>
            <TreasureMap />
          </PrivateRoute>
        } />
        <Route path="/voyages/:id" element={
          <PrivateRoute>
            <VoyageDetail />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Bottom navigation for authenticated pages */}
      <Routes>
        <Route path="/home" element={<BottomNav />} />
        <Route path="/code" element={<BottomNav />} />
        <Route path="/rewards" element={<BottomNav />} />
        <Route path="/rewards/:id" element={<BottomNav />} />
        <Route path="/voyages" element={<BottomNav />} />
        <Route path="/voyages/:id" element={<BottomNav />} />
        <Route path="/profile" element={<BottomNav />} />
      </Routes>

      {/* Loot drop overlay */}
      {lootDrop && (
        <LootDrop rewards={lootDrop} onClose={clearLootDrop} />
      )}
    </div>
  );
}
