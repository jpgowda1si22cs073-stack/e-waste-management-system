import { Route, Routes, BrowserRouter } from "react-router-dom";
import Register from "./components/auth/Register.jsx";
import Login from "./components/auth/Login";
import LandingPage from "./pages/LandingPage.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Lender imports
import LenderHome from "./pages/lender/LenderHome";
import LenderProfile from "./pages/lender/LenderProfile.jsx";
import ScheduleHistory from "./pages/lender/ScheduleHistory.jsx";
import LenderStore from "./pages/lender/LenderStore.jsx";
import AnalyseEwaste from "./pages/lender/AnalyseEwaste.jsx";

// Collector imports
import CollectorHome from "./pages/collector/CollectorHome.jsx";
import CollectorProfile from "./pages/collector/CollectorProfile.jsx";
import CollectorHistory from "./pages/collector/CollectorHistory.jsx";

import ScheduleEwaste from "./pages/lender/ScheduleEwaste.jsx";
import Layout from "./components/Layout.jsx";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Lender routes */}
          <Route
            path="/lender/schedule"
            element={
              <ProtectedRoute allowedRoles={["lender"]}>
                <ScheduleEwaste />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lender"
            element={
              <ProtectedRoute allowedRoles={["lender"]}>
                <LenderHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lender/profile"
            element={
              <ProtectedRoute allowedRoles={["lender"]}>
                <LenderProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lender/history"
            element={
              <ProtectedRoute allowedRoles={["lender"]}>
                <ScheduleHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lender/reward"
            element={
              <ProtectedRoute allowedRoles={["lender"]}>
                <LenderStore />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lender/analyse"
            element={
              <ProtectedRoute allowedRoles={["lender"]}>
                <AnalyseEwaste />
              </ProtectedRoute>
            }
          />

          {/* Collector routes */}
          <Route
            path="/collector"
            element={
              <ProtectedRoute allowedRoles={["collector"]}>
                <CollectorHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collector/profile"
            element={
              <ProtectedRoute allowedRoles={["collector"]}>
                <CollectorProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collector/history"
            element={
              <ProtectedRoute allowedRoles={["collector"]}>
                <CollectorHistory />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
