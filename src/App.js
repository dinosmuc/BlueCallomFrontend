import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PromptStudio from './pages/PromptStudio';
import AgentStudio from './pages/AgentStudio';
import IO from './pages/IO';
import Home from './pages/Home';
import About from './pages/About';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <div className="background-gradient">
          <div className="background-pattern"></div>
          <div className="background-overlay"></div>
        </div>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/prompt-studio" element={<PromptStudio />} />
            <Route path="/agent-studio" element={<AgentStudio />} />
            <Route path="/io" element={<IO />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
