import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'connected', or 'error'
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Check API status
    useEffect(() => {
        const checkApiStatus = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}test/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                if (response.ok) {
                    setApiStatus('connected');
                } else {
                    setApiStatus('error');
                }
            } catch (error) {
                console.error('API Status Check Error:', error);
                setApiStatus('error');
            }
        };

        checkApiStatus();
        // Check status every 30 seconds
        const interval = setInterval(checkApiStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const getStatusDetails = () => {
        switch (apiStatus) {
            case 'connected':
                return {
                    text: 'API Connected',
                    className: 'status-connected'
                };
            case 'error':
                return {
                    text: 'API Disconnected',
                    className: 'status-error'
                };
            default:
                return {
                    text: 'Checking API',
                    className: 'status-checking'
                };
        }
    };

    const statusDetails = getStatusDetails();

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <div className="logo-wrapper">
                        <span className="logo-text">Blue</span>
                        <span className="logo-accent">Callom</span>
                    </div>
                </Link>

                <div className="navbar-links">
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                        <span className="nav-icon">🏠</span>
                        <span className="nav-text">Home</span>
                        <div className="nav-highlight"></div>
                    </Link>

                    <Link to="/prompt-studio" className={`nav-link ${location.pathname === '/prompt-studio' ? 'active' : ''}`}>
                        <span className="nav-icon">⚡</span>
                        <span className="nav-text">Prompt Studio</span>
                        <div className="nav-highlight"></div>
                    </Link>

                    <Link to="/agent-studio" className={`nav-link ${location.pathname === '/agent-studio' ? 'active' : ''}`}>
                        <span className="nav-icon">🤖</span>
                        <span className="nav-text">Agent Studio</span>
                        <div className="nav-highlight"></div>
                    </Link>

                    <Link to="/io" className={`nav-link ${location.pathname === '/io' ? 'active' : ''}`}>
                        <span className="nav-icon">🔄</span>
                        <span className="nav-text">I/O</span>
                        <div className="nav-highlight"></div>
                    </Link>

                    <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
                        <span className="nav-icon">ℹ️</span>
                        <span className="nav-text">About</span>
                        <div className="nav-highlight"></div>
                    </Link>
                </div>

                <div className="navbar-actions">
                    <div className="navbar-status">
                        <div className={`status-dot ${statusDetails.className}`}></div>
                        <span className="status-text">{statusDetails.text}</span>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar; 