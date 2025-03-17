import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/login';
import Profile from './components/Profile';
import CertificateCatalog from './components/CertificateCatalog';

function App() {
    return (
        <Router>
            <div className="w-full min-h-screen">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/catalog" element={<CertificateCatalog />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;