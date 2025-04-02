import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminPage = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCertificatesModal, setShowCertificatesModal] = useState(false);
    const [showAddCertificateModal, setShowAddCertificateModal] = useState(false);
    const [allCertifications, setAllCertifications] = useState([]);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [currentEmployeeCerts, setCurrentEmployeeCerts] = useState([]);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        department: "",
        role: ""
    });

    const [certFormData, setCertFormData] = useState({
        certificationId: "",
        certifiedDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0]
    });

    const url = 'http://localhost:5282';

    // Get user information from localStorage
    useEffect(() => {
        // Try to get user info from localStorage
        try {
            // Check for auth response data
            const authResponseStr = localStorage.getItem('authResponse');
            if (authResponseStr) {
                const authResponse = JSON.parse(authResponseStr);
                const userData = authResponse || {};
                setUserInfo(userData);
            } else {
                // Try individual fields
                const firstName = localStorage.getItem('firstName');
                const lastName = localStorage.getItem('lastName');
                const email = localStorage.getItem('email');
                const appRole = localStorage.getItem('userRole');

                if (firstName && lastName && email && appRole) {
                    setUserInfo({
                        firstName,
                        lastName,
                        email,
                        appRole
                    });
                }
            }
        } catch (error) {
            console.error("Error loading user info:", error);
        }
    }, []);

    // Check if user has admin permissions and fetch employees
    useEffect(() => {
        // Verify user is Manager before fetching
        const storedUserRole = localStorage.getItem('userRole');

        if (storedUserRole !== 'Manager' && storedUserRole !== 'Admin') {
            setError("You do not have permission to access this page");
            setTimeout(() => {
                navigate('/home');
            }, 2000);
            return;
        }

        const fetchEmployees = async () => {
            try {
                setLoading(true);
                // Clear any previous error message
                setError(null);

                // Try different possible endpoints
                let response;
                try {
                    response = await axios.get(`${url}/api/Admin/employees`);
                    console.log("Employees data:", response.data);
                    setEmployees(response.data || []);
                } catch (firstError) {
                    console.log("First attempt failed, trying alternative endpoint");
                    try {
                        response = await axios.get(`${url}/Admin/employees`);
                        console.log("Employees data (from alternative endpoint):", response.data);
                        setEmployees(response.data || []);
                    } catch (secondError) {
                        // Specifically check for 404 status and DON'T set error
                        if (secondError.response && secondError.response.status === 404) {
                            console.log("No employee data found (404 error)");
                            // Set empty array but don't set error
                            setEmployees([]);
                        } else if (secondError.response && (secondError.response.status === 403 || secondError.response.status === 401)) {
                            // Only set error for permission issues
                            setError("You do not have permission to access this page");
                            // Redirect to home after showing error
                            setTimeout(() => {
                                navigate('/home');
                            }, 2000);
                        } else {
                            // For other errors, just log them but don't show to user
                            console.error("Error fetching employees:", secondError);
                            // Set empty array
                            setEmployees([]);
                        }
                    }
                }
                setLoading(false);
            } catch (err) {
                console.error("Unexpected error fetching employees:", err);
                // Handle 404 without error message
                if (err.response && err.response.status === 404) {
                    setEmployees([]);
                    setError(null); // Clear any error message
                } else if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                    setError("You do not have permission to access this page");
                    // Redirect to home after showing error
                    setTimeout(() => {
                        navigate('/home');
                    }, 2000);
                } else {
                    // Don't set error for other cases - just log to console
                    console.error("Failed to load employees:", err.message || "Unknown error");
                    setEmployees([]);
                }
                setLoading(false);
            }
        };

        const fetchAllCertifications = async () => {
            try {
                // Try different possible endpoints with api/dashboard instead of api/certificates
                let response;
                try {
                    response = await axios.get(`${url}/api/dashboard`);
                } catch (firstError) {
                    console.log("First attempt failed, trying alternative endpoint");
                    try {
                        response = await axios.get(`${url}/dashboard`);
                    } catch (secondError) {
                        // Don't show errors for 404 - just log them
                        console.error("Error fetching certifications:", secondError);
                        setAllCertifications([]);
                        return;
                    }
                }
                setAllCertifications(response.data || []);
            } catch (err) {
                console.error("Error fetching certifications:", err);
                setAllCertifications([]);
            }
        };

        fetchEmployees();
        fetchAllCertifications();
    }, [navigate, url]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleCertInputChange = (e) => {
        const { name, value } = e.target;
        setCertFormData({
            ...certFormData,
            [name]: value
        });
    };

    const handleAddNew = () => {
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            department: "",
            role: ""
        });
        setShowAddModal(true);
    };

    const handleEdit = (employee) => {
        setCurrentEmployee(employee);
        setFormData({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            department: employee.department,
            role: employee.role
        });
        setShowEditModal(true);
    };

    const handleViewCertificates = async (employee) => {
        setCurrentEmployee(employee);

        try {
            // Try different possible endpoints
            let response;
            try {
                response = await axios.get(`${url}/api/Admin/employees/${employee.id}/certificates`);
            } catch (firstError) {
                console.log("First attempt failed, trying alternative endpoint");
                response = await axios.get(`${url}/Admin/employees/${employee.id}/certificates`);
            }

            setCurrentEmployeeCerts(response.data);
            setShowCertificatesModal(true);
        } catch (err) {
            console.error("Error fetching employee certificates:", err);
            alert("Failed to load employee certificates: " + (err.message || "Unknown error"));
        }
    };

    const handleAddCertificate = () => {
        setCertFormData({
            certificationId: "",
            certifiedDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0]
        });
        setShowAddCertificateModal(true);
    };

    const handleRemoveCertificate = async (certificateId) => {
        if (window.confirm("Are you sure you want to remove this certificate?")) {
            try {
                // Try different possible endpoints
                try {
                    await axios.delete(`${url}/api/Admin/employees/${currentEmployee.id}/certificates/${certificateId}`);
                } catch (firstError) {
                    console.log("First attempt failed, trying alternative endpoint");
                    await axios.delete(`${url}/Admin/employees/${currentEmployee.id}/certificates/${certificateId}`);
                }

                // Update the certificates list
                setCurrentEmployeeCerts(currentEmployeeCerts.filter(cert => cert.id !== certificateId));

                // Also update the employee's certificate count in the main list
                setEmployees(employees.map(emp => {
                    if (emp.id === currentEmployee.id) {
                        return {
                            ...emp,
                            certificateCount: (emp.certificateCount || 0) - 1
                        };
                    }
                    return emp;
                }));
            } catch (err) {
                console.error("Error removing certificate:", err);
                alert("Failed to remove certificate: " + (err.message || "Unknown error"));
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            try {
                // Try different possible endpoints
                try {
                    await axios.delete(`${url}/api/Admin/employees/${id}`);
                } catch (firstError) {
                    console.log("First attempt failed, trying alternative endpoint");
                    await axios.delete(`${url}/Admin/employees/${id}`);
                }

                setEmployees(employees.filter(emp => emp.id !== id));
            } catch (err) {
                console.error("Error deleting employee:", err);
                alert("Failed to delete employee: " + (err.message || "Unknown error"));
            }
        }
    };

    const handleSubmitAdd = async (e) => {
        e.preventDefault();

        try {
            const newEmployee = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                department: formData.department,
                role: formData.role,
                // Include appRole as Employee by default
                appRole: "Employee"
            };

            // Try different possible endpoints
            let response;
            try {
                response = await axios.post(`${url}/api/Admin/employees`, newEmployee);
            } catch (firstError) {
                console.log("First attempt failed, trying alternative endpoint");
                response = await axios.post(`${url}/Admin/employees`, newEmployee);
            }

            setEmployees([...employees, response.data]);
            setShowAddModal(false);
        } catch (err) {
            console.error("Error adding employee:", err);
            alert("Failed to add employee: " + (err.message || "Unknown error"));
        }
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();

        try {
            const updatedEmployee = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                department: formData.department,
                role: formData.role,
                // Preserve existing appRole
                appRole: currentEmployee.appRole || "Employee"
            };

            // Try different possible endpoints
            let response;
            try {
                response = await axios.put(`${url}/api/Admin/employees/${currentEmployee.id}`, updatedEmployee);
            } catch (firstError) {
                console.log("First attempt failed, trying alternative endpoint");
                response = await axios.put(`${url}/Admin/employees/${currentEmployee.id}`, updatedEmployee);
            }

            const updatedEmployees = employees.map(emp => {
                if (emp.id === currentEmployee.id) {
                    return response.data;
                }
                return emp;
            });

            setEmployees(updatedEmployees);
            setShowEditModal(false);
        } catch (err) {
            console.error("Error updating employee:", err);
            alert("Failed to update employee: " + (err.message || "Unknown error"));
        }
    };

    const handleSubmitAddCertificate = async (e) => {
        e.preventDefault();

        try {
            const newCertificate = {
                certificationId: certFormData.certificationId,
                certifiedDate: certFormData.certifiedDate,
                expiryDate: certFormData.expiryDate
            };

            // Try different possible endpoints
            let response;
            try {
                response = await axios.post(`${url}/api/Admin/employees/${currentEmployee.id}/certificates`, newCertificate);
            } catch (firstError) {
                console.log("First attempt failed, trying alternative endpoint");
                response = await axios.post(`${url}/Admin/employees/${currentEmployee.id}/certificates`, newCertificate);
            }

            // Add the certificate to the current display
            setCurrentEmployeeCerts([...currentEmployeeCerts, response.data]);

            // Update the count in the employee list
            setEmployees(employees.map(emp => {
                if (emp.id === currentEmployee.id) {
                    return {
                        ...emp,
                        certificateCount: (emp.certificateCount || 0) + 1
                    };
                }
                return emp;
            }));

            setShowAddCertificateModal(false);
        } catch (err) {
            console.error("Error adding certificate:", err);
            alert("Failed to add certificate: " + (err.message || "Unknown error"));
        }
    };

    const navigateToHome = () => {
        navigate('/home');
    };

    const navigateToProfile = () => {
        navigate('/profile');
    };

    const handleLogout = () => {
        localStorage.clear(); // Clear all localStorage items
        navigate('/');
    };

    // Calculate if a certificate is expired or expiring soon (within 30 days)
    const getCertificateStatus = (expiryDate) => {
        if (!expiryDate) return { status: 'Unknown', className: 'bg-gray-100 text-gray-800' };

        const today = new Date();
        const expiry = new Date(expiryDate);
        const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) {
            return { status: 'Expired', className: 'bg-red-100 text-red-800' };
        } else if (daysUntilExpiry < 30) {
            return { status: 'Expiring Soon', className: 'bg-yellow-100 text-yellow-800' };
        } else {
            return { status: 'Valid', className: 'bg-green-100 text-green-800' };
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const Modal = ({ isOpen, onClose, title, onSubmit, children }) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                    <h2 className="text-xl font-semibold mb-4">{title}</h2>
                    {onSubmit ? (
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
                    ) : (
                        <>
                            {children}
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Close
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const EmployeeForm = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                />
            </div>
        </div>
    );

    const CertificateForm = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
                <select
                    name="certificationId"
                    value={certFormData.certificationId}
                    onChange={handleCertInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                >
                    <option value="">Select a certification</option>
                    {allCertifications
                        .filter(cert =>
                            !currentEmployeeCerts.some(ec =>
                                ec.certificationId === cert.id || ec.id === cert.id
                            )
                        )
                        .map(cert => (
                            <option key={cert.id} value={cert.id}>
                                {cert.name} - {cert.level}
                            </option>
                        ))
                    }
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Certified</label>
                <input
                    type="date"
                    name="certifiedDate"
                    value={certFormData.certifiedDate}
                    onChange={handleCertInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                    type="date"
                    name="expiryDate"
                    value={certFormData.expiryDate}
                    onChange={handleCertInputChange}
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
                    <button
                        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                        onClick={navigateToHome}
                    >
                        Home
                    </button>
                    <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">
                        Admin Dashboard
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white">
                        <img
                            src="/api/placeholder/40/40"
                            alt="User Avatar"
                            className="rounded-full w-10 h-10 cursor-pointer"
                            onClick={navigateToProfile}
                        />
                        <span>{userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'Admin'}</span>
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
                        <h2 className="text-xl font-semibold">Employee Management</h2>
                        <button
                            onClick={handleAddNew}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Add New Employee
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <p className="text-gray-500">Loading employees...</p>
                        </div>
                    ) : error && (error.includes("permission") || error.includes("access")) ? (
                        // Only show error for permission issues
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <p>{error}</p>
                            <button
                                onClick={() => navigate('/home')}
                                className="mt-2 text-sm underline"
                            >
                                Return to Home
                            </button>
                        </div>
                    ) : (
                        // Always show table - will display "No employees found" when array is empty
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Department
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Certificates
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {employees.length > 0 ? (
                                            employees.map((employee) => (
                                                <tr key={employee.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {employee.firstName} {employee.lastName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {employee.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {employee.department}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {employee.role}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <button
                                                            onClick={() => handleViewCertificates(employee)}
                                                            className="text-blue-600 hover:text-blue-800 underline"
                                                        >
                                                            View ({employee.certificateCount || 0})
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEdit(employee)}
                                                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(employee.id)}
                                                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No employees found. Add a new employee to get started.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Employee Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Employee"
                onSubmit={handleSubmitAdd}
            >
                <EmployeeForm />
            </Modal>

            {/* Edit Employee Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Employee"
                onSubmit={handleSubmitEdit}
            >
                <EmployeeForm />
            </Modal>

            {/* View Certificates Modal */}
            <Modal
                isOpen={showCertificatesModal}
                onClose={() => setShowCertificatesModal(false)}
                title={currentEmployee ? `${currentEmployee.firstName} ${currentEmployee.lastName}'s Certificates` : "Certificates"}
            >
                <div className="mb-4 flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                        Manage employee certifications
                    </p>
                    <button
                        onClick={handleAddCertificate}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                        Add Certificate
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Certificate
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Level
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Expiry
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentEmployeeCerts && currentEmployeeCerts.length > 0 ? (
                                currentEmployeeCerts.map((cert) => {
                                    const status = getCertificateStatus(cert.expiryDate);
                                    return (
                                        <tr key={cert.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {cert.name}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {cert.level}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(cert.certifiedDate)}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(cert.expiryDate)}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs ${status.className}`}>
                                                    {status.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleRemoveCertificate(cert.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-2 text-center text-sm text-gray-500">
                                        No certificates found for this employee.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Modal>

            {/* Add Certificate Modal */}
            <Modal
                isOpen={showAddCertificateModal}
                onClose={() => setShowAddCertificateModal(false)}
                title="Add New Certificate"
                onSubmit={handleSubmitAddCertificate}
            >
                <CertificateForm />
            </Modal>
        </div>
    );
};

export default AdminPage;