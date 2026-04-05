import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAgency, isCustomer } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
            <div className="container">
                <Link className="navbar-brand" to="/">Car Rental</Link>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/cars">Available Cars</Link>
                        </li>
                        {isCustomer && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/customer/bookings">My Bookings</Link>
                            </li>
                        )}
                        {isAgency && (
                            <>
                                <li className="nav-item"><Link className="nav-link" to="/agency/add-car">Add New Car</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/agency/bookings">View Booked Cars</Link></li>
                            </>
                        )}
                    </ul>
                    <ul className="navbar-nav ms-auto">
                        {user ? (
                            <>
                                <li className="nav-item"><span className="nav-link text-light">Welcome, {user.name} ({user.role})</span></li>
                                <li className="nav-item"><button className="btn btn-outline-danger btn-sm nav-link" onClick={handleLogout}>Logout</button></li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/register/customer">Customer Register</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/register/agency">Agency Register</Link></li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
