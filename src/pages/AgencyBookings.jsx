import { useState, useEffect } from 'react';
import api from '../services/api';

const AgencyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
    const [search, setSearch] = useState('');

    const fetchBookings = (page = 1) => {
        api.get(`/agency/bookings?page=${page}&search=${search}`).then(res => {
            setBookings(res.data.data);
            setMeta({ current_page: res.data.current_page, last_page: res.data.last_page });
        });
    };

    useEffect(() => { fetchBookings(); }, []);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Customer Bookings</h2>
                <div className="input-group w-50 shadow-sm">
                    <input type="text" className="form-control" placeholder="Search customer or car..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    <button className="btn btn-primary" onClick={() => fetchBookings(1)}>Search</button>
                </div>
            </div>
            <div className="table-responsive shadow-sm rounded">
                <table className="table table-hover mb-0 bg-white shadow-sm border">
                    <thead className="table-dark">
                        <tr><th>Car Model</th><th>Number</th><th>Customer</th><th>Start Date</th><th>Days</th><th>Total Rent</th></tr>
                    </thead>
                    <tbody>
                        {bookings.length > 0 ? bookings.map(b => (
                            <tr key={b.id}>
                                <td><strong>{b.car.vehicle_model}</strong></td><td>{b.car.vehicle_number}</td>
                                <td>{b.customer.name}</td><td>{b.start_date}</td>
                                <td>{b.total_days}</td><td className="text-success fw-bold">₹{b.total_rent}</td>
                            </tr>
                        )) : <tr><td colSpan="6" className="text-center p-4">No bookings found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <nav className="mt-4"><ul className="pagination justify-content-center">
                <li className={`page-item ${meta.current_page === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => fetchBookings(meta.current_page - 1)}>Prev</button></li>
                <li className="page-item"><span className="page-link text-dark">Page {meta.current_page} / {meta.last_page}</span></li>
                <li className={`page-item ${meta.current_page === meta.last_page ? 'disabled' : ''}`}><button className="page-link" onClick={() => fetchBookings(meta.current_page + 1)}>Next</button></li>
            </ul></nav>
        </div>
    );
};

export default AgencyBookings;
