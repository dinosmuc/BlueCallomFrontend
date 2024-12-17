import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import Footer from '../components/Footer';

function Home() {
    return (
        <div className="page-wrapper">
            <div className="about-container">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-badge">Internal Testing Platform</div>
                    <h1 className="hero-title">
                        <span className="blue-text">BlueCallom</span> <span className="black-text">AI Testing Platform</span>
                    </h1>
                    <p className="hero-description">
                        Test and validate BlueCallom's AI agents and solutions in a controlled environment.
                        This platform helps ensure quality and reliability before production deployment.
                    </p>
                    <div className="hero-actions">
                        <Link to="/prompt-studio" className="primary-button">
                            Start Testing
                            <span className="button-glow"></span>
                        </Link>
                    </div>
                </section>

                {/* Testing Features Section */}
                <section className="features-section">
                    <h2 className="section-title">
                        Testing <span className="gradient-text">Features</span>
                    </h2>
                    <div className="features-grid">
                        <Link to="/prompt-studio" className="feature-card interactive">
                            <div className="feature-icon">🎯</div>
                            <h3>Prompt Studio</h3>
                            <p>Test and validate AI prompts in a controlled environment before production use.</p>
                            <span className="card-link">Open Studio →</span>
                        </Link>
                        <Link to="/agent-studio" className="feature-card interactive">
                            <div className="feature-icon">🤖</div>
                            <h3>Agent Studio</h3>
                            <p>Build and test AI agent behaviors in an isolated testing environment.</p>
                            <span className="card-link">Open Studio →</span>
                        </Link>
                        <Link to="/io" className="feature-card interactive">
                            <div className="feature-icon">🔄</div>
                            <h3>I/O Testing</h3>
                            <p>Validate input/output scenarios for consistent agent responses.</p>
                            <span className="card-link">Start Testing →</span>
                        </Link>
                    </div>
                </section>

                {/* Testing Process Section */}
                <section className="how-it-works glass-morphism">
                    <h2 className="section-title">
                        Testing <span className="gradient-text">Process</span>
                    </h2>
                    <div className="process-container">
                        <div className="process-step">
                            <div className="step-number">01</div>
                            <div className="step-content">
                                <h3>Create Prompts</h3>
                                <p>Design your AI prompts in our interactive Prompt Studio with real-time testing.</p>
                                <div className="step-features">
                                    <span className="feature-tag">Real-time Testing</span>
                                    <span className="feature-tag">Prompt Optimization</span>
                                </div>
                            </div>
                        </div>

                        <div className="process-step">
                            <div className="step-number">02</div>
                            <div className="step-content">
                                <h3>Build Agents</h3>
                                <p>Combine prompts into intelligent agents using our visual builder.</p>
                                <div className="step-features">
                                    <span className="feature-tag">Visual Builder</span>
                                    <span className="feature-tag">Agent Configuration</span>
                                </div>
                            </div>
                        </div>

                        <div className="process-step">
                            <div className="step-number">03</div>
                            <div className="step-content">
                                <h3>Test & Deploy</h3>
                                <p>Validate your agents through I/O testing and deploy when ready.</p>
                                <div className="step-features">
                                    <span className="feature-tag">I/O Testing</span>
                                    <span className="feature-tag">Deployment</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testing Disclaimer */}
                <section className="disclaimer-section">
                    <div className="disclaimer-content glass-morphism">
                        <h3>⚠️ Testing Environment Notice</h3>
                        <p>This is a testing platform for BlueCallom's AI solutions. All actions performed here are for testing purposes only.
                            Data and results may not reflect production environment behavior.</p>
                        <ul>
                            <li>Test environment only - not for production use</li>
                            <li>Data will be periodically reset</li>
                            <li>Performance may vary from production</li>
                        </ul>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
}

export default Home;