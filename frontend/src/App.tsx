import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
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
import ServiceManagement from './pages/ServiceManagement';
import ImportData from './pages/ImportData';

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
      <div className="min-h-screen bg-[#020617] flex font-inter text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
        {isAuthenticated && <Sidebar />}
        
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-500 ${isAuthenticated ? 'lg:ml-72' : ''}`}>
          {isAuthenticated && <Header />}
          
          <main className={`flex-1 overflow-y-auto ${isAuthenticated ? 'p-4 md:p-8' : 'flex items-center justify-center p-0'}`}>
            <div className={isAuthenticated ? "max-w-7xl mx-auto w-full" : "w-full"}>
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
                <Route path="/services" element={isAuthenticated ? <ServiceManagement /> : <Navigate to="/login" />} />
                <Route path="/users" element={isAuthenticated ? <UserManagement /> : <Navigate to="/login" />} />
                <Route path="/import" element={isAuthenticated ? <ImportData /> : <Navigate to="/login" />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
