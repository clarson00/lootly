import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RulesPage from './pages/RulesPage';
import RuleBuilderPage from './pages/RuleBuilderPage';
import VoyagesPage from './pages/VoyagesPage';
import VoyageBuilderPage from './pages/VoyageBuilderPage';
import SimulatorPage from './pages/SimulatorPage';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="rules" element={<RulesPage />} />
          <Route path="rules/new" element={<RuleBuilderPage />} />
          <Route path="rules/:id" element={<RuleBuilderPage />} />
          <Route path="voyages" element={<VoyagesPage />} />
          <Route path="voyages/new" element={<VoyageBuilderPage />} />
          <Route path="voyages/:id" element={<VoyageBuilderPage />} />
          <Route path="simulator" element={<SimulatorPage />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}

export default App;
