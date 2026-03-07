import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import RequestList from './pages/RequestList';
import CreateRequest from './pages/CreateRequest';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import ParkManagement from './pages/ParkManagement';
import VendorManagement from './pages/VendorManagement';
import TypeManagement from './pages/TypeManagement';
import UserManagement from './pages/UserManagement';
import EquipmentDetail from './pages/EquipmentDetail';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('token'));

  React.useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 flex flex-col font-inter">
        {isAuthenticated && <Navbar />}
        <main className="flex-1 container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/coordinator" element={isAuthenticated ? <CoordinatorDashboard /> : <Navigate to="/login" />} />
            <Route path="/parks" element={isAuthenticated ? <ParkManagement /> : <Navigate to="/login" />} />
            <Route path="/equipment" element={isAuthenticated ? <EquipmentList /> : <Navigate to="/login" />} />
            <Route path="/equipment/:id" element={isAuthenticated ? <EquipmentDetail /> : <Navigate to="/login" />} />
            <Route path="/requests" element={isAuthenticated ? <RequestList /> : <Navigate to="/login" />} />
            <Route path="/requests/new" element={isAuthenticated ? <CreateRequest /> : <Navigate to="/login" />} />
            <Route path="/vendors" element={isAuthenticated ? <VendorManagement /> : <Navigate to="/login" />} />
            <Route path="/types" element={isAuthenticated ? <TypeManagement /> : <Navigate to="/login" />} />
            <Route path="/users" element={isAuthenticated ? <UserManagement /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
