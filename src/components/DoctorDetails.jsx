import React from 'react';
import { SHIPMENT_TYPES } from '../data/mockData';
import { FaArrowLeft } from 'react-icons/fa';

const DoctorDetails = ({ doctor, onBack }) => {
    if (!doctor) return null;

    return (
        <div className="container-fluid p-4 bg-light" style={{ minHeight: '100vh' }}>
            <div className="mb-4">
                <button className="btn btn-link text-decoration-none p-0 mb-2 d-flex align-items-center" onClick={onBack}>
                    <FaArrowLeft className="me-2" /> Back to Dashboard
                </button>
                <h2>{doctor.name}</h2>
                <p className="text-muted">Doctor Details</p>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-5 text-center text-muted">
                    {/* Placeholder for new content */}
                    <h4>Details Section</h4>
                    <p>Select a new view or configuration (Waiting for requirements...)</p>
                </div>
            </div>
        </div>
    );
};

export default DoctorDetails;
