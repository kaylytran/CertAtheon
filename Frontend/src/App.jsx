import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Home from './components/Home';
import Login from './components/Login';
import Profile from './components/Profile';
import CertificateCatalog from './components/CertificateCatalog';
<<<<<<< HEAD
import ChangePassword from './components/changePassword';
import AdminPage from './components/AdminPage';

// Configure axios to use the token with every request
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Handle authentication errors
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Unauthorized - clear storage and redirect to login
            localStorage.clear();
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);
=======
>>>>>>> 009b9306121086374f9edf64a6c8c57c401b9217

function App() {
    // Set default axios headers on app mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/catalog" element={<CertificateCatalog />} />
<<<<<<< HEAD
                <Route path="/register" element={<Register />} />
                <Route path="/changepassword" element={<ChangePassword />} />
                <Route path="/admin" element={<AdminPage />} />
=======
>>>>>>> 009b9306121086374f9edf64a6c8c57c401b9217
            </Routes>
        </BrowserRouter>
    );
}

export default App;