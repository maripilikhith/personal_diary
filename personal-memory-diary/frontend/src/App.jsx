import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

function Navigation() {
    const { currentUser, logout } = useAuth();

    if (!currentUser) return null;

    return (
        <header className="app-header">
            <div className="container header-content">
                <Link to="/" className="logo">
                    <span style={{ fontSize: '24px' }}>📔</span> Memory Diary
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-light)' }}>
                        {currentUser.email}
                    </span>
                    <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={logout}>
                        Log Out
                    </button>
                </div>
            </div>
        </header>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <Navigation />
                <Routes>
                    <Route path="/" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
