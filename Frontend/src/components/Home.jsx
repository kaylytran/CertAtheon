import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from 'dayjs';

const Home = () => {
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentCert, setCurrentCert] = useState(null);
    const [certificateCatalog, setCertificateCatalog] = useState([]);
    const [myCertifications, setMyCertifications] = useState([]);
    const [profilePic, setProfilePic] = useState("/profile_placeholder.png");
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
    const token = localStorage.getItem('token');

    // Mock user info from localStorage
    const userInfo = {
        firstName: localStorage.getItem('firstName') || 'User',
        lastName: localStorage.getItem('lastName') || '',
        userRole: localStorage.getItem('userRole') || 'User',
    };

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

    // Fetch user's certifications on page load
    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${url}/api/Certificates`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (isMounted.current) {
                    // Process unique certifications
                    const uniqueCertifications = {};
                    const certificationsData = response.data || [];
                    
                    certificationsData.forEach(cert => {
                        const key = cert.id || `${cert.certificateName}-${cert.certifiedDate}`;
                        if (!uniqueCertifications[key]) {
                            uniqueCertifications[key] = cert;
                        }
                    });
                    
                    const uniqueCertificationsList = Object.values(uniqueCertifications);
                    setMyCertifications(uniqueCertificationsList);
                    
                    console.log("Certifications loaded:", uniqueCertificationsList.length, "unique certifications");
                }
            } catch (err) {
                console.error("Error fetching certifications:", err);
                if (isMounted.current) {
                    setError("Failed to load your certifications. Please try again later.");
                }
            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        const fetchCertificateCatalog = async () => {
            try {
                const response = await axios.get(`${url}/api/CertificateCatalog`);
                
                if (isMounted.current) {
                    const data = response.data;
                    
                    // Process unique catalog entries
                    const uniqueCatalogEntries = {};
                    if (Array.isArray(data)) {
                        data.forEach(cert => {
                            const key = cert.id || cert.certificateName;
                            if (!uniqueCatalogEntries[key]) {
                                uniqueCatalogEntries[key] = cert;
                            }
                        });
                        
                        const uniqueCatalogList = Object.values(uniqueCatalogEntries);
                        setCertificateCatalog(uniqueCatalogList);
                        
                        console.log("Certificate Catalog loaded:", uniqueCatalogList.length, "unique entries");
                    } else {
                        console.error("Unexpected API response structure:", data);
                        setCertificateCatalog([]);
                    }
                }
            } catch (err) {
                console.error("Error fetching certificate catalog:", err);
                if (isMounted.current) {
                    setError("Failed to load certificate catalog. Some features may be limited.");
                }
            }
        };

        const fetchProfilePicture = async () => {
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
                (cert) => cert.certificationName === value
            );
            setFormData({
                ...formData,
                certification: value,
                level: selectedCert ? selectedCert.level : ""
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleAddNewSubmit = async (e) => {
        e.preventDefault();

        // Find the selected certificate in the catalog
        const selectedCert = certificateCatalog.find(
            (cert) => cert.certificateName === formData.certification
        );

        if (!selectedCert) {
            alert("Please select a valid certificate.");
            return;
        }

        // Prepare the payload for the POST request
        const payload = {
            certificateCatalogId: selectedCert.id,
            certifiedDate: formData.certifiedDate,
            validTill: formData.validThrough,
        };

        try {
            setLoading(true);
            // Send the POST request
            await axios.post(`${url}/api/Certificates/add`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (isMounted.current) {
                alert("Certificate added successfully!");
                setShowAddModal(false);
    
                // Reset the form data
                setFormData({
                    certification: "",
                    certifiedDate: "",
                    validThrough: "",
                    level: "",
                });
    
                // Refresh the certifications list
                const response = await axios.get(`${url}/api/Certificates`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                // Process unique certifications after adding new one
                const uniqueCertifications = {};
                const certificationsData = response.data || [];
                
                certificationsData.forEach(cert => {
                    const key = cert.id || `${cert.certificateName}-${cert.certifiedDate}`;
                    if (!uniqueCertifications[key]) {
                        uniqueCertifications[key] = cert;
                    }
                });
                
                const uniqueCertificationsList = Object.values(uniqueCertifications);
                setMyCertifications(uniqueCertificationsList);
                
                setCurrentPage(1); // Reset to first page after adding
            }
        } catch (err) {
            console.error("Error adding certificate:", err);
            if (isMounted.current) {
                alert("Failed to add certificate: " + (err.response?.data?.message || err.message));
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        // Prepare the payload for the PUT request
        const payload = {
            certificateCatalogId: currentCert.certificateCatalogId, // Use the existing certificate ID
            certifiedDate: formData.certifiedDate,
            validTill: formData.validThrough,
        };

        try {
            setLoading(true);
            
            // Send the PUT request
            await axios.put(`${url}/api/Certificates/${currentCert.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (isMounted.current) {
                alert("Certificate updated successfully!");
                setShowEditModal(false);
                setCurrentCert(null);
    
                // Refresh the certifications list
                const response = await axios.get(`${url}/api/Certificates`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                // Process unique certifications after update
                const uniqueCertifications = {};
                const certificationsData = response.data || [];
                
                certificationsData.forEach(cert => {
                    const key = cert.id || `${cert.certificateName}-${cert.certifiedDate}`;
                    if (!uniqueCertifications[key]) {
                        uniqueCertifications[key] = cert;
                    }
                });
                
                const uniqueCertificationsList = Object.values(uniqueCertifications);
                setMyCertifications(uniqueCertificationsList);
            }
        } catch (err) {
            console.error("Error updating certificate:", err);
            if (isMounted.current) {
                alert("Failed to update certificate: " + (err.response?.data?.message || err.message));
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    const handleDeleteCert = async (certId) => {
        if (window.confirm("Are you sure you want to delete this certification?")) {
            try {
                setLoading(true);
                
                await axios.delete(`${url}/api/Certificates/${certId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (isMounted.current) {
                    alert("Certification deleted successfully!");
    
                    // Refresh the certifications list
                    const response = await axios.get(`${url}/api/Certificates`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    
                    // Process unique certifications after deletion
                    const uniqueCertifications = {};
                    const certificationsData = response.data || [];
                    
                    certificationsData.forEach(cert => {
                        const key = cert.id || `${cert.certificateName}-${cert.certifiedDate}`;
                        if (!uniqueCertifications[key]) {
                            uniqueCertifications[key] = cert;
                        }
                    });
                    
                    const uniqueCertificationsList = Object.values(uniqueCertifications);
                    setMyCertifications(uniqueCertificationsList);
                    
                    // If we're on a page that no longer exists, go to the last page
                    const newTotalPages = Math.ceil(uniqueCertificationsList.length / itemsPerPage);
                    if (currentPage > newTotalPages && newTotalPages > 0) {
                        setCurrentPage(newTotalPages);
                    }
                }
            } catch (err) {
                console.error("Error deleting certification:", err);
                if (isMounted.current) {
                    alert("Failed to delete certification: " + (err.response?.data?.message || err.message));
                }
            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        }
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
                                (cert) => cert.certificateName === selectedCertName
                            );

                            setFormData({
                                ...formData,
                                certification: selectedCertName,
                                level: selectedCert ? selectedCert.certificateLevel : "",
                                certificateCatalogId: selectedCert ? selectedCert.id : null, // Store the certificate ID
                            });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    >
                        <option value="">Select Certificate</option>
                        {certificateCatalog.map((cert, index) => (
                            <option key={cert.id || index} value={cert.certificateName}>
                                {cert.certificateName}
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
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Add New Certificate
                        </button>
                    </div>

                    {/* Error Message Display */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                            <p>{error}</p>
                            <button 
                                className="mt-2 bg-red-600 text-white px-4 py-1 rounded text-sm"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </button>
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
                                        {getCurrentItems().length > 0 ? (
                                            getCurrentItems().map((cert, index) => (
                                                <tr key={cert.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                                                    {/* Certification Name */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {cert.certificateName || "N/A"}
                                                    </td>

                                                    {/* Certified Date */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {cert.certifiedDate ? dayjs(cert.certifiedDate).format('MMMM D, YYYY') : "N/A"}
                                                    </td>

                                                    {/* Certificate Level */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {
                                                            certificateCatalog.find((catalogCert) => catalogCert.certificateName === cert.certificateName)
                                                                ?.certificateLevel || "N/A"
                                                        }
                                                    </td>

                                                    {/* Expiry Date */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {cert.validTill ? dayjs(cert.validTill).format('MMMM D, YYYY') : "N/A"}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => {
                                                                // Set the current certificate and populate the form data for editing
                                                                setCurrentCert(cert);
                                                                setFormData({
                                                                    certification: cert.certificateName, // Use certificateName directly
                                                                    certifiedDate: cert.certifiedDate,
                                                                    validThrough: cert.validTill,
                                                                    level: cert.certificateLevel,
                                                                });
                                                                setShowEditModal(true); // Open the edit modal
                                                            }}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCert(cert.id)}
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
                            {myCertifications.length > 0 && (
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
                                                  {myCertifications.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                                                </span> to{" "}
                                                <span className="font-medium">
                                                  {Math.min(currentPage * itemsPerPage, myCertifications.length)}
                                                </span> of{" "}
                                                <span className="font-medium">{myCertifications.length}</span> results
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
};

export default Home;