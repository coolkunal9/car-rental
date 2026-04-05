import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const gradients = [
    'linear-gradient(135deg, #1a1a2e, #16213e)',
    'linear-gradient(135deg, #0f3460, #533483)',
    'linear-gradient(135deg, #1b4332, #2d6a4f)',
    'linear-gradient(135deg, #370617, #6a040f)',
    'linear-gradient(135deg, #03045e, #0096c7)',
    'linear-gradient(135deg, #3d405b, #e07a5f)',
];

// Mini inline carousel for table row thumbnail
const CarThumb = ({ car, index }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const images = car.images || [];

    if (images.length === 0) {
        return (
            <div style={{ background: gradients[index % gradients.length], width: '90px', height: '60px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="rgba(255,255,255,0.4)" viewBox="0 0 16 16">
                    <path d="M2.52 3.515A2.5 2.5 0 0 1 4.82 2h6.362c1 0 1.904.596 2.298 1.515l.792 1.848c.075.175.21.319.38.404.5.25.855.715.965 1.262l.335 1.679q.05.242.05.495v1.296c0 .619-.247 1.178-.644 1.588a.806.806 0 0 1 .644.794v1.292a.808.808 0 0 1-.806.807h-.364a.808.808 0 0 1-.806-.807v-.29H3.955v.29c0 .448-.359.807-.806.807h-.364a.808.808 0 0 1-.806-.807v-1.292c0-.391.281-.716.644-.794A2.234 2.234 0 0 1 2 10.796V9.5q0-.253.05-.495l.335-1.679c.11-.547.465-1.012.964-1.262a.807.807 0 0 0 .381-.404l.792-1.848zM3 10a1 1 0 1 0 2 0 1 1 0 0 0-2 0m9 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0m-1.5-4H5.5l-.8-2h6.6l-.8 2z" />
                </svg>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '90px', height: '60px', borderRadius: '6px', overflow: 'hidden' }}>
            <img src={`http://localhost:8000${images[activeIndex].url}`} alt={car.vehicle_model}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {images.length > 1 && (
                <>
                    <button onClick={() => setActiveIndex((activeIndex - 1 + images.length) % images.length)}
                        style={{ position: 'absolute', left: '2px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', padding: 0, lineHeight: 1 }}>‹</button>
                    <button onClick={() => setActiveIndex((activeIndex + 1) % images.length)}
                        style={{ position: 'absolute', right: '2px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', padding: 0, lineHeight: 1 }}>›</button>
                </>
            )}
        </div>
    );
};

const AvailableCars = () => {
    const [cars, setCars] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
    const [search, setSearch] = useState('');
    const [bookingData, setBookingData] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [newCar, setNewCar] = useState({ vehicle_model: '', vehicle_number: '', seating_capacity: '', rent_per_day: '' });
    const [selectedImages, setSelectedImages] = useState([]);

    const { user, isCustomer, isAgency } = useAuth();
    const navigate = useNavigate();

    const fetchCars = (page = 1) => {
        api.get(`/cars?page=${page}&search=${search}`).then(res => {
            setCars(res.data.data);
            setMeta({ current_page: res.data.current_page, last_page: res.data.last_page });
        });
    };

    useEffect(() => { fetchCars(); }, []);

    const handleAddCar = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('vehicle_model', newCar.vehicle_model);
            formData.append('vehicle_number', newCar.vehicle_number);
            formData.append('seating_capacity', newCar.seating_capacity);
            formData.append('rent_per_day', newCar.rent_per_day);
            selectedImages.forEach(img => formData.append('images[]', img));
            await api.post('/cars', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setShowModal(false);
            setNewCar({ vehicle_model: '', vehicle_number: '', seating_capacity: '', rent_per_day: '' });
            setSelectedImages([]);
            fetchCars();
        } catch (err) { alert(err.response?.data?.message || 'Failed to add car'); }
    };

    const handleRent = async (carId) => {
        if (!user) return navigate('/login');
        const data = bookingData[carId];
        if (!data?.start_date || !data?.total_days) return alert('Please select start date and number of days.');
        try {
            await api.post('/bookings', { ...data, car_id: carId });
            alert('Car rented successfully!');
            fetchCars(meta.current_page);
        } catch (err) { alert(err.response?.data?.message || 'Booking failed'); }
    };

    return (
        <div className="container mt-4 pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{isAgency ? 'Manage Listings' : 'Available Cars to Rent'}</h2>
                {isAgency && <button className="btn btn-success" onClick={() => setShowModal(true)}>+ Add New Car</button>}
            </div>

            {/* Search Bar */}
            <div className="input-group mb-4 shadow-sm">
                <input type="text" className="form-control" placeholder="Search by model or vehicle number..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchCars(1)} />
                <button className="btn btn-primary" onClick={() => fetchCars(1)}>Search</button>
            </div>

            {/* Cars Table */}
            <div className="table-responsive shadow-sm rounded">
                <table className="table table-hover mb-0 bg-white border align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th style={{ width: '100px' }}>Photo</th>
                            <th>Vehicle Model</th>
                            <th>Vehicle No.</th>
                            <th>Seats</th>
                            <th>Rent/Day</th>
                            <th>Status</th>
                            {isCustomer && <th style={{ width: '280px' }}>Book</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {cars.length > 0 ? cars.map((car, index) => (
                            <tr key={car.id}>
                                <td><CarThumb car={car} index={index} /></td>
                                <td><strong>{car.vehicle_model}</strong></td>
                                <td><span className="badge bg-secondary">{car.vehicle_number}</span></td>
                                <td>🪑 {car.seating_capacity}</td>
                                <td className="fw-bold text-primary">₹{car.rent_per_day}</td>
                                <td>
                                    {car.is_available
                                        ? <span className="badge bg-success px-3 py-2">✅ Available</span>
                                        : <span className="badge bg-danger px-3 py-2">🔴 Rented</span>
                                    }
                                </td>
                                {isCustomer && (
                                    <td>
                                        {car.is_available ? (
                                            <div className="d-flex gap-1 align-items-center flex-wrap">
                                                <input type="date" className="form-control form-control-sm" style={{ width: '140px' }}
                                                    onChange={(e) => setBookingData({ ...bookingData, [car.id]: { ...bookingData[car.id], start_date: e.target.value } })} />
                                                <select className="form-select form-select-sm" style={{ width: '110px' }}
                                                    onChange={(e) => setBookingData({ ...bookingData, [car.id]: { ...bookingData[car.id], total_days: e.target.value } })}>
                                                    <option value="">Days</option>
                                                    {[...Array(10)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1} Day(s)</option>)}
                                                </select>
                                                <button className="btn btn-primary btn-sm" onClick={() => handleRent(car.id)}>🚗 Rent</button>
                                            </div>
                                        ) : (
                                            <span className="text-muted small">Car not available</span>
                                        )}
                                    </td>
                                )}
                                {!isCustomer && !isAgency && (
                                    <td>
                                        <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/login')}>🔑 Login to Rent</button>
                                    </td>
                                )}
                            </tr>
                        )) : (
                            <tr><td colSpan="7" className="text-center p-4 text-muted">No cars found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <nav className="mt-4">
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${meta.current_page === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => fetchCars(meta.current_page - 1)}>Previous</button>
                    </li>
                    <li className="page-item"><span className="page-link text-dark">Page {meta.current_page} of {meta.last_page}</span></li>
                    <li className={`page-item ${meta.current_page === meta.last_page ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => fetchCars(meta.current_page + 1)}>Next</button>
                    </li>
                </ul>
            </nav>

            {/* Add Car Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Add New Car Listing</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleAddCar}>
                                <div className="modal-body p-4">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Vehicle Model</label>
                                            <input type="text" className="form-control" value={newCar.vehicle_model} onChange={(e) => setNewCar({ ...newCar, vehicle_model: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Vehicle Number</label>
                                            <input type="text" className="form-control" value={newCar.vehicle_number} onChange={(e) => setNewCar({ ...newCar, vehicle_number: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Seating Capacity</label>
                                            <input type="number" className="form-control" value={newCar.seating_capacity} onChange={(e) => setNewCar({ ...newCar, seating_capacity: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Rent Per Day (₹)</label>
                                            <input type="number" className="form-control" value={newCar.rent_per_day} onChange={(e) => setNewCar({ ...newCar, rent_per_day: e.target.value })} required />
                                        </div>
                                        <div className="col-12 mb-2">
                                            <label className="form-label">Car Images <span className="text-muted small">(Multiple allowed, max 2MB each)</span></label>
                                            <input type="file" className="form-control" accept="image/*" multiple onChange={(e) => setSelectedImages(Array.from(e.target.files))} />
                                            {selectedImages.length > 0 && (
                                                <div className="mt-2 d-flex flex-wrap gap-2">
                                                    {selectedImages.map((img, i) => (
                                                        <img key={i} src={URL.createObjectURL(img)} alt="preview"
                                                            style={{ width: '70px', height: '55px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #dee2e6' }} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-4 pb-4">
                                    <button type="submit" className="btn btn-primary w-100">Save Car Listing</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailableCars;
