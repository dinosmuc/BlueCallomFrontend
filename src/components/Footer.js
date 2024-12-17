// frontend/src/components/Footer.js
import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h4>About</h4>
                    <p>AI Agent Studio helps you create, manage and execute AI workflows with ease.</p>
                </div>
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/prompt-studio">Prompt Studio</Link></li>
                        <li><Link to="/agent-studio">Agent Studio</Link></li>
                        <li><Link to="/io">Execute</Link></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Contact</h4>
                    <p>Have questions? Reach out to us.</p>
                    <a href="mailto:support@aiagentstudio.com">support@aiagentstudio.com</a>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} AI Agent Studio. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;