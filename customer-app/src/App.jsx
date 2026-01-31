import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import NotificationPreferences from './pages/NotificationPreferences';
import Discover from './pages/Discover';
import MyQuests from './pages/MyQuests';
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

  return isAuthenticated ? <Navigate to="/discover" /> : children;
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
        {/* Demo mode: these routes don't require auth */}
        <Route path="/notifications" element={<NotificationPreferences />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/quests" element={<MyQuests />} />
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
        {/* Demo mode: rewards routes don't require auth */}
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/rewards/:id" element={<RewardDetail />} />
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
        {/* Demo mode: profile doesn't require auth */}
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Bottom navigation for authenticated pages */}
      <Routes>
        <Route path="/discover" element={<BottomNav />} />
        <Route path="/quests" element={<BottomNav />} />
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
