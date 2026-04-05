import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AddCar = () => {
    const [formData, setFormData] = useState({ vehicle_model: '', vehicle_number: '', seating_capacity: '', rent_per_day: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cars', formData);
            alert('Car added successfully!');
            navigate('/cars');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add car');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body">
                            <h3 className="card-title text-center mb-4">Add New Car</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3"><label className="form-label">Vehicle Model</label><input type="text" className="form-control" onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })} required /></div>
                                <div className="mb-3"><label className="form-label">Vehicle Number</label><input type="text" className="form-control" onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })} required /></div>
                                <div className="mb-3"><label className="form-label">Seating Capacity</label><input type="number" className="form-control" onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value })} required /></div>
                                <div className="mb-3"><label className="form-label">Rent Per Day (₹)</label><input type="number" className="form-control" onChange={(e) => setFormData({ ...formData, rent_per_day: e.target.value })} required /></div>
                                <button type="submit" className="btn btn-primary w-100">Add Car Listing</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCar;
