import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CertificateCatalog = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    const url = import.meta.env.VITE_API_BASE_URL;
    
    // Add isMounted ref to prevent state updates after unmount
    const isMounted = useRef(true);

    // State for catalog data
    const [catalogData, setCatalogData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profilePic, setProfilePic] = useState("/profile_placeholder.png");

    // State for filters
    const [filterLevel, setFilterLevel] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [availableLevels, setAvailableLevels] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    
    // Server-side pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // State for modal
    const [showModal, setShowModal] = useState(false);
    const [newCertificate, setNewCertificate] = useState({
        certificateName: "",
        category: "",
        certificateLevel: "",
        description: "",
    });

    // Valid certificate levels
    const validCertificateLevels = ["Fundamental", "Advanced", "Expert", "Professional", "Specialist"];
    
    // Valid certificate categories
    const validCategories = ["DevOps", "Software Dev", "Cloud", "Security", "Data", "AI/ML", "Networking"];
    
    // Form validation errors
    const [validationErrors, setValidationErrors] = useState({
        certificateName: "",
        category: "",
        certificateLevel: "",
        description: ""
    });

    // Set isMounted to false when component unmounts
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Update effect to calculate total pages whenever totalItems or itemsPerPage changes
    useEffect(() => {
        if (isMounted.current) {
            const newTotalPages = Math.ceil(totalItems / itemsPerPage) || 1;
            setTotalPages(newTotalPages);
            
            // Reset to first page when items per page changes and current page is out of bounds
            if (currentPage > newTotalPages) {
                setCurrentPage(1);
            }
        }
    }, [totalItems, itemsPerPage, currentPage]);

    // Fetch metadata for filters - we'll make a separate call to get all available levels and categories
    const fetchFilterMetadata = async () => {
        try {
            // This endpoint would ideally return just the metadata (levels and categories)
            // If such an endpoint doesn't exist, your backend team should consider adding one
            const response = await axios.get(`${url}/api/CertificateCatalog/metadata`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (isMounted.current && response.data) {
                const levels = response.data.levels || [];
                const categories = response.data.categories || [];
                
                setAvailableLevels(levels.filter(Boolean));
                setAvailableCategories(categories.filter(Boolean));
            }
        } catch (err) {
            console.error("Error fetching filter metadata:", err);
            // Fallback: If metadata endpoint doesn't exist, use the regular endpoint
            try {
                const fallbackResponse = await axios.get(`${url}/api/CertificateCatalog`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (isMounted.current && fallbackResponse.data?.records) {
                    const certificates = fallbackResponse.data.records;
                    
                    // Extract unique levels and categories for filter dropdowns
                    const levels = [...new Set(certificates.map(cert => cert.certificateLevel))];
                    const categories = [...new Set(certificates.map(cert => cert.category))];
                    
                    setAvailableLevels(levels.filter(Boolean));
                    setAvailableCategories(categories.filter(Boolean));
                }
            } catch (fallbackErr) {
                console.error("Error fetching filter metadata (fallback):", fallbackErr);
            }
        }
    };

    // Updated fetchCatalogData function to use server-side pagination and filtering
    const fetchCatalogData = async () => {
        try {
            setLoading(true);
            
            // Calculate offset based on current page and items per page
            const offset = (currentPage - 1) * itemsPerPage;
            
            // Prepare query parameters for pagination
            const params = {
                offset: offset,
                limit: itemsPerPage
            };
            
            // Add filter parameters if not "all"
            // Note: Assuming your backend API supports these filter parameters
            if (filterLevel !== "all") {
                params.certificateLevel = filterLevel;
            }
            
            if (filterCategory !== "all") {
                params.category = filterCategory;
            }
            
            // Make API request with pagination and filter parameters
            const response = await axios.get(`${url}/api/CertificateCatalog`, {
                headers: { Authorization: `Bearer ${token}` },
                params: params
            });
            
            if (isMounted.current) {
                const certificates = response.data.records || [];
                
                // Assuming the API returns total count in the response
                // If it doesn't, you'll need to implement a way to get the total count
                const totalCount = response.data.totalCount || certificates.length;
                
                setCatalogData(certificates);
                setTotalItems(totalCount);
                
                console.log(
                    "Catalog data loaded:",
                    certificates.length,
                    "items of",
                    totalCount,
                    "total matching certificates"
                );
            }
        } catch (err) {
            console.error("Error fetching certificate catalog:", err);
            if (isMounted.current) {
                setError("Failed to load certificate catalog");
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };
    
    const fetchProfilePicture = async () => {
        try {
            const response = await axios.get(`${url}/api/Profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (isMounted.current) {
                const imageUrl = response.data?.profilePictureUrl;
                if (imageUrl) {
                    const fullUrl = imageUrl.startsWith("http")
                        ? imageUrl
                        : `${url}/${imageUrl.replace(/^\/+/, "")}`;
                    setProfilePic(fullUrl);
                    localStorage.setItem("profilePhoto", fullUrl);
                }
            }
        } catch (err) {
            console.error("Error fetching profile picture:", err);
        }
    };
    
    // Load initial data
    useEffect(() => {
        const storedPhoto = localStorage.getItem("profilePhoto");
        if (storedPhoto) {
            setProfilePic(storedPhoto);
        } else {
            fetchProfilePicture();
        }
        
        // Fetch filter metadata only once on component mount
        fetchFilterMetadata();
    }, [token, url]);
    
    // Fetch catalog data whenever pagination or filters change
    useEffect(() => {
        fetchCatalogData();
    }, [currentPage, itemsPerPage, filterLevel, filterCategory]);
    
    // Handle filter changes
    const handleLevelFilterChange = (e) => {
        setFilterLevel(e.target.value);
        setCurrentPage(1); // Reset to first page when filter changes
    };
    
    const handleCategoryFilterChange = (e) => {
        setFilterCategory(e.target.value);
        setCurrentPage(1); // Reset to first page when filter changes
    };
    
    // Reset all filters
    const resetFilters = () => {
        setFilterLevel("all");
        setFilterCategory("all");
        setCurrentPage(1); // Reset to first page when filters are reset
    };
    
    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // fetchCatalogData is called automatically via the useEffect
    };
    
    // Handle items per page change
    const handleItemsPerPageChange = (e) => {
        const value = parseInt(e.target.value);
        setItemsPerPage(value);
        setCurrentPage(1); // Reset to first page when changing items per page
        // fetchCatalogData is called automatically via the useEffect
    };

    // Handle input changes in the modal with validation
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCertificate((prev) => ({
            ...prev,
            [name]: value,
        }));
        
        // Clear validation error when field is modified
        if (validationErrors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: ""
            });
        }
    };
    
    // Validate the form input
    const validateCertificateForm = () => {
        const errors = {
            certificateName: "",
            category: "",
            certificateLevel: "",
            description: ""
        };
        let isValid = true;
        
        // Certificate name validation
        if (newCertificate.certificateName.length < 3) {
            errors.certificateName = "Certificate name must be at least 3 characters long";
            isValid = false;
        } else if (newCertificate.certificateName.length > 100) {
            errors.certificateName = "Certificate name cannot exceed 100 characters";
            isValid = false;
        }
        
        // Check for duplicate certificate name
        if (catalogData.some(cert => 
            cert.certificateName.toLowerCase() === newCertificate.certificateName.toLowerCase()
        )) {
            errors.certificateName = "A certificate with this name already exists";
            isValid = false;
        }
        
        // Category validation
        if (newCertificate.category.length < 2) {
            errors.category = "Category must be at least 2 characters long";
            isValid = false;
        } else if (!validCategories.includes(newCertificate.category) && 
                   !availableCategories.includes(newCertificate.category)) {
            errors.category = "Please use a valid category or choose from the dropdown";
            isValid = false;
        }
        
        // Certificate level validation
        if (!validCertificateLevels.includes(newCertificate.certificateLevel) &&
            !availableLevels.includes(newCertificate.certificateLevel)) {
            errors.certificateLevel = "Please enter a valid level: Fundamental, Advanced, Expert, Professional, or Specialist";
            isValid = false;
        }
        
        // Description validation
        if (newCertificate.description.length < 10) {
            errors.description = "Description must be at least 10 characters long";
            isValid = false;
        } else if (newCertificate.description.length > 500) {
            errors.description = "Description cannot exceed 500 characters";
            isValid = false;
        }
        
        setValidationErrors(errors);
        return isValid;
    };

    // Handle form submission to add a new certificate
    const handleAddCertificate = async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateCertificateForm()) {
            return; // Stop submission if validation fails
        }
        
        try {
            setLoading(true);
            const response = await axios.post(
                `${url}/api/CertificateCatalog/add`,
                newCertificate,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (isMounted.current) {
                alert("Certificate added successfully!");
                
                // Close the modal and reset form
                setShowModal(false);
                setNewCertificate({
                    certificateName: "",
                    category: "",
                    certificateLevel: "",
                    description: "",
                });
                
                // Update filter metadata if needed
                if (!availableLevels.includes(response.data.certificateLevel)) {
                    setAvailableLevels([...availableLevels, response.data.certificateLevel].filter(Boolean));
                }
                
                if (!availableCategories.includes(response.data.category)) {
                    setAvailableCategories([...availableCategories, response.data.category].filter(Boolean));
                }
                
                // Refresh catalog data to show the new certificate
                fetchCatalogData();
            }
        } catch (err) {
            console.error("Error adding certificate:", err);
            alert("Failed to add certificate: " + (err.response?.data?.message || err.message));
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    // Navigation functions
    const navigateToHome = () => navigate("/home");
    const navigateToDashboard = () => navigate("/home");
    const navigateToProfile = () => navigate("/profile");

    // Get user info from localStorage
    const userInfo = {
        firstName: localStorage.getItem("firstName") || "User",
        lastName: localStorage.getItem("lastName") || "",
        profilePhoto: localStorage.getItem("profilePhoto") || "/profile_placeholder.png",
        userRole: localStorage.getItem("userRole") || "User",
    };

    return (
        <div className="min-h-screen w-full bg-gray-100">
            {/* Header */}
            <header className="bg-blue-600 w-full p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <button
                        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                        onClick={navigateToHome}
                    >
                        Home
                    </button>
                    {userInfo.userRole !== "Employee" && (
                        <button
                            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                            onClick={navigateToDashboard}
                        >
                            Dashboard
                        </button>
                    )}
                    <button
                        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                    >
                        Catalog
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white">
                        <img
                            src={profilePic}
                            alt="User Avatar"
                            className="rounded-full w-10 h-10 object-cover cursor-pointer"
                            onClick={navigateToProfile}
                        />
                        <span>{userInfo.firstName} {userInfo.lastName}</span>
                    </div>
                    <button
                        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                        onClick={() => navigate("/")}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Certificate Catalogue</h1>
                        {userInfo.userRole === "Manager" && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Add Certificate Catalogue
                            </button>
                        )}
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
                    
                    {/* Filters Section */}
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-4 mb-4">
                            {/* Certificate Level Filter */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Certificate Level
                                </label>
                                <select
                                    value={filterLevel}
                                    onChange={handleLevelFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="all">All Levels</option>
                                    {availableLevels.map(level => (
                                        <option key={level} value={level}>
                                            {level}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Certificate Category Filter */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    value={filterCategory}
                                    onChange={handleCategoryFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="all">All Categories</option>
                                    {availableCategories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Reset Filters Button */}
                            <div className="flex items-end">
                                <button
                                    onClick={resetFilters}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <p className="text-gray-500">Loading certificate catalog...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-blue-500">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Certificate Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Expertise
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Description
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {catalogData.length > 0 ? (
                                        catalogData.map((certificate, index) => (
                                            <tr key={certificate.id || index} className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {certificate.certificateName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {certificate.certificateLevel}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {certificate.category}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {certificate.description}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                                {filterLevel !== "all" || filterCategory !== "all" 
                                                    ? "No certificates match the selected filters" 
                                                    : "No certificates available in the catalog"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            
                            {/* Pagination Controls - Updated for server-side pagination */}
                            {totalItems > 0 && (
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
                                                  {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                                                </span> to{" "}
                                                <span className="font-medium">
                                                  {Math.min(currentPage * itemsPerPage, totalItems)}
                                                </span> of{" "}
                                                <span className="font-medium">{totalItems}</span> results
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
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Add New Certificate</h2>
                        <form onSubmit={handleAddCertificate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Name</label>
                                    <input
                                        type="text"
                                        name="certificateName"
                                        value={newCertificate.certificateName}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-md ${
                                            validationErrors.certificateName ? "border-red-500" : "border-gray-300"
                                        }`}
                                        required
                                    />
                                    {validationErrors.certificateName && (
                                        <p className="text-red-500 text-xs mt-1">{validationErrors.certificateName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        name="category"
                                        value={newCertificate.category}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-md ${
                                            validationErrors.category ? "border-red-500" : "border-gray-300"
                                        }`}
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {[...new Set([...validCategories, ...availableCategories])].map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.category && (
                                        <p className="text-red-500 text-xs mt-1">{validationErrors.category}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Level</label>
                                    <select
                                        name="certificateLevel"
                                        value={newCertificate.certificateLevel}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-md ${
                                            validationErrors.certificateLevel ? "border-red-500" : "border-gray-300"
                                        }`}
                                        required
                                    >
                                        <option value="">Select a level</option>
                                        {[...new Set([...validCertificateLevels, ...availableLevels])].map(level => (
                                            <option key={level} value={level}>
                                                {level}
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.certificateLevel && (
                                        <p className="text-red-500 text-xs mt-1">{validationErrors.certificateLevel}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={newCertificate.description}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-md ${
                                            validationErrors.description ? "border-red-500" : "border-gray-300"
                                        }`}
                                        required
                                        rows="4"
                                    />
                                    {validationErrors.description && (
                                        <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
                                    )}
                                    <p className="text-gray-500 text-xs mt-1">
                                        {newCertificate.description.length}/500 characters
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Add Certificate
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CertificateCatalog;