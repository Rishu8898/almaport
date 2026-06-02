import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import AdminPanel from "./components/AdminPanel";
import StudentDashboard from "./components/StudentDashboard";
import VerificationPage from "./components/VerificationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster 
        position="bottom-right" 
        toastOptions={{ 
          style: { 
            background: 'rgba(10, 10, 15, 0.9)', 
            color: '#e0e6ed', 
            border: '1px solid rgba(0, 240, 255, 0.3)',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#00f0ff',
              secondary: '#000',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff003c',
              secondary: '#fff',
            },
            style: {
              border: '1px solid rgba(255, 0, 60, 0.3)',
            }
          }
        }} 
      />
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
    </>
  );
}

export default App;
