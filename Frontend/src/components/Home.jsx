import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
    // Simple error boundary to catch rendering errors
    const [renderError, setRenderError] = useState(null);

    try {
        const navigate = useNavigate();
        const [showAddModal, setShowAddModal] = useState(false);
        const [showEditModal, setShowEditModal] = useState(false);
        const [currentCert, setCurrentCert] = useState(null);
        const [certificateCatalog, setCertificateCatalog] = useState([]);
        const [myCertifications, setMyCertifications] = useState([]);
        const [profilePic, setProfilePic] = useState("/api/placeholder/40/40");
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [formData, setFormData] = useState({
            certification: "",
            certifiedDate: "",
            validThrough: "",
            level: ""
        });
        
        // Add isMounted ref to prevent state updates after unmount
        const isMounted = useRef(true);
        
        // Pagination state
        const [currentPage, setCurrentPage] = useState(1);
        const [itemsPerPage, setItemsPerPage] = useState(5);
        const [totalPages, setTotalPages] = useState(1);

        const url = import.meta.env.VITE_API_BASE_URL;
        // Simplify token retrieval to use whatever is in localStorage
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');

        // Mock user info from localStorage
        const userInfo = {
            firstName: localStorage.getItem('firstName') || 'User',
            lastName: localStorage.getItem('lastName') || '',
            userRole: localStorage.getItem('userRole') || 'User',
            userId: localStorage.getItem('userId') || '',
            email: localStorage.getItem('email') || '',
        };

        // Debug authentication
        useEffect(() => {
            console.log("Home component mounted");
            console.log("Token in localStorage:", !!token);
            console.log("User info:", userInfo);
            
            // Set default authorization header for all requests
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
        }, [token]);

        // Set isMounted to false when component unmounts
        useEffect(() => {
            return () => {
                isMounted.current = false;
            };
        }, []);

        // Navigate to home
        const navigateToHome = () => {
            navigate('/home');
        };

        // Navigate to profile
        const navigateToProfile = () => {
            navigate('/profile');
        };

        // Handle logout
        const handleLogout = () => {
            localStorage.clear();
            navigate('/');
        };
        
        // Calculate pagination values whenever certifications data changes
        useEffect(() => {
            if (isMounted.current) {
                const newTotalPages = Math.ceil(myCertifications.length / itemsPerPage) || 1;
                setTotalPages(newTotalPages);
                
                // Reset to first page when data changes and current page is out of bounds
                if (currentPage > newTotalPages) {
                    setCurrentPage(1);
                }
            }
        }, [myCertifications, itemsPerPage, currentPage]);
        
        // Get current items for pagination
        const getCurrentItems = () => {
            if (!myCertifications || myCertifications.length === 0) {
                return [];
            }
            const indexOfLastItem = currentPage * itemsPerPage;
            const indexOfFirstItem = indexOfLastItem - itemsPerPage;
            return myCertifications.slice(indexOfFirstItem, indexOfLastItem);
        };
        
        // Handle page change
        const handlePageChange = (pageNumber) => {
            setCurrentPage(pageNumber);
        };
        
        // Handle items per page change
        const handleItemsPerPageChange = (e) => {
            const value = parseInt(e.target.value);
            setItemsPerPage(value);
            setCurrentPage(1); // Reset to first page when changing items per page
        };

        // Format display date - fixes the T00:00:00 issue
        const formatDisplayDate = (dateString) => {
            if (!dateString) return "N/A";
            
            // If the date has a 'T' time component, remove it
            if (dateString.includes('T')) {
                return dateString.split('T')[0];
            }
            
            return dateString;
        };

        // Enhanced fetchCertificates function with multiple endpoint attempts
        const fetchCertificates = async () => {
            if (!token) {
                setError("Authentication failed. Please log in again.");
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                console.log("Fetching certificates with token:", token);
                
                // Try multiple possible API endpoints
                let response = null;
                let errorMessages = [];
                
                // First attempt - standard endpoint
                try {
                    response = await axios.get(`${url}/api/Certificates`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log("Standard endpoint response:", response);
                } catch (err) {
                    console.warn("Standard endpoint failed:", err.message);
                    errorMessages.push(`Standard endpoint: ${err.message}`);
                }
                
                // Second attempt - user-specific endpoint
                if (!response) {
                    try {
                        const userId = localStorage.getItem('userId');
                        if (userId) {
                            console.log("Trying user-specific endpoint with userId:", userId);
                            
                            response = await axios.get(`${url}/api/Certificates/user/${userId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            console.log("User-specific endpoint response:", response);
                        }
                    } catch (err) {
                        console.warn("User-specific endpoint failed:", err.message);
                        errorMessages.push(`User endpoint: ${err.message}`);
                    }
                }
                
                // Third attempt - employee endpoint
                if (!response) {
                    try {
                        response = await axios.get(`${url}/api/Certificates/employee`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        console.log("Employee endpoint response:", response);
                    } catch (err) {
                        console.warn("Employee endpoint failed:", err.message);
                        errorMessages.push(`Employee endpoint: ${err.message}`);
                    }
                }
                
                // Fourth attempt - email-based endpoint
                if (!response) {
                    try {
                        const email = localStorage.getItem('email');
                        if (email) {
                            console.log("Trying email-based endpoint with email:", email);
                            response = await axios.get(`${url}/api/Certificates/email/${encodeURIComponent(email)}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            console.log("Email-based endpoint response:", response);
                        }
                    } catch (err) {
                        console.warn("Email-based endpoint failed:", err.message);
                        errorMessages.push(`Email endpoint: ${err.message}`);
                    }
                }
                
                if (!response) {
                    throw new Error(`All certificate retrieval attempts failed: ${errorMessages.join(', ')}`);
                }
                
                if (isMounted.current) {
                    console.log("Final certificates API response:", response.data);
                    
                    // Process certificates - handle various response formats
                    let certificationsData;
                    
                    if (Array.isArray(response.data)) {
                        certificationsData = response.data;
                    } else if (response.data && typeof response.data === 'object') {
                        // Handle various possible response structures
                        certificationsData = response.data.certificates || 
                                            response.data.items || 
                                            response.data.records || 
                                            response.data.results || 
                                            response.data.data ||
                                            [];
                    } else {
                        certificationsData = [];
                    }
                    
                    // Create a Map to deduplicate certificates by ID
                    const uniqueCertificatesMap = new Map();
                    
                    if (Array.isArray(certificationsData)) {
                        // Process each certificate and only keep unique ones by ID
                        certificationsData.forEach(cert => {
                            if (cert && cert.id) {
                                uniqueCertificatesMap.set(cert.id, cert);
                            }
                        });
                    }
                    
                    // Convert the Map back to an array
                    const uniqueCertificates = Array.from(uniqueCertificatesMap.values());
                    
                    console.log("Unique certifications loaded:", uniqueCertificates.length);
                    console.log("Certificate data:", uniqueCertificates);
                    
                    setMyCertifications(uniqueCertificates);
                }
            } catch (err) {
                console.error("Error fetching certifications:", err);
                
                // More detailed error logging
                if (err.response) {
                    console.error("Response status:", err.response.status);
                    console.error("Response data:", err.response.data);
                }
                
                if (isMounted.current) {
                    if (err.response && err.response.status === 401) {
                        setError("Authentication failed. Please log in again.");
                    } else {
                        setError(`Failed to load your certifications: ${err.message}`);
                    }
                }
            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        const fetchCertificateCatalog = async () => {
            if (!token) return;
            
            try {
                const response = await axios.get(`${url}/api/CertificateCatalog`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (isMounted.current) {
                    const data = response.data;
                    console.log("Certificate Catalog API response:", data);
                    
                    // Safely handle different data structures
                    if (Array.isArray(data)) {
                        setCertificateCatalog(data);
                        console.log("Certificate Catalog loaded:", data.length, "entries");
                    } else {
                        console.error("Unexpected API response structure:", data);
                        setCertificateCatalog([]);
                    }
                }
            } catch (err) {
                console.error("Error fetching certificate catalog:", err);
                if (err.response) {
                    console.error("Response status:", err.response.status);
                    console.error("Response data:", err.response.data);
                }
            }
        };

        const fetchProfilePicture = async () => {
            if (!token) return;
            
            try {
                const response = await axios.get(`${url}/api/Profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (isMounted.current) {
                    const imageUrl = response.data?.profilePictureUrl;
                    if (imageUrl) {
                        const fullUrl = imageUrl.startsWith("http")
                            ? imageUrl
                            : `${url}/${imageUrl.replace(/^\/+/, "")}`;
                        setProfilePic(fullUrl);
                        localStorage.setItem("profilePictureUrl", fullUrl);
                    }
                }
            } catch (err) {
                console.error("Error fetching profile picture:", err);
            }
        };

        // Fetch data on component mount
        useEffect(() => {
            const cachedPic = localStorage.getItem("profilePictureUrl");
            if (cachedPic) {
                setProfilePic(cachedPic);
            } else {
                fetchProfilePicture();
            }

            fetchCertificates();
            fetchCertificateCatalog();
        }, [token, url]);

        const handleInputChange = (e) => {
            const { name, value } = e.target;

            // If the certification dropdown is changed, update the level automatically
            if (name === "certification") {
                const selectedCert = certificateCatalog.find(
                    (cert) => (cert.certificationName === value || cert.certificateName === value)
                );
                setFormData({
                    ...formData,
                    certification: value,
                    level: selectedCert ? (selectedCert.level || selectedCert.certificateLevel) : ""
                });
            } else {
                setFormData({
                    ...formData,
                    [name]: value
                });
            }
        };

        // Enhanced handleAddNewSubmit function that tries multiple API endpoints
        const handleAddNewSubmit = async (e) => {
            e.preventDefault();

            // Find the selected certificate in the catalog
            const selectedCert = certificateCatalog.find(
                (cert) => (cert.certificationName === formData.certification || cert.certificateName === formData.certification)
            );

            if (!selectedCert) {
                alert("Please select a valid certificate.");
                return;
            }

            // Check if this certificate already exists to prevent duplicates
            const existingCert = myCertifications.find(cert => 
                cert.certificateName === selectedCert.certificateName || 
                cert.certificateName === selectedCert.certificationName
            );
            
            if (existingCert) {
                if (!window.confirm("You already have this certificate in your list. Do you want to add it again?")) {
                    return;
                }
            }
            
            // Format dates properly
            let certDate, validDate, formattedCertDate, formattedValidDate;
            
            try {
                certDate = new Date(formData.certifiedDate);
                validDate = new Date(formData.validThrough);
                
                // Format dates as yyyy-MM-dd
                formattedCertDate = certDate.toISOString().split('T')[0];
                formattedValidDate = validDate.toISOString().split('T')[0];
            } catch (error) {
                console.error("Date parsing error:", error);
                // Use original values if parsing fails
                formattedCertDate = formData.certifiedDate;
                formattedValidDate = formData.validThrough;
            }
            
            // Prepare multiple payload formats to handle different API expectations
            const payloads = [
                // Format 1: Standard format
                {
                    certificateCatalogId: selectedCert.id,
                    certifiedDate: formattedCertDate,
                    validTill: formattedValidDate,
                    certificateLevel: formData.level
                },
                // Format 2: Alternative property names
                {
                    certificateId: selectedCert.id,
                    certifiedDate: formattedCertDate,
                    expiryDate: formattedValidDate,
                    level: formData.level,
                    certificateName: selectedCert.certificateName || selectedCert.certificationName
                },
                // Format 3: With additional user information
                {
                    userId: userInfo.userId,
                    certificateCatalogId: selectedCert.id,
                    certifiedDate: formattedCertDate,
                    validTill: formattedValidDate,
                    certificateLevel: formData.level,
                    certificateName: selectedCert.certificateName || selectedCert.certificationName
                }
            ];

            setLoading(true);
            
            // Try multiple endpoints with different payload formats
            const endpoints = [
                `${url}/api/Certificates/add`,
                `${url}/api/Certificates`,
            ];
            
            let success = false;
            let errorMessages = [];
            
            for (let i = 0; i < endpoints.length && !success; i++) {
                const endpoint = endpoints[i];
                
                for (let j = 0; j < payloads.length && !success; j++) {
                    const payload = payloads[j];
                    
                    try {
                        console.log(`Trying endpoint ${endpoint} with payload:`, payload);
                        
                        const response = await axios.post(endpoint, payload, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        
                        console.log(`Success with endpoint ${endpoint}:`, response.data);
                        success = true;
                        
                        // Remember successful endpoint and payload format for future use
                        localStorage.setItem('successfulCertEndpoint', endpoint);
                        localStorage.setItem('successfulCertPayloadFormat', j.toString());
                    } catch (err) {
                        console.warn(`Failed with endpoint ${endpoint}:`, err.message);
                        errorMessages.push(`${endpoint}: ${err.message}`);
                    }
                }
            }
            
            if (success) {
                alert("Certificate added successfully!");
                setShowAddModal(false);
                setFormData({
                    certification: "",
                    certifiedDate: "",
                    validThrough: "",
                    level: "",
                });
                
                // Fetch updated certificates with increased delay
                setTimeout(() => {
                    fetchCertificates();
                }, 1500); // Longer delay to ensure server processes the addition
            } else {
                alert(`Failed to add certificate. Errors: ${errorMessages.join(', ')}`);
            }
            
            setLoading(false);
        };

        const handleEditSubmit = async (e) => {
            e.preventDefault();

            if (!currentCert || !currentCert.id) {
                alert("Error: Missing certificate information. Please try again.");
                return;
            }

            // Format dates properly
            let certDate, validDate, formattedCertDate, formattedValidDate;
            
            try {
                certDate = new Date(formData.certifiedDate);
                validDate = new Date(formData.validThrough);
                
                // Format dates as yyyy-MM-dd
                formattedCertDate = certDate.toISOString().split('T')[0];
                formattedValidDate = validDate.toISOString().split('T')[0];
            } catch (error) {
                console.error("Date parsing error:", error);
                // Use original values if parsing fails
                formattedCertDate = formData.certifiedDate;
                formattedValidDate = formData.validThrough;
            }

            // Prepare the payload for the PUT request - try multiple formats
            const payloads = [
                // Format 1: Standard format
                {
                    certificateCatalogId: currentCert.certificateCatalogId,
                    certifiedDate: formattedCertDate,
                    validTill: formattedValidDate,
                    certificateLevel: formData.level
                },
                // Format 2: Alternative property names
                {
                    id: currentCert.id,
                    certificateId: currentCert.certificateCatalogId,
                    certifiedDate: formattedCertDate,
                    expiryDate: formattedValidDate,
                    level: formData.level
                }
            ];

            try {
                setLoading(true);
                let success = false;
                
                // Try each payload format
                for (let i = 0; i < payloads.length && !success; i++) {
                    try {
                        await axios.put(`${url}/api/Certificates/${currentCert.id}`, payloads[i], {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        success = true;
                    } catch (err) {
                        console.warn(`Error with payload format ${i}:`, err);
                        if (i === payloads.length - 1) {
                            throw err; // Re-throw the last error if all attempts fail
                        }
                    }
                }

                if (isMounted.current) {
                    alert("Certificate updated successfully!");
                    setShowEditModal(false);
                    setCurrentCert(null);
        
                    // Refresh the certificates with a delay
                    setTimeout(() => {
                        fetchCertificates();
                    }, 1000);
                }
            } catch (err) {
                console.error("Error updating certificate:", err);
                if (isMounted.current) {
                    alert("Failed to update certificate: " + (err.response?.data?.message || err.message));
                    setLoading(false);
                }
            }
        };

        // Improved certificate deletion function
        const handleDeleteCert = async (certId) => {
            if (!certId) {
                console.error("Invalid certificate ID for deletion");
                alert("Error: Certificate ID is missing");
                return;
            }
            
            console.log("Attempting to delete certificate with ID:", certId);
            
            if (window.confirm("Are you sure you want to delete this certification?")) {
                try {
                    setLoading(true);
                    
                    // Make the API call to delete the specific certificate by ID
                    const response = await axios.delete(`${url}/api/Certificates/${certId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    
                    console.log("Delete response:", response);
                    
                    // Check if the deletion was successful
                    if (response.status === 200 || response.status === 204) {
                        alert("Certificate deleted successfully!");
                        
                        // Immediately update the local state to remove only the deleted certificate
                        setMyCertifications(prevCerts => 
                            prevCerts.filter(cert => cert.id !== certId)
                        );
                        
                        // Also fetch fresh data from the server to ensure consistency
                        setTimeout(() => {
                            fetchCertificates();
                        }, 1000);
                    } else {
                        console.error("Unexpected delete response:", response);
                        alert("The server returned an unexpected response. The certificate may not have been deleted.");
                    }
                } catch (err) {
                    console.error("Error deleting certificate:", err);
                    
                    // Log detailed error information
                    if (err.response) {
                        console.error("Status:", err.response.status);
                        console.error("Response data:", err.response.data);
                    }
                    
                    alert("Failed to delete certificate: " + (err.response?.data?.message || err.message));
                } finally {
                    if (isMounted.current) {
                        setLoading(false);
                    }
                }
            }
        };

        // Debug token and refresh function
        const debugTokenAndRefresh = () => {
            console.log("=== Authentication Debug Info ===");
            
            // Log all relevant localStorage items
            const tokenKeys = ['token', 'authToken', 'accessToken', 'jwtToken'];
            tokenKeys.forEach(key => {
                const value = localStorage.getItem(key);
                console.log(`${key}: ${value ? "Present" : "Missing"}`);
            });
            
            // Log other relevant user data
            console.log("userId:", localStorage.getItem('userId'));
            console.log("email:", localStorage.getItem('email'));
            console.log("firstName:", localStorage.getItem('firstName'));
            console.log("lastName:", localStorage.getItem('lastName'));
            
            // Attempt to refresh authentication
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            if (token) {
                // Update axios default headers
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                console.log("Updated axios default headers with token");
            }
            
            // Fetch certificates again
            fetchCertificates();
        };

        const Modal = ({ isOpen, onClose, title, onSubmit, children }) => {
            if (!isOpen) return null;
            return (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                        <h2 className="text-xl font-semibold mb-4">{title}</h2>
                        <form onSubmit={onSubmit}>
                            {children}
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        };

        const CertificationForm = ({ isEdit }) => (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate</label>
                    {isEdit ? (
                        // Make the certificate name read-only for editing
                        <input
                            type="text"
                            name="certification"
                            value={formData.certification}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                        />
                    ) : (
                        // Allow selecting a certificate when adding a new one
                        <select
                            name="certification"
                            value={formData.certification}
                            onChange={(e) => {
                                const selectedCertName = e.target.value;

                                // Find the selected certificate and update the level
                                const selectedCert = certificateCatalog.find(
                                    (cert) => (cert.certificateName === selectedCertName || cert.certificationName === selectedCertName)
                                );

                                setFormData({
                                    ...formData,
                                    certification: selectedCertName,
                                    level: selectedCert ? (selectedCert.certificateLevel || selectedCert.level) : "",
                                    certificateCatalogId: selectedCert ? selectedCert.id : null, // Store the certificate ID
                                });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        >
                            <option value="">Select Certificate</option>
                            {certificateCatalog && certificateCatalog.map((cert, index) => (
                                <option key={cert.id || index} value={cert.certificateName || cert.certificationName}>
                                    {cert.certificateName || cert.certificationName}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certified Date</label>
                    <input
                        type="date"
                        name="certifiedDate"
                        value={formData.certifiedDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid Through</label>
                    <input
                        type="date"
                        name="validThrough"
                        value={formData.validThrough}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Level</label>
                    <input
                        type="text"
                        name="level"
                        value={formData.level}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                </div>
            </div>
        );

        const RetryButton = () => (
            <button 
                className="mt-2 bg-red-600 text-white px-4 py-1 rounded text-sm"
                onClick={() => {
                    setError(null);
                    setLoading(true);
                    // Force a refresh of certifications data
                    fetchCertificates();
                }}
            >
                Retry
            </button>
        );

        console.log("About to render Home component");

        return (
            <div className="min-h-screen w-full bg-gray-100">
                {/* Header */}
                <header className="bg-blue-600 w-full p-4 flex justify-between items-center">
                    <div className="flex space-x-2">
                        <button
                            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                            onClick={navigateToHome}
                        >
                            Home
                        </button>
                        <button
                            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                            onClick={() => navigate('/catalog')}
                        >
                            Catalog
                        </button>
                        {userInfo.userRole === "Manager" && (
                            <button
                                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                                onClick={() => navigate('/admin')}
                            >
                                Admin Dashboard
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-white">
                        <img
                            src={profilePic}
                            alt="User Avatar"
                            className="rounded-full w-10 h-10 cursor-pointer"
                            onClick={navigateToProfile}
                        />
                            <span>{userInfo.firstName} {userInfo.lastName}</span>
                        </div>
                        <button
                            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="px-4 py-8 mx-auto max-w-7xl">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">My Certifications</h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Add New Certificate
                                </button>
                                {/* Debug button - uncomment for troubleshooting */}
                                {/*
                                <button
                                    onClick={debugTokenAndRefresh}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Debug Auth
                                </button>
                                */}
                            </div>
                        </div>

                        {/* Error Message Display */}
                        {error && (
                            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                                <p>{error}</p>
                                <RetryButton />
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <p className="text-gray-500">Loading your certifications...</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-blue-600 text-white">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                    Certification
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                    Certified Date
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                    Certificate Level
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                    Expiry Date
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {/* Only show items with certification dates to filter out "potential" certificates */}
                                            {getCurrentItems().filter(cert => cert?.certifiedDate).length > 0 ? (
                                                getCurrentItems()
                                                .filter(cert => cert?.certifiedDate)
                                                .map((cert, index) => (
                                                    <tr key={cert?.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                                                        {/* Certification Name */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {cert?.certificateName || "N/A"}
                                                        </td>

                                                        {/* Certified Date - Using the formatter */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDisplayDate(cert?.certifiedDate)}
                                                        </td>

                                                        {/* Certificate Level */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {cert?.certificateLevel || 
                                                                (cert?.certificateCatalogId && certificateCatalog?.find((catalogCert) => 
                                                                    catalogCert?.id === cert?.certificateCatalogId)?.certificateLevel) || "N/A"}
                                                        </td>

                                                        {/* Expiry Date - Using the formatter */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDisplayDate(cert?.validTill || cert?.expiryDate)}
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => {
                                                                    console.log("Edit cert:", cert);
                                                                    // Set the current certificate and populate the form data for editing
                                                                    setCurrentCert(cert);
                                                                    setFormData({
                                                                        certification: cert?.certificateName || "", // Use certificateName directly
                                                                        certifiedDate: formatDisplayDate(cert?.certifiedDate) || "",
                                                                        validThrough: formatDisplayDate(cert?.validTill || cert?.expiryDate) || "",
                                                                        level: cert?.certificateLevel || "",
                                                                    });
                                                                    setShowEditModal(true); // Open the edit modal
                                                                }}
                                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    console.log("Delete cert:", cert);
                                                                    handleDeleteCert(cert.id);
                                                                }}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No certifications found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Pagination Controls */}
                                {myCertifications.filter(cert => cert?.certifiedDate).length > 0 && (
                                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                        <div className="flex-1 flex justify-between sm:hidden">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                                    currentPage === 1
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-white text-gray-700 hover:bg-gray-50"
                                                }`}
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                                    currentPage === totalPages
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-white text-gray-700 hover:bg-gray-50"
                                                }`}
                                            >
                                                Next
                                            </button>
                                        </div>
                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    Showing <span className="font-medium">
                                                    {myCertifications.filter(cert => cert?.certifiedDate).length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                                                    </span> to{" "}
                                                    <span className="font-medium">
                                                    {Math.min(currentPage * itemsPerPage, myCertifications.filter(cert => cert?.certifiedDate).length)}
                                                    </span> of{" "}
                                                    <span className="font-medium">{myCertifications.filter(cert => cert?.certifiedDate).length}</span> results
                                                </p>
                                            </div>
                                            <div className="flex items-center">
                                                <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-600">Show</label>
                                                <select
                                                    id="itemsPerPage"
                                                    value={itemsPerPage}
                                                    onChange={handleItemsPerPageChange}
                                                    className="mr-4 px-2 py-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                >
                                                    <option value={5}>5</option>
                                                    <option value={10}>10</option>
                                                    <option value={15}>15</option>
                                                    <option value={20}>20</option>
                                                    <option value={25}>25</option>
                                                </select>
                                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                    <button
                                                        onClick={() => handlePageChange(1)}
                                                        disabled={currentPage === 1}
                                                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                                            currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        <span className="sr-only">First</span>
                                                        <span>First</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                                            currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        <span className="sr-only">Previous</span>
                                                        <span>Prev</span>
                                                    </button>
                                                    
                                                    {/* Page Number Buttons */}
                                                    {[...Array(totalPages).keys()].map((number) => {
                                                        const pageNumber = number + 1;
                                                        // Show current page, and at most 2 pages on either side
                                                        if (
                                                            pageNumber === 1 || 
                                                            pageNumber === totalPages || 
                                                            (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                                                        ) {
                                                            return (
                                                                <button
                                                                    key={pageNumber}
                                                                    onClick={() => handlePageChange(pageNumber)}
                                                                    className={`relative inline-flex items-center px-4 py-2 border ${
                                                                        currentPage === pageNumber
                                                                        ? "bg-blue-50 border-blue-500 text-blue-600 z-10"
                                                                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                                    } text-sm font-medium`}
                                                                >
                                                                    {pageNumber}
                                                                </button>
                                                            );
                                                        } else if (
                                                            (pageNumber === currentPage - 3 && currentPage > 3) || 
                                                            (pageNumber === currentPage + 3 && currentPage < totalPages - 2)
                                                        ) {
                                                            // Add ellipsis
                                                            return (
                                                                <span
                                                                    key={pageNumber}
                                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700"
                                                                >
                                                                    ...
                                                                </span>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                    
                                                    <button
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                                            currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        <span className="sr-only">Next</span>
                                                        <span>Next</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handlePageChange(totalPages)}
                                                        disabled={currentPage === totalPages}
                                                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                                            currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        <span className="sr-only">Last</span>
                                                        <span>Last</span>
                                                    </button>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                {/* Add Certificate Modal */}
                <Modal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    title="Add New Certificate"
                    onSubmit={handleAddNewSubmit}
                >
                    <CertificationForm isEdit={false} />
                </Modal>

                {/* Edit Certificate Modal */}
                <Modal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    title="Edit Certificate"
                    onSubmit={handleEditSubmit}
                >
                    <CertificationForm isEdit={true} />
                </Modal>
            </div>
        );
    } catch (error) {
        // This will catch any errors during rendering
        console.error("Error rendering Home component:", error);
        setRenderError(error.toString());
        
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-lg">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Home Page</h2>
                    <p className="mb-4">There was an error rendering the page:</p>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                        {error.toString()}
                    </pre>
                    <button 
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '/';
                        }}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }
};

export default Home;