import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import { authService } from './services/auth';
import LoadingSpinner from './components/UI/LoadingSpinner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const authStatus = await authService.checkAuthStatus();
      
      // Reset any error states on successful auth
      if (authStatus.authenticated) {
        localStorage.removeItem('auth_retry_count');
        localStorage.removeItem('auth_loop_prevention');
      }
      
      setIsAuthenticated(authStatus.authenticated);
      setUser(authStatus.user || null);
    } catch (error) {
      console.error('Error checking auth status:', error);
      
      // Prevent infinite redirect loops
      const retryCount = parseInt(localStorage.getItem('auth_retry_count') || '0');
      const loopPrevention = localStorage.getItem('auth_loop_prevention');
      
      if (retryCount > 3 || loopPrevention) {
        console.warn('Too many auth failures or loop detected, forcing logout');
        localStorage.removeItem('auth_retry_count');
        localStorage.removeItem('auth_loop_prevention');
        
        // Force complete logout
        try {
          await authService.logout();
        } catch (logoutError) {
          console.error('Error during forced logout:', logoutError);
        }
        
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      // Set loop prevention flag for 30 seconds
      localStorage.setItem('auth_loop_prevention', Date.now().toString());
      setTimeout(() => {
        localStorage.removeItem('auth_loop_prevention');
      }, 30000);
      
      localStorage.setItem('auth_retry_count', (retryCount + 1).toString());
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <Login />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Dashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;