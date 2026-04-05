import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const RegisterAgency = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'agency' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/register', formData);
            alert('Agency Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow">
                        <div className="card-body">
                            <h3 className="card-title text-center mb-4">Agency Registration</h3>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3"><label className="form-label">Agency (Person Name)</label><input type="text" className="form-control" onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                                <div className="mb-3"><label className="form-label">Agency Email</label><input type="email" className="form-control" onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
                                <div className="mb-3"><label className="form-label">Password</label><input type="password" className="form-control" onChange={(e) => setFormData({ ...formData, password: e.target.value })} required /></div>
                                <div className="mb-3"><label className="form-label">Confirm Password</label><input type="password" className="form-control" onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })} required /></div>
                                <button type="submit" className="btn btn-primary w-100">Register as Agency</button>
                                <div className="text-center mt-3"><Link to="/login">Already have an account? Login</Link></div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterAgency;
