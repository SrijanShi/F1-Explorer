import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/Pages/HomePage';
import Dashboard from './components/Pages/DashBoard';
import DriversGrid from './components/DriverProfile/DriversGrid';
import CircuitTracker from './components/CircuitTracker/CircuitTracker';
import DriverDetails from './components/DriverProfile/DriverDetails';
import ProfilePage from './components/Pages/ProfilePage';
import Login from './components/Authentication/login';
import Signup from './components/Authentication/signup';
import ProtectedRoute from './components/Pages/ProtectedRoute';
import Callback from './components/Authentication/callback';
import News from './components/News/news';
import HighlightsPage from './components/Highlights/HighlightsPage';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/callback" element={<Callback />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                } />
                <Route path="/drivers" element={
                    <ProtectedRoute>
                        <DriversGrid />
                    </ProtectedRoute>
                } />
                <Route path="/drivers/:id" element={
                    <ProtectedRoute>
                        <DriverDetails />
                    </ProtectedRoute>
                } />
                <Route path="/circuits" element={
                    <ProtectedRoute>
                        <CircuitTracker />
                    </ProtectedRoute>
                } />
                <Route path="/news" element={
                    <ProtectedRoute>
                        <News />
                    </ProtectedRoute>
                } />
                {/* Add highlight route */}
                <Route path="/highlights" element={
                    <ProtectedRoute>
                        <HighlightsPage />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;