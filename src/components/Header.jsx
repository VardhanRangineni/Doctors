import React from 'react';
import { FaSearch, FaWifi, FaUserCircle } from 'react-icons/fa';
import { BsGrid3X3GapFill } from "react-icons/bs";
import medPlusLogo from '../assets/MedPlus.png';

const Header = () => {
    const [networkStrength, setNetworkStrength] = React.useState({ type: '4g', downlink: 10 });

    React.useEffect(() => {
        const updateConnectionStatus = () => {
            if (navigator.onLine) {
                const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                if (connection) {
                    setNetworkStrength({
                        type: connection.effectiveType,
                        downlink: connection.downlink
                    });
                } else {
                    // Default if API not supported but online
                    setNetworkStrength({ type: '4g', downlink: 10 });
                }
            } else {
                setNetworkStrength({ type: 'offline', downlink: 0 });
            }
        };

        window.addEventListener('online', updateConnectionStatus);
        window.addEventListener('offline', updateConnectionStatus);

        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            connection.addEventListener('change', updateConnectionStatus);
        }

        updateConnectionStatus();

        return () => {
            window.removeEventListener('online', updateConnectionStatus);
            window.removeEventListener('offline', updateConnectionStatus);
            if (connection) {
                connection.removeEventListener('change', updateConnectionStatus);
            }
        };
    }, []);

    const getWifiColor = () => {
        const { type, downlink } = networkStrength;

        if (type === 'offline' || downlink === 0) return 'text-danger';
        if (downlink < 5) return 'text-danger'; // Weak (< 5 Mbps)
        if (downlink < 30) return 'text-warning'; // Medium (5 - 30 Mbps)
        return 'text-success'; // Strong (> 30 Mbps)
    };

    const getTooltip = () => {
        const { type, downlink } = networkStrength;
        if (type === 'offline') return 'Offline';
        return `Speed: ~${downlink} Mbps (${type})`;
    };

    return (
        <header className="bg-white border-bottom py-2 px-4 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
                <div className=" rounded p-1 me-2 d-flex align-items-center justify-content-center">
                    <span className=""><img src={medPlusLogo} alt="Medplus Logo" style={{ width: '32px', height: '32px' }} /></span>
                </div>
                <div className="border-start border-2 mx-2" style={{ height: '32px', borderColor: '#e0e0e0' }}></div>
                <div>
                    <div className="text-danger small fw-bold" style={{ fontSize: '0.7rem' }}>CRM</div>
                    <div className="fw-bold" style={{ fontSize: '1rem' }}>Doctor E-Prescriptions</div>
                </div>
            </div>

            <div className="d-flex align-items-center gap-4">
                <FaSearch className="text-muted" />
                <FaWifi className={getWifiColor()} title={getTooltip()} />
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
