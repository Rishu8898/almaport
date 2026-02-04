import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import AdminPanel from "./components/AdminPanel";
import StudentDashboard from "./components/StudentDashboard";
import VerificationPage from "./components/VerificationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student", "admin"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/verify/:certId" element={<VerificationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
