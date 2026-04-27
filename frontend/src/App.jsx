import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Subscription from './pages/Subscription';
import ScriptureLayout from './pages/ScriptureLayout';
import SettingsPage from './pages/Settings';
import Journal from './pages/Journal';
import MasteryReport from './pages/MasteryReport';
import About from './pages/About';
import VentureDashboard from './pages/VentureDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-lem-dark text-white font-sans selection:bg-lem-accent selection:text-lem-dark">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/subscribe" element={<Subscription />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/progress" element={<MasteryReport />} />
            <Route path="/about" element={<About />} />
             <Route path="/readiness" element={<VentureDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/read/:scripture" element={<ScriptureLayout />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
