import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from 'dayjs';


const AdminPage = () => {
    const navigate = useNavigate();
    const url = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");

    // State Variables
    const [employees, setEmployees] = useState([]); // Original employee data
    const [filteredEmployees, setFilteredEmployees] = useState([]); // Filtered employee data
    const [searchQuery, setSearchQuery] = useState(""); // Search query
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [employeesWithCertificate, setEmployeesWithCertificate] = useState(0);
    const [profilePic, setProfilePic] = useState("/profile_placeholder.png");
    const [overallAdoptionRate, setOverallAdoptionRate] = useState(0);
    const [year, setYear] = useState("2025"); // Default year is 2025
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [showCertFeedModal, setShowCertFeedModal] = useState(false);
    const [certFeedFile, setCertFeedFile] = useState(null);
    
    // Track if component is mounted to prevent state updates after unmount
    const isMounted = useRef(true);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    
    const [newEmployeeData, setNewEmployeeData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        grade: "default",
        phoneNumber: "1234567890",
        jobTitle: "Developer",
    });
    const userInfo = {
        firstName: localStorage.getItem('firstName') || 'User',
        lastName: localStorage.getItem('lastName') || '',
        userRole: localStorage.getItem('userRole') || 'User',
    };

    // Set isMounted to false when component unmounts
    useEffect(() => {
        const fetchProfilePicture = async () => {
            try {
                const response = await axios.get(`${url}/api/Profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const imageUrl = response.data?.profilePictureUrl;
                if (imageUrl) {
                    const fullUrl = imageUrl.startsWith("http")
                        ? imageUrl
                        : `${url}/${imageUrl.replace(/^\/+/, "")}`;
                    setProfilePic(fullUrl);
                    localStorage.setItem("profilePhoto", fullUrl);
                }
            } catch (err) {
                console.error("Error fetching profile picture:", err);
            }
        };
    
        const cachedPhoto = localStorage.getItem("profilePhoto");
        if (cachedPhoto) {
            setProfilePic(cachedPhoto);
        } else {
            fetchProfilePicture();
        }
    
        return () => {
            isMounted.current = false;
        };
    }, [token, url]);    

    // Fetch Dashboard Data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${url}/api/Dashboard?year=${year}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Only update state if component is still mounted
                if (isMounted.current) {
                    const dashboardData = response.data || {};
                    setTotalEmployees(dashboardData.totalEmployees || 0);
                    setEmployeesWithCertificate(dashboardData.employeesWithCertificate || 0);
                    setOverallAdoptionRate(dashboardData.overallAdoptionRate || 0);
                    const employeeData = dashboardData.records || [];
                    
                    // Process and filter unique employees
                    const uniqueEmployees = {};
                    employeeData.forEach(employee => {
                        // Use employeeId as the unique key, or a combination of fields
                        const key = employee.employeeId || `${employee.fullName}-${employee.email}`;
                        if (!uniqueEmployees[key]) {
                            uniqueEmployees[key] = employee;
                        }
                    });

                    const uniqueEmployeesList = Object.values(uniqueEmployees);
                    
                    // Store original data
                    setEmployees(uniqueEmployeesList);
                    // Initialize filtered data with all employees
                    setFilteredEmployees(uniqueEmployeesList);
                    // Clear search
                    setSearchQuery("");
                    console.log("Data loaded:", uniqueEmployeesList.length, "unique employees");
                }
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
                if (isMounted.current) {
                    setError("Failed to load dashboard data.");
                    setEmployees([]);
                    setFilteredEmployees([]);
                }
            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        fetchDashboardData();
    }, [year, token, url]);
    
    // Calculate pagination values whenever filtered data changes
    useEffect(() => {
        if (isMounted.current) {
            const newTotalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
            setTotalPages(newTotalPages);
            
            // Reset to first page when filters change and current page is out of bounds
            if (currentPage > newTotalPages) {
                setCurrentPage(1);
            }
        }
    }, [filteredEmployees, itemsPerPage, currentPage]);
    
    // Handle search input change
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        // If search is cleared, reset to show all employees
        if (!value || value.trim() === "") {
            setFilteredEmployees([...employees]);
        }
    };

    // Ultra-reliable search function that works for all cases
    const applySearch = () => {
        console.log("Applying search for:", searchQuery);
        console.log("Total employees:", employees.length);
        
        // If search is empty, show all employees
        if (!searchQuery || searchQuery.trim() === "") {
            console.log("Empty search, showing all employees");
            setFilteredEmployees([...employees]);
            return;
        }
        
        // Create new array for filtered results
        const results = [];
        const query = searchQuery.toLowerCase().trim();
        
        // Manual loop through employees for maximum reliability
        for (let i = 0; i < employees.length; i++) {
            const employee = employees[i];
            
            // Skip if employee is invalid or has no name
            if (!employee || !employee.fullName) {
                continue;
            }
            
            const fullName = employee.fullName.toLowerCase();
            
            // Add employee to results if name contains search query
            if (fullName.indexOf(query) !== -1) {
                results.push(employee);
            }
        }
        
        console.log("Search results:", results.length);
        console.log("Results:", results.map(e => e.fullName));
        
        // Update filtered employees with new results array
        setFilteredEmployees(results);
        setCurrentPage(1); // Reset to first page after search
    };
    
    // Handle Enter key press in search input
    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            applySearch();
        }
    };
    
    // Get current items for pagination
    const getCurrentItems = () => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
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

    // Input handler for new employee form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployeeData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Add new employee
    const handleAddEmployee = async (e) => {
        e.preventDefault();

        const { firstName, lastName, email, password } = newEmployeeData;
        
        // Name validation
        if (firstName.length < 2 || firstName.length > 50) {
            alert("First name must be between 2 and 50 characters.");
            return;
        }
        
        if (lastName.length < 2 || lastName.length > 50) {
            alert("Last name must be between 2 and 50 characters.");
            return;
        }
        
        // Check for numbers or special characters in names
        const nameRegex = /^[A-Za-z\s-']+$/;
        if (!nameRegex.test(firstName)) {
            alert("First name should only contain letters, spaces, hyphens, or apostrophes.");
            return;
        }
        
        if (!nameRegex.test(lastName)) {
            alert("Last name should only contain letters, spaces, hyphens, or apostrophes.");
            return;
        }
        
        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Password validation
        if (password.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }
        
        const hasNonAlphanumeric = /[^a-zA-Z0-9]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);

        if (!hasNonAlphanumeric) {
            alert("Password must have at least one non-alphanumeric character.");
            return;
        }
        if (!hasDigit) {
            alert("Password must have at least one digit ('0'-'9').");
            return;
        }
        if (!hasUppercase) {
            alert("Password must have at least one uppercase letter ('A'-'Z').");
            return;
        }
        if (!hasLowercase) {
            alert("Password must have at least one lowercase letter ('a'-'z').");
            return;
        }

        try {
            await axios.post(`${url}/api/Auth/register`, newEmployeeData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Employee added successfully!");
            setShowAddModal(false);

            // Refresh the dashboard data
            const response = await axios.get(`${url}/api/Dashboard?year=${year}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (isMounted.current) {
                const dashboardData = response.data || {};
                const employeeData = dashboardData.records || [];
                
                // Process unique employees after adding new one
                const uniqueEmployees = {};
                employeeData.forEach(employee => {
                    const key = employee.employeeId || `${employee.fullName}-${employee.email}`;
                    if (!uniqueEmployees[key]) {
                        uniqueEmployees[key] = employee;
                    }
                });
                
                const uniqueEmployeesList = Object.values(uniqueEmployees);
                
                setEmployees(uniqueEmployeesList);
                setFilteredEmployees(uniqueEmployeesList);
                setCurrentPage(1); // Reset to first page after adding new employee
            }
        } catch (err) {
            console.error("Error adding employee:", err);
            alert("Failed to add employee.");
        }
    };

    // Handle year submission
    const handleYearSubmit = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${url}/api/Dashboard?year=${year}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (isMounted.current) {
                const dashboardData = response.data || {};
                setTotalEmployees(dashboardData.totalEmployees || 0);
                setEmployeesWithCertificate(dashboardData.employeesWithCertificate || 0);
                setOverallAdoptionRate(dashboardData.overallAdoptionRate || 0);
                const employeeData = dashboardData.records || [];
                
                // Process unique employees after year change
                const uniqueEmployees = {};
                employeeData.forEach(employee => {
                    const key = employee.employeeId || `${employee.fullName}-${employee.email}`;
                    if (!uniqueEmployees[key]) {
                        uniqueEmployees[key] = employee;
                    }
                });
                
                const uniqueEmployeesList = Object.values(uniqueEmployees);
                
                // Reset everything related to search and set original data
                setEmployees(uniqueEmployeesList);
                setFilteredEmployees(uniqueEmployeesList);
                setSearchQuery(""); // Clear search input
                setCurrentPage(1); // Reset to first page
                
                console.log("Data reset after year change:", uniqueEmployeesList.length, "unique employees");
            }
        } catch (err) {
            console.error("Failed to load dashboard data:", err);
            if (isMounted.current) {
                setError("Failed to load dashboard data.");
                setEmployees([]);
                setFilteredEmployees([]);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    // Handle file upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        setImportFile(file);
    };

    const handleCertFeedFileUpload = (e) => {
        const file = e.target.files[0];
        setCertFeedFile(file);
    };

    // JSX
    return (
        <div className="min-h-screen w-full bg-gray-100">
            <header className="bg-blue-600 w-full p-4 flex justify-between items-center">
                <div className="flex space-x-2">
                    <button
                        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                        onClick={() => navigate("/home")}
                    >
                        Home
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white">
                        <img
                            src={profilePic}
                            alt="User Avatar"
                            className="rounded-full w-10 h-10 cursor-pointer"
                            onClick={() => navigate("/profile")}
                        />
                        <span>{userInfo?.firstName} {userInfo?.lastName}</span>
                    </div>
                    <button
                        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                        onClick={() => {
                            localStorage.clear();
                            navigate("/");
                        }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="px-4 py-8 mx-auto max-w-7xl">
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

                {/* Dashboard Summary */}
                <div className="mb-4 flex items-center gap-6 text-sm text-gray-700">
                    <p>
                        <strong>Total Employees:</strong> {totalEmployees}
                    </p>
                    <p>
                        <strong>Employees with Certificates:</strong> {employeesWithCertificate}
                    </p>
                    <p>
                        <strong>Overall Adoption Rate:</strong> {overallAdoptionRate}%
                    </p>
                </div>

                {/* Year Input and Search Area */}
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md w-48"
                                placeholder="Enter Year"
                            />
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                onClick={handleYearSubmit}
                            >
                                Submit
                            </button>
                        </div>
                        
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                onKeyPress={handleSearchKeyPress}
                                className="px-3 py-2 border border-gray-300 rounded-md w-48"
                                placeholder="Search by employee"
                            />
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                onClick={applySearch}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>

                {/* Employee Management */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Employee Management</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Add Employee
                        </button>
                        <button
                            onClick={() => {
                                console.log("Opening Import Modal");
                                setShowImportModal(true);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Import Employee CSV
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    const response = await axios.get(`${url}/api/Dashboard/csv`, {
                                        headers: { Authorization: `Bearer ${token}` },
                                        responseType: 'blob',
                                    });

                                    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = urlBlob;
                                    link.setAttribute('download', 'dashboard_data.csv');
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                } catch (err) {
                                    console.error("Error downloading Excel file:", err);
                                    alert("Failed to download Excel file.");
                                }
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Excel
                        </button>
                        <button
                            onClick={() => {
                                console.log("Opening Cert Feed Modal");
                                setShowCertFeedModal(true);
                            }}
                            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                        >
                            Cert Feed
                        </button>
                    </div>
                </div>

                {/* Add Employee Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-semibold mb-4">Add New Employee</h2>
                            <form onSubmit={handleAddEmployee}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={newEmployeeData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={newEmployeeData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={newEmployeeData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={newEmployeeData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
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
                )}

                {/* Import Employee Modal */}
                {showImportModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-semibold mb-4">Import Employee CSV</h2>
                            <p className="mb-4 text-sm text-gray-700">Insert a CSV or Excel file to import employees.</p>
                            <input
                                type="file"
                                accept=".csv, .xlsx"
                                onChange={handleFileUpload}
                                className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowImportModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (importFile) {
                                            try {
                                                const formData = new FormData();
                                                formData.append("file", importFile);

                                                // Send the file to the API
                                                const response = await axios.post(`${url}/api/Dashboard/upload-employee-feed`, formData, {
                                                    headers: {
                                                        Authorization: `Bearer ${token}`,
                                                        "Content-Type": "multipart/form-data",
                                                    },
                                                });

                                                alert("File uploaded successfully!");
                                                console.log("Upload Response:", response.data);

                                                // Close the modal
                                                setShowImportModal(false);
                                                setImportFile(null); // Clear the file input
                                            } catch (err) {
                                                console.error("Error uploading file:", err);
                                                alert("Failed to upload the file. Please try again.");
                                            }
                                        } else {
                                            alert("Please select a file to upload.");
                                        }
                                    }}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Upload
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cert Feed Modal */}
                {showCertFeedModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-semibold mb-4">Upload Certificate Feed</h2>
                            <p className="mb-4 text-sm text-gray-700">Insert a CSV or Excel file to upload certificate feed.</p>
                            <input
                                type="file"
                                accept=".csv, .xlsx"
                                onChange={handleCertFeedFileUpload}
                                className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCertFeedModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (certFeedFile) {
                                            try {
                                                const formData = new FormData();
                                                formData.append("file", certFeedFile);

                                                // Send the file to the API
                                                const response = await axios.post(`${url}/api/Dashboard/upload-certificate-feed`, formData, {
                                                    headers: {
                                                        Authorization: `Bearer ${token}`,
                                                        "Content-Type": "multipart/form-data",
                                                    },
                                                });

                                                alert("Certificate feed uploaded successfully!");
                                                console.log("Upload Response:", response.data);

                                                // Close the modal
                                                setShowCertFeedModal(false);
                                                setCertFeedFile(null); // Clear the file input
                                            } catch (err) {
                                                console.error("Error uploading certificate feed:", err);
                                                alert("Failed to upload the certificate feed. Please try again.");
                                            }
                                        } else {
                                            alert("Please select a file to upload.");
                                        }
                                    }}
                                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                                >
                                    Upload
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Employee Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Grade</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Certificate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cert Issue Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cert Expiry Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Document</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : getCurrentItems().length > 0 ? (
                                    getCurrentItems().map((employee, index) => (
                                        <tr key={employee.employeeId || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.fullName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.department || "N/A"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {employee.certificateLevel || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {employee.certificateName || "No Certificate"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {employee.certifiedDate ? dayjs(employee.certifiedDate).format('MMMM D, YYYY') : "No Certificate"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {employee.expiryDate ? dayjs(employee.expiryDate).format('MMMM D, YYYY') : "No Certificate"}
                                            </td>
                                            {/* View Document Button */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {employee.documentUrl ? (
                                                <button
                                                onClick={() => window.open(employee.documentUrl, '_blank')}
                                                className="text-blue-500 hover:underline"
                                                >
                                                View Document
                                                </button>
                                            ) : null}
                                            </td>                                            
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                            {searchQuery ? "No employees found matching your search." : "No employees found."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {filteredEmployees.length > 0 && (
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
                                    {filteredEmployees.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                                  </span> to{" "}
                                  <span className="font-medium">
                                    {Math.min(currentPage * itemsPerPage, filteredEmployees.length)}
                                  </span> of{" "}
                                  <span className="font-medium">{filteredEmployees.length}</span> results
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
            </main>
        </div>
    );
};

export default AdminPage;