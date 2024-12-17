import React from 'react';
import './About.css';
import Footer from '../components/Footer';

function About() {
    return (
        <div className="page-wrapper">
            <div className="about-container">
                {/* Hero Section */}
                <section className="about-hero">
                    <span className="hero-badge">AI Testing Platform</span>
                    <div className="hero-content">
                        <h1>
                            <span className="gradient-text">BlueCallom</span> AI Lab
                        </h1>
                        <p className="hero-description">
                            Enterprise-grade development and testing environment for sophisticated AI solutions
                        </p>
                    </div>
                </section>

                {/* Core Capabilities */}
                <section className="core-capabilities">
                    <div className="section-header">
                        <h2>Core Capabilities</h2>
                        <p className="section-description">
                            Comprehensive tools and features for AI development lifecycle
                        </p>
                    </div>
                    <div className="capabilities-grid">
                        <div className="capability-card">
                            <div className="card-icon">🔧</div>
                            <h3>Advanced Prompt Engineering</h3>
                            <ul className="capability-list">
                                <li>System prompt optimization</li>
                                <li>Variable handling and chaining</li>
                                <li>Output format control</li>
                                <li>Real-time validation</li>
                            </ul>
                        </div>

                        <div className="capability-card">
                            <div className="card-icon">🤖</div>
                            <h3>Agent Development</h3>
                            <ul className="capability-list">
                                <li>Multi-step workflow creation</li>
                                <li>Agent behavior testing</li>
                                <li>Loop and conditional logic</li>
                                <li>Agent chaining capabilities</li>
                            </ul>
                        </div>

                        <div className="capability-card">
                            <div className="card-icon">🎯</div>
                            <h3>Testing & Validation</h3>
                            <ul className="capability-list">
                                <li>Input/Output verification</li>
                                <li>Edge case testing</li>
                                <li>Performance monitoring</li>
                                <li>Error handling validation</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Development Process */}
                <section className="development-process">
                    <div className="section-header">
                        <h2>Development Process</h2>
                        <p className="section-description">
                            Streamlined workflow for efficient AI development
                        </p>
                    </div>
                    <div className="process-steps">
                        <div className="process-step">
                            <div className="step-number">01</div>
                            <div className="step-content">
                                <h3>Prompt Engineering</h3>
                                <p>Design and test prompts using the Prompt Studio</p>
                                <div className="step-tags">
                                    <span>System Prompts</span>
                                    <span>Variables</span>
                                    <span>Output Control</span>
                                </div>
                            </div>
                        </div>

                        <div className="process-step">
                            <div className="step-number">02</div>
                            <div className="step-content">
                                <h3>Agent Configuration</h3>
                                <p>Build complex AI agents in the Agent Studio</p>
                                <div className="step-tags">
                                    <span>Workflows</span>
                                    <span>Logic</span>
                                    <span>Chaining</span>
                                </div>
                            </div>
                        </div>

                        <div className="process-step">
                            <div className="step-number">03</div>
                            <div className="step-content">
                                <h3>Testing & Validation</h3>
                                <p>Comprehensive testing in the I/O environment</p>
                                <div className="step-tags">
                                    <span>Verification</span>
                                    <span>Edge Cases</span>
                                    <span>Performance</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Platform Status */}
                <section className="status-section">
                    <div className="status-badge">
                        Active Development
                    </div>
                    <h2 className="status-title">Testing Environment</h2>
                    <p className="status-description">
                        Internal platform for BlueCallom's AI development team
                    </p>
                    <div className="status-grid">
                        <div className="status-card">
                            <div className="status-label">Environment</div>
                            <div className="status-value">Testing</div>
                        </div>
                        <div className="status-card">
                            <div className="status-label">Access Level</div>
                            <div className="status-value">Internal Team</div>
                        </div>
                        <div className="status-card">
                            <div className="status-label">Development</div>
                            <div className="status-value active">Active</div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
}

export default About; 