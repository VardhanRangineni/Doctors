import React from 'react';
import { FaSearch, FaWifi, FaUserCircle } from 'react-icons/fa';
import { BsGrid3X3GapFill } from "react-icons/bs";

const Header = () => {
    return (
        <header className="bg-white border-bottom py-2 px-4 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
                <div className=" rounded p-1 me-2 d-flex align-items-center justify-content-center">
                    <span className=""><img src="public/Medplus.png" alt="Medplus Logo" style={{ width: '32px', height: '32px' }} /></span>
                </div>
                <div className="border-start border-2 mx-2" style={{ height: '32px', borderColor: '#e0e0e0' }}></div>
                <div>
                    <div className="text-danger small fw-bold" style={{ fontSize: '0.7rem' }}>CRM</div>
                    <div className="fw-bold" style={{ fontSize: '1rem' }}>Doctor E-Prescriptions</div>
                </div>
            </div>

            <div className="d-flex align-items-center gap-4">
                <FaSearch className="text-muted" />
                <FaWifi className="text-success" />
                <div className="d-flex align-items-center text-end">
                    <div className="me-2">
                        <div className="fw-bold small">Vardhan Rangineni</div>
                        <div className="text-muted small" style={{ fontSize: '0.7rem' }}>Emp ID: OTG06992A</div>
                        <div className="text-muted small" style={{ fontSize: '0.7rem' }}>ranginenivardhan@gmail.com</div>
                    </div>
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
                        VR
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
