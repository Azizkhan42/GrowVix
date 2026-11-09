import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import Layout from "./components/Layout";
import PublicLayout from "./layouts/PublicLayout";

import Home from "./pages/public/Home";
import Features from "./pages/public/Features";
import Pricing from "./pages/public/Pricing";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import Terms from "./pages/public/Terms";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Competitors from "./pages/Competitors";
import Insights from "./pages/Insights";
import ContentGenerator from "./pages/ContentGenerator";
import Scheduler from "./pages/Scheduler";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Recommendations from "./pages/Recommendations";
import ContentCalendar from "./pages/ContentCalendar";
import CompetitorDetail from "./pages/CompetitorDetail";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Marketing Website */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
          </Route>

          {/* Auth Routes (Guest Only) */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <Signup />
              </GuestRoute>
            }
          />

          {/* Protected Dashboard Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
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

            {/* Nested dashboard routes for robustness */}
            <Route path="/dashboard/analytics" element={<Navigate to="/analytics" replace />} />
            <Route path="/dashboard/competitors" element={<Navigate to="/competitors" replace />} />
            <Route path="/dashboard/insights" element={<Navigate to="/insights" replace />} />
            <Route path="/dashboard/content" element={<Navigate to="/content-generator" replace />} />
            <Route path="/dashboard/calendar" element={<Navigate to="/content-calendar" replace />} />
            <Route path="/dashboard/scheduler" element={<Navigate to="/scheduler" replace />} />
            <Route path="/dashboard/recommendations" element={<Navigate to="/recommendations" replace />} />
            <Route path="/dashboard/settings" element={<Navigate to="/settings" replace />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
