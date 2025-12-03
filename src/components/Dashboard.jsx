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

    // Calculate Global Average Times
    const globalAvgTimes = useMemo(() => {
        let totalReqToPresc = 0;
        let totalAssignToPresc = 0;
        let totalStartToPresc = 0;
        let totalNonResponded = 0;
        let totalCompleted = 0;
        let totalReassigned = 0;

        doctors.forEach(doc => {
            const completed = doc.metrics.completed;
            const reassigned = doc.metrics.reassigned;

            if (completed > 0) {
                totalReqToPresc += parseFloat(doc.avgTimes.reqToPresc) * completed;
                totalAssignToPresc += parseFloat(doc.avgTimes.assignToPresc) * completed;
                totalStartToPresc += parseFloat(doc.avgTimes.startToPresc) * completed;
                totalCompleted += completed;
            }
            if (reassigned > 0) {
                totalNonResponded += parseFloat(doc.avgTimes.nonResponded) * reassigned;
                totalReassigned += reassigned;
            }
        });

        return {
            reqToPresc: totalCompleted > 0 ? (totalReqToPresc / totalCompleted).toFixed(0) : 0,
            assignToPresc: totalCompleted > 0 ? (totalAssignToPresc / totalCompleted).toFixed(0) : 0,
            startToPresc: totalCompleted > 0 ? (totalStartToPresc / totalCompleted).toFixed(0) : 0,
            nonResponded: totalReassigned > 0 ? (totalNonResponded / totalReassigned).toFixed(0) : 0
        };
    }, [doctors]);

    const activeDoctorsCount = doctors.filter(d => d.status === 'Available').length;
    const avgOrdersPerActive = activeDoctorsCount > 0 ? (kpis.completed / activeDoctorsCount).toFixed(1) : "0.0";
    const unclaimedRate = kpis.totalAssigned > 0 ? ((kpis.unclaimed / kpis.totalAssigned) * 100).toFixed(1) : "0.0";

    const downloadExcel = () => {
        const headers = [
            "Doctor Name", "Shipment Type", "Current Status", "Total Assigned", "Auto Assigned",
            "Manual Assigned", "Reassigned", "Completed", "Pending",
            "Unclaimed", "Available Hrs", "Idle Time", "Avg Time / Order (in mins)"
        ];

        let csvRows = [];
        csvRows.push(headers.join(","));

        doctors.forEach(doc => {
            // Main Doctor Row (Summary)
            const mainRow = [
                doc.name,
                "All",
                doc.status,
                doc.metrics.totalAssigned,
                doc.metrics.autoAssigned,
                doc.metrics.manualAssigned,
                doc.metrics.reassigned,
                doc.metrics.completed,
                doc.metrics.pending,
                doc.metrics.unclaimed,
                doc.timeData.availableHours,
                doc.timeData.idleTime,
                doc.timeData.avgOrdersPerHour
            ];
            csvRows.push(mainRow.join(","));

            // Shipment Breakdown Rows
            if (doc.shipmentMetrics) {
                doc.shipmentMetrics.forEach(metric => {
                    const row = [
                        doc.name, // Repeating name for better filtering
                        metric.type,
                        "", // Current Status (Blank)
                        metric.total,
                        metric.auto,
                        metric.manual,
                        metric.reassigned,
                        metric.completed,
                        metric.pending,
                        metric.unclaimed,
                        "", // Available Hrs (Blank)
                        "", // Idle Time (Blank)
                        ""  // Avg Time / Order (Blank)
                    ];
                    csvRows.push(row.join(","));
                });
            }
        });

        const csvContent = csvRows.join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "doctor_metrics.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
            <Header />
            <div className="d-flex flex-grow-1">
                <Sidebar />
                <div className="flex-grow-1 p-4 bg-light">
                    {/* Title and Filters */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Doctor E-Prescriptions</h5>
                        <div className="d-flex gap-2">
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
                    </div>

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
                                            <h6 className="text-muted text-uppercase small fw-bold mb-2">Avg Order / Doctor</h6>
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
                        <Carousel.Item>
                            <div className="row g-3 p-1">
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm" style={{ minHeight: '10rem' }}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center">
                                            <h6 className="text-muted text-uppercase small fw-bold mb-2">Average Time / Order</h6>
                                            <div className="d-flex flex-column gap-2 small">
                                                <div className="d-flex justify-content-between border-bottom pb-1">
                                                    <span>Request - Prescription:</span>
                                                    <span className="fw-bold text-primary">{globalAvgTimes.reqToPresc} min</span>
                                                </div>
                                                <div className="d-flex justify-content-between border-bottom pb-1">
                                                    <span>Assignment - Prescription:</span>
                                                    <span className="fw-bold text-info">{globalAvgTimes.assignToPresc} min</span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span>Start - Prescription:</span>
                                                    <span className="fw-bold text-success">{globalAvgTimes.startToPresc} min</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm" style={{ minHeight: '10rem' }}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center">
                                            <h6 className="text-muted text-uppercase small fw-bold mb-2">Non Responded Avg Time</h6>
                                            <h2 className="display-6 fw-bold text-danger mb-0">{globalAvgTimes.nonResponded} min</h2>
                                            <div className="small text-muted mt-2">Avg time for Request - Prescription</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Carousel.Item>
                    </Carousel>

                    <div className="bg-white rounded shadow-sm p-3">


                        {/* KPI Tabs Removed */}

                        {/* Export Button */}
                        <div className="d-flex justify-content-end mb-3">
                            <button className="btn btn-success btn-sm d-flex align-items-center gap-2" onClick={downloadExcel}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-excel" viewBox="0 0 16 16">
                                    <path d="M5.884 6.68a.5.5 0 1 0-.768.64L7.349 10l-2.233 2.68a.5.5 0 0 0 .768.64L8 10.781l2.116 2.54a.5.5 0 0 0 .768-.641L8.651 10l2.233-2.68a.5.5 0 0 0-.768-.64L8 9.219l-2.116-2.54z" />
                                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
                                </svg>
                                Export to Excel
                            </button>
                        </div>

                        {/* Table */}
                        <div className="table-responsive">
                            <table className="table table-hover align-middle text-nowrap">
                                <thead className="table-light">
                                    <tr>
                                        <th>Doctor Name</th>
                                        <th>Current Status</th>
                                        <th className="text-center">Total Assigned</th>
                                        <th className="text-center">Auto Assigned</th>
                                        <th className="text-center">Manual Assigned</th>
                                        <th className="text-center">Reassigned</th>
                                        <th className="text-center">Completed</th>
                                        <th className="text-center">Pending</th>
                                        <th className="text-center">Unclaimed</th>
                                        <th className="text-center">Available Hrs</th>
                                        <th className="text-center">Idle Time</th>
                                        <th className="text-center">Avg Time / Order (in mins)</th>
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
                                                <td className="text-center">{doctor.metrics.totalAssigned}</td>
                                                <td className="text-center">{doctor.metrics.autoAssigned}</td>
                                                <td className="text-center">{doctor.metrics.manualAssigned}</td>
                                                <td className="text-center">{doctor.metrics.reassigned}</td>
                                                <td className="text-center text-success fw-bold">{doctor.metrics.completed}</td>
                                                <td className="text-center text-warning fw-bold">{doctor.metrics.pending}</td>
                                                <td className="text-center text-danger fw-bold">{doctor.metrics.unclaimed}</td>
                                                <td className="text-center">{doctor.timeData.availableHours}</td>
                                                <td className="text-center text-muted fw-bold">{doctor.timeData.idleTime}</td>
                                                <td className="text-center">{doctor.timeData.avgOrdersPerHour}</td>
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
