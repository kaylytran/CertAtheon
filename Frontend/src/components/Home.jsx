import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentCert, setCurrentCert] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userRole, setUserRole] = useState('');
    const [myCertifications, setMyCertifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        certification: "",
        category: "DevOps",
        level: "",
        description: "Software Dev",
        certifiedDate: new Date().toISOString().split('T')[0],
        validThrough: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0]
    });

    const url = 'http://localhost:5282';

    // Debug function for user data
    const debugUserInfo = () => {
        console.group("User Info Debug");
        console.log("firstName from state:", firstName);
        console.log("lastName from state:", lastName);
        console.log("userRole from state:", userRole);
        console.log("localStorage firstName:", localStorage.getItem('firstName'));
        console.log("localStorage lastName:", localStorage.getItem('lastName'));
        console.log("localStorage userRole:", localStorage.getItem('userRole'));
        console.log("localStorage appRole:", localStorage.getItem('appRole'));
        console.log("localStorage email:", localStorage.getItem('email'));

        try {
            const authStr = localStorage.getItem('authResponse');
            if (authStr) {
                const auth = JSON.parse(authStr);
                console.log("authResponse object:", auth);
            }
        } catch (err) {
            console.error("Error parsing authResponse:", err);
        }
        console.groupEnd();
    };

    // Get user information from localStorage
    useEffect(() => {
        // Run debugging on mount
        debugUserInfo();

        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const token = localStorage.getItem('token');

        if (!isLoggedIn || !token) {
            navigate('/');
            return;
        }

        // Load user data - DIRECT assignment, not setState
        const storedFirstName = localStorage.getItem('firstName');
        const storedLastName = localStorage.getItem('lastName');

        // Check which role field is available - 'userRole' or 'appRole'
        let role = localStorage.getItem('userRole');
        if (!role || role === 'null') {
            role = localStorage.getItem('appRole');
        }

        // Try to get values from authResponse as a fallback
        try {
            const authResponseStr = localStorage.getItem('authResponse');
            if (authResponseStr) {
                const authResponse = JSON.parse(authResponseStr);

                // Set states only if we have real values
                if (storedFirstName) {
                    setFirstName(storedFirstName);
                } else if (authResponse.firstName) {
                    setFirstName(authResponse.firstName);
                }

                if (storedLastName) {
                    setLastName(storedLastName);
                } else if (authResponse.lastName) {
                    setLastName(authResponse.lastName);
                }

                // Get role from authResponse if not found in localStorage
                if (!role && authResponse.appRole) {
                    role = authResponse.appRole;
                }
            }
        } catch (err) {
            console.error("Error parsing authResponse:", err);
        }

        // Finally set the role state
        if (role) {
            setUserRole(role);
        }

        // Fetch user's certifications
        fetchMyCertifications();

        // Log debug info again after setting state
        setTimeout(debugUserInfo, 1000);
    }, [navigate]);

    // Process certificate data to handle various API response formats
    const processCertificateData = (certificates) => {
        // Make sure we have an array to work with
        if (!Array.isArray(certificates)) {
            certificates = [certificates].filter(Boolean);
        }

        return certificates.map(cert => {
            // Check if we have a certificate catalog embedded
            const catalog = cert.certificateCatalog || {};

            // Create a properly structured certificate object
            return {
                id: cert.id || 0,
                // Try to get name from various possible locations
                name: catalog.certificateName || cert.certificateName || cert.name || 'Unknown Certificate',
                // Try to get level from various possible locations
                level: catalog.certificateLevel || cert.certificateLevel || cert.level || '-',
                certifiedDate: cert.certifiedDate || cert.validFrom || '',
                expiryDate: cert.expiryDate || cert.validTill || cert.validThrough || '',
                // Store the catalog ID for edit operations
                certificateCatalogId: cert.certificationId || catalog.id || 0,
                // Include any other relevant fields
                description: catalog.description || cert.description || '',
                category: catalog.category || cert.category || '',
                // Include certificate catalog reference
                certificateCatalog: catalog
            };
        });
    };

    // Fetch the current user's certifications
    const fetchMyCertifications = async () => {
        try {
            setLoading(true);

            // Get user information for authentication
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn("No authentication token found");
                setLoading(false);
                return;
            }

            // Configure headers with authentication token
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    expand: true  // Request expanded certificate data with catalog info
                }
            };

            // Try to get user certificates from the Certificates endpoint
            let response;
            try {
                response = await axios.get(`${url}/api/Certificates`, config);
                console.log("API response:", response);
            } catch (err) {
                console.error("Error fetching certificates:", err);
                // Try alternative endpoint
                try {
                    response = await axios.get(`${url}/api/Certificates/1`, config);
                    // If this is a single certificate, wrap it in an array
                    if (response.data && !Array.isArray(response.data)) {
                        response.data = [response.data];
                    }
                } catch (secondErr) {
                    console.error("All certificate fetch attempts failed:", secondErr);
                    setMyCertifications([]);
                    setLoading(false);
                    return;
                }
            }

            // Process the certificate data from API response
            if (response && response.data) {
                const processedCertificates = processCertificateData(response.data);
                console.log("Processed certificates:", processedCertificates);
                setMyCertifications(processedCertificates);
            } else {
                setMyCertifications([]);
            }

            setLoading(false);
        } catch (err) {
            console.error("Error in certificate fetching:", err);
            setMyCertifications([]);
            setLoading(false);
        }
    };

    // Handle adding a new certificate
    const handleAddCertificate = async (e) => {
        e.preventDefault();

        try {
            // Get token for authorization
            const token = localStorage.getItem('token');
            if (!token) {
                alert("You must be logged in to add certificates");
                return;
            }

            // Configure authorization header
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            // Format request body according to API requirements
            const catalogData = {
                certificateName: formData.certification,
                category: formData.category || "DevOps",
                certificateLevel: formData.level,
                description: formData.description || "Software Dev"
            };

            console.log("Attempting to add certificate catalog:", catalogData);

            // First try to find an existing catalog entry
            try {
                const catalogsResponse = await axios.get(`${url}/api/CertificateCatalog`, config);
                console.log("Available catalogs:", catalogsResponse.data);

                const existingCatalog = catalogsResponse.data.find(
                    cat => cat.certificateName === catalogData.certificateName &&
                        cat.certificateLevel === catalogData.certificateLevel
                );

                let catalogId;
                if (existingCatalog) {
                    console.log("Using existing catalog:", existingCatalog);
                    catalogId = existingCatalog.id;
                } else {
                    // Try to create a new catalog
                    try {
                        const newCatalogResponse = await axios.post(
                            `${url}/api/CertificateCatalog/add`,
                            catalogData,
                            config
                        );
                        console.log("New catalog created:", newCatalogResponse.data);
                        catalogId = newCatalogResponse.data.id;
                    } catch (catalogError) {
                        console.error("Failed to create catalog:", catalogError);
                        if (catalogError.response?.status === 400) {
                            alert("Invalid certificate data. Please check the information and try again.");
                        } else {
                            alert("Failed to create certificate catalog: " +
                                (catalogError.response?.data?.message || catalogError.message || "Unknown error"));
                        }
                        return;
                    }
                }

                // Now add the user certificate
                if (catalogId) {
                    // FIX: Ensure dates are properly formatted for the API
                    // Create the date objects with a time of 12:00 noon to avoid timezone issues
                    const certifiedDateObj = new Date(formData.certifiedDate);
                    certifiedDateObj.setHours(12, 0, 0, 0);

                    const validThroughObj = new Date(formData.validThrough);
                    validThroughObj.setHours(12, 0, 0, 0);

                    // Format the dates in ISO format
                    const certifiedDateFormatted = certifiedDateObj.toISOString();
                    const expiryDateFormatted = validThroughObj.toISOString();

                    // Create the user certificate with the proper data format
                    const userCertData = {
                        certificationId: catalogId,
                        certifiedDate: certifiedDateFormatted,
                        expiryDate: expiryDateFormatted
                    };

                    console.log("Adding user certificate with formatted dates:", userCertData);

                    try {
                        // Add user certificate
                        const certResponse = await axios.post(
                            `${url}/api/Certificates/add`,
                            userCertData,
                            config
                        );

                        console.log("Certificate added successfully:", certResponse.data);

                        // Refresh the certificates list
                        fetchMyCertifications();
                        alert("Certificate added successfully!");
                        setShowAddModal(false);
                    } catch (certError) {
                        console.error("Failed to add certificate:", certError);

                        if (certError.response?.status === 400) {
                            alert("Invalid certificate data. The API rejected the request. Please check the dates and try again.");
                        } else {
                            alert("Failed to add certificate: " +
                                (certError.response?.data?.message || certError.message || "Unknown error"));
                        }
                    }
                }
            } catch (err) {
                console.error("Error getting certificate catalogs:", err);
                alert("Failed to get certificate catalogs: " + (err.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Error in add certificate process:", err);
            alert("Failed to add certificate: " + (err.response?.data?.message || err.message || "Unknown error"));
        }
    };

    const handleEditCertificate = async (e) => {
        e.preventDefault();

        if (!currentCert) {
            alert("No certificate selected for editing");
            return;
        }

        try {
            // Get token for authorization
            const token = localStorage.getItem('token');
            if (!token) {
                alert("You must be logged in to edit certificates");
                return;
            }

            // Configure authorization header
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            // FIX: Ensure dates are properly formatted for the API
            // Create the date objects with a time of 12:00 noon to avoid timezone issues
            const certifiedDateObj = new Date(formData.certifiedDate);
            certifiedDateObj.setHours(12, 0, 0, 0);

            const validThroughObj = new Date(formData.validThrough);
            validThroughObj.setHours(12, 0, 0, 0);

            // Format the dates in ISO format
            const certifiedDateFormatted = certifiedDateObj.toISOString();
            const expiryDateFormatted = validThroughObj.toISOString();

            // Update certificate data with properly formatted dates
            const updateData = {
                id: currentCert.id,
                certificationId: currentCert.certificateCatalogId,
                certifiedDate: certifiedDateFormatted,
                expiryDate: expiryDateFormatted
            };

            console.log("Updating certificate with data:", updateData);

            // Use the API endpoint for updating certificates
            try {
                const response = await axios.put(
                    `${url}/api/Certificates/${currentCert.id}`,
                    updateData,
                    config
                );

                console.log("Certificate updated successfully:", response.data);

                // Refresh the certificates list
                fetchMyCertifications();
                alert("Certificate updated successfully!");
                setShowEditModal(false);
            } catch (err) {
                console.error("Error updating certificate:", err);

                if (err.response?.status === 400) {
                    alert("Invalid certificate data. The API rejected the request. Please check the dates and try again.");
                } else if (err.response?.status === 403) {
                    alert("You don't have permission to update certificates. Please contact an administrator.");
                } else {
                    alert("Failed to update certificate: " + (err.response?.data?.message || err.message || "Unknown error"));
                }

                setShowEditModal(false);
            }
        } catch (err) {
            console.error("Error in edit certificate process:", err);
            alert("Failed to update certificate: " + (err.response?.data?.message || err.message || "Unknown error"));
        }
    };

    // Check if user is admin or manager - more robust check
    const isAdminOrManager = () => {
        // First check state
        if (userRole === 'Manager' || userRole === 'Admin') {
            return true;
        }

        // Then check localStorage directly (both fields)
        const storedRole = localStorage.getItem('userRole');
        const storedAppRole = localStorage.getItem('appRole');

        if (storedRole === 'Manager' || storedRole === 'Admin' ||
            storedAppRole === 'Manager' || storedAppRole === 'Admin') {
            return true;
        }

        // Finally check authResponse
        try {
            const authResponseStr = localStorage.getItem('authResponse');
            if (authResponseStr) {
                const authResponse = JSON.parse(authResponseStr);
                if (authResponse.appRole === 'Manager' || authResponse.appRole === 'Admin') {
                    return true;
                }
            }
        } catch (err) {
            console.error("Error checking admin status:", err);
        }

        return false;
    };

    // Add this function to determine if the user can edit certificates
    const canEditCertificates = () => {
        // Check user role
        const storedRole = localStorage.getItem('userRole');
        const storedAppRole = localStorage.getItem('appRole');

        // Only Managers and Admins can edit certificates
        return storedRole === 'Manager' || storedRole === 'Admin' ||
            storedAppRole === 'Manager' || storedAppRole === 'Admin' ||
            userRole === 'Manager' || userRole === 'Admin';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddNew = () => {
        setFormData({
            certification: "",
            category: "DevOps",
            level: "",
            description: "Software Dev",
            certifiedDate: new Date().toISOString().split('T')[0],
            validThrough: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0]
        });
        setShowAddModal(true);
    };

    const navigateToProfile = () => {
        navigate('/profile');
    };

    const navigateToCatalog = () => {
        navigate('/catalog');
    };

    const navigateToAdmin = () => {
        navigate('/admin');
    };

    const navigateToEmployees = () => {
        navigate('/admin');
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    // Improved date formatter that handles invalid dates gracefully
    const formatDate = (dateString) => {
        if (!dateString) return "-";

        try {
            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return "-";
            }
            return date.toLocaleDateString();
        } catch (err) {
            console.error("Error formatting date:", err);
            return "-";
        }
    };

    // Improved certificate status calculator
    const getCertificateStatus = (expiryDate) => {
        // If no expiry date is provided
        if (!expiryDate) {
            return { status: 'Not Set', className: 'bg-gray-100 text-gray-800' };
        }

        // Try to parse the date, handling various formats
        let expiry;
        try {
            // Handle ISO date format or other string formats
            expiry = new Date(expiryDate);

            // Check if the date is valid
            if (isNaN(expiry.getTime())) {
                return { status: 'Invalid Date', className: 'bg-gray-100 text-gray-800' };
            }
        } catch (err) {
            console.error("Error parsing expiry date:", err);
            return { status: 'Invalid Date', className: 'bg-gray-100 text-gray-800' };
        }

        // Calculate days until expiry
        const today = new Date();
        const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) {
            return { status: 'Expired', className: 'bg-red-100 text-red-800' };
        } else if (daysUntilExpiry < 30) {
            return { status: 'Expiring Soon', className: 'bg-yellow-100 text-yellow-800' };
        } else {
            return { status: 'Valid', className: 'bg-green-100 text-green-800' };
        }
    };

    // Get a user display name with fallbacks
    const getUserDisplayName = () => {
        if (firstName && lastName) {
            return `${firstName} ${lastName}`;
        } else if (firstName) {
            return firstName;
        } else if (lastName) {
            return lastName;
        }

        // Check localStorage directly as a fallback
        const storedFirstName = localStorage.getItem('firstName');
        const storedLastName = localStorage.getItem('lastName');

        if (storedFirstName && storedLastName) {
            return `${storedFirstName} ${storedLastName}`;
        } else if (storedFirstName) {
            return storedFirstName;
        } else if (storedLastName) {
            return storedLastName;
        }

        // Last fallback - use email or just "User"
        return localStorage.getItem('email') || 'User';
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

    const CertificationForm = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Name</label>
                <input
                    type="text"
                    name="certification"
                    value={formData.certification}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                    name="category"
                    value={formData.category || "DevOps"}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                >
                    <option value="DevOps">DevOps</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Security">Security</option>
                    <option value="Development">Development</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Level</label>
                <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                >
                    <option value="">Select Level</option>
                    <option value="Fundamental">Fundamental</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                    <option value="Associate">Associate</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    name="description"
                    value={formData.description || "Software Dev"}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="2"
                />
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
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-gray-100">
            {/* Header */}
            <header className="bg-blue-600 w-full p-4 flex justify-between items-center">
                <div className="flex space-x-2">
                    <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">
                        Home
                    </button>
                    <button
                        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                        onClick={navigateToCatalog}
                    >
                        Certificate Catalog
                    </button>
                    {/* Add Employees tab for admin/manager */}
                    {isAdminOrManager() && (
                        <button
                            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                            onClick={navigateToEmployees}
                        >
                            Employees
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white">
                        <img
                            src="/api/placeholder/40/40"
                            alt="User Avatar"
                            className="rounded-full w-10 h-10 cursor-pointer"
                            onClick={navigateToProfile}
                        />
                        <span>{getUserDisplayName()}</span>
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
                        {canEditCertificates() ? (
                            <button
                                onClick={handleAddNew}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Add New Certificate
                            </button>
                        ) : (
                            <button
                                disabled
                                className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
                                title="Contact an administrator to add certificates"
                            >
                                Add New Certificate
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <p className="text-gray-500">Loading your certifications...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Certification
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Certified Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Certificate Level
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Expiry Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {myCertifications.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No certifications found. Add a new certification to get started.
                                                </td>
                                            </tr>
                                        ) : (
                                            myCertifications.map((cert) => {
                                                const status = getCertificateStatus(cert.expiryDate);
                                                return (
                                                    <tr key={cert.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {cert.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(cert.certifiedDate)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {cert.level || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(cert.expiryDate)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${status.className}`}>
                                                                {status.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            {/* Only show Edit button if user has permission */}
                                                            {canEditCertificates() ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setCurrentCert(cert);
                                                                        setFormData({
                                                                            certification: cert.name,
                                                                            certifiedDate: cert.certifiedDate ? new Date(cert.certifiedDate).toISOString().split('T')[0] : '',
                                                                            validThrough: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '',
                                                                            level: cert.level || '',
                                                                            category: cert.category || 'DevOps',
                                                                            description: cert.description || 'Software Dev'
                                                                        });
                                                                        setShowEditModal(true);
                                                                    }}
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    Edit
                                                                </button>
                                                            ) : (
                                                                <span className="text-gray-400">View Only</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Certificate Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Certificate"
                onSubmit={handleAddCertificate}
            >
                <CertificationForm />
            </Modal>

            {/* Edit Certificate Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Certificate"
                onSubmit={handleEditCertificate}
            >
                <CertificationForm />
            </Modal>
        </div>
    );
};

export default Home;