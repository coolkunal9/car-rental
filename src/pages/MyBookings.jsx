import { useState, useEffect } from 'react';
import api from '../services/api';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });

    const fetchMyBookings = (page = 1) => {
        api.get(`/customer/bookings?page=${page}`).then(res => {
            setBookings(res.data.data);
            setMeta({ current_page: res.data.current_page, last_page: res.data.last_page });
        });
    };

    useEffect(() => { fetchMyBookings(); }, []);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">My Rental History</h2>
            <div className="row">
                {bookings.length > 0 ? bookings.map(b => (
                    <div className="col-md-6 mb-4" key={b.id}>
                        <div className="card shadow-sm border-0 bg-light">
                            <div className="card-body">
                                <h5 className="card-title text-success">{b.car.vehicle_model}</h5>
                                <p className="mb-1"><strong>Vehicle No:</strong> {b.car.vehicle_number}</p>
                                <p className="mb-1"><strong>Start Date:</strong> {b.start_date}</p>
                                <p className="mb-1"><strong>Duration:</strong> {b.total_days} Day(s)</p>
                                <hr />
                                <p className="mb-0 fs-5 fw-bold text-dark">Total Paid: ₹{b.total_rent}</p>
                            </div>
                        </div>
                    </div>
                )) : <div className="col-12 text-center p-5"><h4>You haven't booked any cars yet.</h4></div>}
            </div>

            {/* Pagination Controls */}
            <nav className="mt-4"><ul className="pagination justify-content-center">
                <li className={`page-item ${meta.current_page === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => fetchMyBookings(meta.current_page - 1)}>Prev</button></li>
                <li className="page-item"><span className="page-link px-4">Page {meta.current_page} of {meta.last_page}</span></li>
                <li className={`page-item ${meta.current_page === meta.last_page ? 'disabled' : ''}`}><button className="page-link" onClick={() => fetchMyBookings(meta.current_page + 1)}>Next</button></li>
            </ul></nav>
        </div>
    );
};

export default MyBookings;
