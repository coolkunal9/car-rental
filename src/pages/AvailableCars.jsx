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

const CarBanner = ({ car, index }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const images = car.images || [];

    // Fallback if no images
    if (images.length === 0) {
        return (
            <div style={{ background: gradients[index % gradients.length], height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" fill="rgba(255,255,255,0.15)" viewBox="0 0 16 16">
                    <path d="M2.52 3.515A2.5 2.5 0 0 1 4.82 2h6.362c1 0 1.904.596 2.298 1.515l.792 1.848c.075.175.21.319.38.404.5.25.855.715.965 1.262l.335 1.679q.05.242.05.495v1.296c0 .619-.247 1.178-.644 1.588a.806.806 0 0 1 .644.794v1.292a.808.808 0 0 1-.806.807h-.364a.808.808 0 0 1-.806-.807v-.29H3.955v.29c0 .448-.359.807-.806.807h-.364a.808.808 0 0 1-.806-.807v-1.292c0-.391.281-.716.644-.794A2.234 2.234 0 0 1 2 10.796V9.5q0-.253.05-.495l.335-1.679c.11-.547.465-1.012.964-1.262a.807.807 0 0 0 .381-.404l.792-1.848zM3 10a1 1 0 1 0 2 0 1 1 0 0 0-2 0m9 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0m-1.5-4H5.5l-.8-2h6.6l-.8 2z" />
                </svg>
                <div style={{ position: 'absolute', top: '10px', right: '12px', background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '20px', padding: '2px 10px', fontSize: '12px' }}>
                    🪑 {car.seating_capacity} Seats
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', height: '160px', overflow: 'hidden', background: '#000' }}>
            <img
                src={images[activeIndex].url.startsWith('http') ? images[activeIndex].url : `http://localhost/car-rental/PHP/uploads/${images[activeIndex].image_path}`}
                alt={car.vehicle_model}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {images.length > 1 && (
                <>
                    <button onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex - 1 + images.length) % images.length); }}
                        style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', zIndex: 10 }}>‹</button>
                    <button onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex + 1) % images.length); }}
                        style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', zIndex: 10 }}>›</button>
                </>
            )}
            <div style={{ position: 'absolute', top: '10px', right: '12px', background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', zIndex: 5 }}>
                🪑 {car.seating_capacity} Seats
            </div>
        </div>
    );
};

const AvailableCars = () => {
    const { user, isCustomer, isAgency } = useAuth();
    const navigate = useNavigate();

    const [cars, setCars] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [bookingData, setBookingData] = useState({});
    const [newCar, setNewCar] = useState({ vehicle_model: '', vehicle_number: '', seating_capacity: '', rent_per_day: '' });
    const [selectedImages, setSelectedImages] = useState([]);

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
        if (!data?.start_date || !data?.total_days) return alert('Select date and days');
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

            <div className="input-group mb-4 shadow-sm">
                <input type="text" className="form-control" placeholder="Search by model..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchCars(1)} />
                <button className="btn btn-primary" onClick={() => fetchCars(1)}>Search</button>
            </div>

            <div className="row">
                {cars.map((car, index) => (
                    <div className="col-md-4 mb-4" key={car.id}>
                        <div className="card shadow h-100 border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                            <CarBanner car={car} index={index} />
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h5 className="card-title fw-bold mb-0">{car.vehicle_model}</h5>
                                    {car.is_available 
                                        ? <span className="badge bg-success">Available</span>
                                        : <span className="badge bg-danger">Rented</span>
                                    }
                                </div>
                                <p className="card-text small text-muted mb-3">Vehicle No: {car.vehicle_number}</p>
                                <div className="fs-5 fw-bold text-primary mb-3">₹{car.rent_per_day}<span className="fs-6 fw-normal text-muted">/day</span></div>

                                {isCustomer && car.is_available && (
                                    <div className="bg-light p-2 mb-3 rounded border">
                                        <input type="date" className="form-control form-control-sm mb-2" onChange={(e) => setBookingData({ ...bookingData, [car.id]: { ...bookingData[car.id], start_date: e.target.value } })} />
                                        <select className="form-select form-select-sm" onChange={(e) => setBookingData({ ...bookingData, [car.id]: { ...bookingData[car.id], total_days: e.target.value } })}>
                                            <option value="">Select Days</option>
                                            {[...Array(10)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1} Day(s)</option>)}
                                        </select>
                                    </div>
                                )}

                                <button 
                                    className="btn btn-primary w-100 mt-auto" 
                                    onClick={() => handleRent(car.id)} 
                                    disabled={isAgency || !car.is_available}
                                >
                                    {isAgency ? 'Agency View Only' : (!car.is_available ? 'Rented' : (user ? '🚗 Rent Now' : '🔑 Login to Rent'))}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
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
                                        <div className="col-md-6 mb-3"><label className="form-label">Model</label><input type="text" className="form-control" onChange={(e) => setNewCar({...newCar, vehicle_model: e.target.value})} required/></div>
                                        <div className="col-md-6 mb-3"><label className="form-label">Vehicle No</label><input type="text" className="form-control" onChange={(e) => setNewCar({...newCar, vehicle_number: e.target.value})} required/></div>
                                        <div className="col-md-6 mb-3"><label className="form-label">Seats</label><input type="number" className="form-control" onChange={(e) => setNewCar({...newCar, seating_capacity: e.target.value})} required/></div>
                                        <div className="col-md-6 mb-3"><label className="form-label">Rent/Day</label><input type="number" className="form-control" onChange={(e) => setNewCar({...newCar, rent_per_day: e.target.value})} required/></div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label">Images</label>
                                            <input type="file" className="form-control" multiple onChange={(e) => setSelectedImages(Array.from(e.target.files))}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-4"><button type="submit" className="btn btn-primary w-100">Save Car</button></div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailableCars;
