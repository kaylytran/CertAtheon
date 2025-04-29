import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CertificateCatalog = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    const url = import.meta.env.VITE_API_BASE_URL;
    
    // Add isMounted ref to prevent state updates after unmount
    const isMounted = useRef(true);
    // Ref to track initial render
    const isInitialLoad = useRef(true);

    // State for catalog data
    const [allCertificates, setAllCertificates] = useState([]);
    const [displayedCertificates, setDisplayedCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profilePic, setProfilePic] = useState("/profile_placeholder.png");

    // State for filters
    const [filterLevel, setFilterLevel] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [availableLevels, setAvailableLevels] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    
    // Pagination state
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

    // Function to apply client-side filtering
    const applyFilters = () => {
        if (!allCertificates || allCertificates.length === 0) {
            setDisplayedCertificates([]);
            setTotalItems(0);
            return;
        }
        
        let filtered = [...allCertificates];
        
        // Apply level filter if not "all"
        if (filterLevel !== "all") {
            filtered = filtered.filter(cert => cert.certificateLevel === filterLevel);
        }
        
        // Apply category filter if not "all"
        if (filterCategory !== "all") {
            filtered = filtered.filter(cert => cert.category === filterCategory);
        }
        
        // Update total items count
        setTotalItems(filtered.length);
        
        // Calculate total pages
        const newTotalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
        setTotalPages(newTotalPages);
        
        // Adjust current page if out of bounds
        if (currentPage > newTotalPages) {
            setCurrentPage(1);
        }
        
        // Apply pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setDisplayedCertificates(filtered.slice(startIndex, endIndex));
        
        console.log(`Filtered from ${allCertificates.length} to ${filtered.length} certificates. Showing ${startIndex + 1} to ${Math.min(endIndex, filtered.length)}`);
    };

    // Fetch all certificate data at once
    const fetchAllCertificates = async () => {
        try {
            setLoading(true);
            console.log("Fetching all certificates");
            
            // Get all certificates in one go - we'll handle filtering client-side
            const response = await axios.get(`${url}/api/CertificateCatalog`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { offset: 0, limit: 1000 } // Large limit to get everything
            });
            
            if (isMounted.current) {
                const certificates = response.data.records || [];
                console.log(`Received ${certificates.length} certificates from API`);
                
                // Store the full dataset
                setAllCertificates(certificates);
                
                // Extract unique levels and categories for filter dropdowns
                const levels = [...new Set(certificates.map(cert => cert.certificateLevel))].filter(Boolean);
                const categories = [...new Set(certificates.map(cert => cert.category))].filter(Boolean);
                
                setAvailableLevels(levels);
                setAvailableCategories(categories);
                
                console.log(`Extracted ${levels.length} unique levels and ${categories.length} unique categories`);
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
    
    // Initial data load
    useEffect(() => {
        console.log("Initial data load effect");
        
        // Load profile picture
        const storedPhoto = localStorage.getItem("profilePhoto");
        if (storedPhoto) {
            setProfilePic(storedPhoto);
        } else {
            fetchProfilePicture();
        }
        
        // Fetch all certificates
        fetchAllCertificates();
        
        isInitialLoad.current = false;
    }, []);
    
    // Apply filters whenever filter criteria, pagination, or data changes
    useEffect(() => {
        console.log("Filter effect with:", filterLevel, filterCategory, currentPage, itemsPerPage);
        applyFilters();
    }, [filterLevel, filterCategory, currentPage, itemsPerPage, allCertificates]);
    
    // Handle filter changes
    const handleLevelFilterChange = (e) => {
        const newLevel = e.target.value;
        console.log("Changing level filter to:", newLevel);
        setFilterLevel(newLevel);
        setCurrentPage(1); // Reset to first page when filter changes
    };
    
    const handleCategoryFilterChange = (e) => {
        const newCategory = e.target.value;
        console.log("Changing category filter to:", newCategory);
        setFilterCategory(newCategory);
        setCurrentPage(1); // Reset to first page when filter changes
    };
    
    // Reset all filters
    const resetFilters = () => {
        console.log("Resetting all filters");
        setFilterLevel("all");
        setFilterCategory("all");
        setCurrentPage(1); // Reset to first page when filters are reset
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
        if (allCertificates.some(cert => 
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
                
                // Update the local data
                const newCert = response.data;
                setAllCertificates(prev => [...prev, newCert]);
                
                // Update filter metadata if needed
                if (newCertificate.certificateLevel && !availableLevels.includes(newCertificate.certificateLevel)) {
                    setAvailableLevels(prev => [...prev, newCertificate.certificateLevel]);
                }
                
                if (newCertificate.category && !availableCategories.includes(newCertificate.category)) {
                    setAvailableCategories(prev => [...prev, newCertificate.category]);
                }
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
                                onClick={() => {
                                    setError(null);
                                    fetchAllCertificates();
                                }}
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    
                    {/* Debug Info - uncomment if needed */}
                    {/* <div className="mb-4 p-4 bg-gray-100 text-gray-800 rounded-md text-xs">
                        <p>Filter Level: {filterLevel}</p>
                        <p>Filter Category: {filterCategory}</p>
                        <p>Total Items: {totalItems}</p>
                        <p>Current Page: {currentPage} of {totalPages}</p>
                        <p>Items Per Page: {itemsPerPage}</p>
                    </div> */}
                    
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
                                    data-testid="reset-filters-button"
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
                                    {displayedCertificates.length > 0 ? (
                                        displayedCertificates.map((certificate, index) => (
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
                            
                            {/* Pagination Controls */}
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