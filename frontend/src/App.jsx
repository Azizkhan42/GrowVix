import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Competitors from './pages/Competitors';
import Insights from './pages/Insights';
import ContentGenerator from './pages/ContentGenerator';
import Scheduler from './pages/Scheduler';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Recommendations from './pages/Recommendations';
import ContentCalendar from './pages/ContentCalendar';
import CompetitorDetail from './pages/CompetitorDetail';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/competitors" element={<Competitors />} />
            <Route path="/competitors/:id" element={<CompetitorDetail />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/content-generator" element={<ContentGenerator />} />
            <Route path="/content-calendar" element={<ContentCalendar />} />
            <Route path="/scheduler" element={<Scheduler />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
