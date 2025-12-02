import React, { useState, useEffect, useMemo } from 'react';
import { Carousel } from 'react-bootstrap';
import { getDashboardData } from '../data/mockData';
import Header from './Header';
import Sidebar from './Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';

const Dashboard = () => {
    const [doctors, setDoctors] = useState([]);
    const [expandedDoctorId, setExpandedDoctorId] = useState(null);

    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    useEffect(() => {
        const data = getDashboardData(startDate, endDate);
        setDoctors(data);
    }, [startDate, endDate]);

    // Calculate KPIs
    const kpis = useMemo(() => {
        return doctors.reduce((acc, doc) => {
            acc.totalAssigned += doc.metrics.totalAssigned;
            acc.completed += doc.metrics.completed;
            acc.pending += doc.metrics.pending;
            acc.unclaimed += doc.metrics.unclaimed;
            acc.verified += doc.metrics.manualAssigned; // Mapping 'Manual' to 'Verified' for demo
            acc.rejected += doc.metrics.reassigned; // Mapping 'Reassigned' to 'Rejected' for demo
            return acc;
        }, { totalAssigned: 0, completed: 0, pending: 0, unclaimed: 0, verified: 0, rejected: 0 });
    }, [doctors]);

    const activeDoctorsCount = doctors.filter(d => d.status === 'Available').length;
    const avgOrdersPerActive = activeDoctorsCount > 0 ? (kpis.completed / activeDoctorsCount).toFixed(1) : "0.0";
    const unclaimedRate = kpis.totalAssigned > 0 ? ((kpis.unclaimed / kpis.totalAssigned) * 100).toFixed(1) : "0.0";

    return (
        <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
            <Header />
            <div className="d-flex flex-grow-1">
                <Sidebar />
                <div className="flex-grow-1 p-4 bg-light">
                    {/* High-level KPI Cards Carousel */}
                    <Carousel interval={3000} indicators={false} controls={true} variant="dark" className="mb-4 kpi-carousel">
                        <Carousel.Item>
                            <div className="row g-3 p-1">
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm" style={{ minHeight: '10rem' }}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center">
                                            <h6 className="text-muted text-uppercase small fw-bold mb-2">Total Doctors</h6>
                                            <h2 className="display-6 fw-bold text-primary mb-2">{doctors.length}</h2>
                                            <div className="d-flex justify-content-center gap-3 small">
                                                <div className="d-flex align-items-center text-success">
                                                    <span className="badge bg-success rounded-circle p-1 me-1" style={{ width: '8px', height: '8px' }}></span>
                                                    <span className="fw-bold me-1">{activeDoctorsCount}</span> Available
                                                </div>
                                                <div className="d-flex align-items-center text-danger">
                                                    <span className="badge bg-danger rounded-circle p-1 me-1" style={{ width: '8px', height: '8px' }}></span>
                                                    <span className="fw-bold me-1">{doctors.length - activeDoctorsCount}</span> Unavailable
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm" style={{ minHeight: '10rem' }}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center">
                                            <h6 className="text-muted text-uppercase small fw-bold mb-2">Avg Orders / Active Doctor</h6>
                                            <h2 className="display-6 fw-bold text-info mb-0">{avgOrdersPerActive}</h2>
                                            <div className="small text-muted mt-2">Based on {activeDoctorsCount} active doctors</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm" style={{ minHeight: '10rem' }}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center">
                                            <h6 className="text-muted text-uppercase small fw-bold mb-2">Unclaimed %</h6>
                                            <h2 className="display-6 fw-bold text-danger mb-0">{unclaimedRate}%</h2>
                                            <div className="small text-muted mt-2">{kpis.unclaimed} orders unclaimed</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Carousel.Item>
                        <Carousel.Item>
                            <div className="row g-3 p-1">
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm" style={{ minHeight: '10rem' }}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center">
                                            <h6 className="text-muted text-uppercase small fw-bold mb-2">Total Assigned</h6>
                                            <h2 className="display-6 fw-bold text-dark mb-0">{kpis.totalAssigned}</h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm" style={{ minHeight: '10rem' }}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center">
                                            <h6 className="text-muted text-uppercase small fw-bold mb-2">Completed</h6>
                                            <h2 className="display-6 fw-bold text-success mb-0">{kpis.completed}</h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm" style={{ minHeight: '10rem' }}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center">
                                            <h6 className="text-muted text-uppercase small fw-bold mb-2">Pending</h6>
                                            <h2 className="display-6 fw-bold text-warning mb-0">{kpis.pending}</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Carousel.Item>
                    </Carousel>

                    <div className="bg-white rounded shadow-sm p-4">
                        <h5 className="mb-4">Doctor E-Prescriptions</h5>

                        {/* KPI Tabs */}
                        <div className="d-flex border-bottom mb-4 overflow-auto">
                            <div className="kpi-tab active-tab">
                                <span className="text-primary fw-bold">To Be Claimed</span>
                                <span className="badge bg-light text-dark ms-2 border">{kpis.pending}</span>
                            </div>
                            <div className="kpi-tab">
                                <span className="text-muted">Claimed</span>
                                <span className="badge bg-light text-dark ms-2 border">{kpis.totalAssigned}</span>
                            </div>
                            <div className="kpi-tab">
                                <span className="text-muted">Verified</span>
                                <span className="badge bg-light text-dark ms-2 border">{kpis.verified}</span>
                            </div>
                            <div className="kpi-tab">
                                <span className="text-muted">Rejected</span>
                                <span className="badge bg-light text-dark ms-2 border">{kpis.rejected}</span>
                            </div>
                            <div className="kpi-tab">
                                <span className="text-muted">Unclaimed</span>
                                <span className="badge bg-light text-dark ms-2 border">{kpis.unclaimed}</span>
                            </div>
                            <div className="kpi-tab">
                                <span className="text-muted">Non-Responded</span>
                                <span className="badge bg-light text-dark ms-2 border">0</span>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="d-flex justify-content-end mb-3 gap-2">
                            <div className="d-flex align-items-center">
                                <span className="me-2 small fw-bold text-muted">From:</span>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    style={{ width: '150px' }}
                                    value={startDate}
                                    max={today}
                                    onChange={e => {
                                        const newStart = e.target.value;
                                        setStartDate(newStart);
                                        if (newStart > endDate) {
                                            setEndDate(newStart);
                                        }
                                    }}
                                />
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="me-2 small fw-bold text-muted">To:</span>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    style={{ width: '150px' }}
                                    value={endDate}
                                    max={today}
                                    min={startDate}
                                    onChange={e => {
                                        const newEnd = e.target.value;
                                        if (newEnd >= startDate) {
                                            setEndDate(newEnd);
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="table-responsive">
                            <table className="table table-hover align-middle text-nowrap">
                                <thead className="table-light">
                                    <tr>
                                        <th>Doctor Name</th>
                                        <th>Current Status</th>
                                        <th>Total Assigned</th>
                                        <th>Auto Assigned</th>
                                        <th>Manual Assigned</th>
                                        <th>Reassigned</th>
                                        <th>Completed</th>
                                        <th>Pending</th>
                                        <th>Unclaimed</th>
                                        <th>Idle Time</th>
                                        <th>Available Hrs</th>
                                        <th>Avg Orders/Hr</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doctors.map((doctor) => (
                                        <React.Fragment key={doctor.id}>
                                            <tr
                                                onClick={() => setExpandedDoctorId(expandedDoctorId === doctor.id ? null : doctor.id)}
                                                style={{ cursor: 'pointer' }}
                                                className={expandedDoctorId === doctor.id ? "table-active" : ""}
                                            >
                                                <td className="fw-bold">
                                                    {expandedDoctorId === doctor.id ? "▼ " : "▶ "}
                                                    {doctor.name}
                                                </td>
                                                <td>
                                                    <span className={`badge ${doctor.status === 'Available' ? 'bg-success' : 'bg-danger'}`}>
                                                        {doctor.status}
                                                    </span>
                                                </td>
                                                <td>{doctor.metrics.totalAssigned}</td>
                                                <td>{doctor.metrics.autoAssigned}</td>
                                                <td>{doctor.metrics.manualAssigned}</td>
                                                <td>{doctor.metrics.reassigned}</td>
                                                <td className="text-success fw-bold">{doctor.metrics.completed}</td>
                                                <td className="text-warning fw-bold">{doctor.metrics.pending}</td>
                                                <td className="text-danger fw-bold">{doctor.metrics.unclaimed}</td>
                                                <td className="text-muted fw-bold">{doctor.timeData.idleTime}</td>
                                                <td>{doctor.timeData.availableHours}</td>
                                                <td>{doctor.timeData.avgOrdersPerHour}</td>
                                            </tr>
                                            {expandedDoctorId === doctor.id && (
                                                <tr>
                                                    <td colSpan="12" className="p-0 bg-light">
                                                        <div className="p-3">
                                                            <h6 className="text-muted mb-3 ps-2 border-start border-4 border-primary">Shipment Breakdown for {doctor.name}</h6>
                                                            <table className="table table-sm table-bordered bg-white mb-0">
                                                                <thead className="table-light">
                                                                    <tr>
                                                                        <th>Shipment Type</th>
                                                                        <th>Total Assigned</th>
                                                                        <th>Auto Assigned</th>
                                                                        <th>Manual Assigned</th>
                                                                        <th>Reassigned</th>
                                                                        <th>Completed</th>
                                                                        <th>Pending</th>
                                                                        <th>Unclaimed</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {doctor.shipmentMetrics.map((metric) => (
                                                                        <tr key={metric.type}>
                                                                            <td className="fw-medium">
                                                                                <div className="d-flex justify-content-between align-items-center">
                                                                                    {metric.type}
                                                                                    <span
                                                                                        className={`rounded-circle ${metric.isAutoAssignable ? 'bg-success' : 'bg-danger'}`}
                                                                                        style={{ width: '10px', height: '10px' }}
                                                                                        title={metric.isAutoAssignable ? "Auto-Assignment Available" : "Auto-Assignment Unavailable"}
                                                                                    ></span>
                                                                                </div>
                                                                            </td>
                                                                            <td>{metric.total}</td>
                                                                            <td>{metric.auto}</td>
                                                                            <td>{metric.manual}</td>
                                                                            <td>{metric.reassigned}</td>
                                                                            <td className="text-success">{metric.completed}</td>
                                                                            <td className="text-warning">{metric.pending}</td>
                                                                            <td className="text-danger">{metric.unclaimed}</td>
                                                                        </tr>
                                                                    ))}
                                                                    {doctor.shipmentMetrics.length === 0 && (
                                                                        <tr>
                                                                            <td colSpan="8" className="text-center text-muted">No shipment data available for this period.</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Mock */}
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <div className="btn-group">
                                <button className="btn btn-outline-secondary btn-sm" disabled>First</button>
                                <button className="btn btn-outline-secondary btn-sm" disabled>Previous</button>
                                <button className="btn btn-dark btn-sm">1</button>
                                <button className="btn btn-outline-secondary btn-sm">Next</button>
                                <button className="btn btn-outline-secondary btn-sm">Last</button>
                            </div>
                            <div className="small text-muted">Showing 1 to 10 of 513 Records</div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
