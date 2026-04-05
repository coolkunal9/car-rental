import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import RegisterCustomer from './pages/RegisterCustomer';
import RegisterAgency from './pages/RegisterAgency';
import AvailableCars from './pages/AvailableCars';
import AgencyBookings from './pages/AgencyBookings';
import MyBookings from './pages/MyBookings';
import { useAuth } from './context/AuthContext';

function App() {
  const { loading } = useAuth();
  if (loading) return null;

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/cars" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/customer" element={<RegisterCustomer />} />
        <Route path="/register/agency" element={<RegisterAgency />} />
        <Route path="/cars" element={<AvailableCars />} />
        <Route path="/agency/bookings" element={<AgencyBookings />} />
        <Route path="/customer/bookings" element={<MyBookings />} />
        <Route path="*" element={<Navigate to="/cars" />} />
      </Routes>
    </Router>
  );
}

export default App;
