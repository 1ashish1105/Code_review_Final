import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Reviewer from './pages/Reviewer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';

// Protected Route Component to restrict access to the reviewer
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Protected Home Route */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Reviewer />
            </ProtectedRoute>
          } 
        />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
