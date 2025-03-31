import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Profile from './components/Profile';
import Register from './components/Register';
import CertificateCatalog from './components/CertificateCatalog';
import ChangePassword from './components/changePassword';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/catalog" element={<CertificateCatalog />} />
                <Route path="/register" element={<Register />} />
                <Route path="/changepassword" element={<ChangePassword />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;