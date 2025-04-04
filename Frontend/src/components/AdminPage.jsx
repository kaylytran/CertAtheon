import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminPage = () => {
    const navigate = useNavigate();
    const url = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");

    // State Variables
    const [employees, setEmployees] = useState([]); // This will now only store data from /api/Dashboard
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [employeesWithCertificate, setEmployeesWithCertificate] = useState(0);
    const [overallAdoptionRate, setOverallAdoptionRate] = useState(0);
    const [year, setYear] = useState("2025"); // Default year is 2025
    const [showAddModal, setShowAddModal] = useState(false);
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

    // Fetch Dashboard Data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${url}/api/Dashboard?year=${year}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const dashboardData = response.data || {};
                setTotalEmployees(dashboardData.totalEmployees || 0);
                setEmployeesWithCertificate(dashboardData.employeesWithCertificate || 0);
                setOverallAdoptionRate(dashboardData.overallAdoptionRate || 0);
                setEmployees(dashboardData.records || []); // Update employees with records from /api/Dashboard
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
                setError("Failed to load dashboard data.");
                setEmployees([]); // Clear the table if the API call fails
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [year]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployeeData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();

        const { password } = newEmployeeData;

        // Password validation
        const hasNonAlphanumeric = /[^a-zA-Z0-9]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasUppercase = /[A-Z]/.test(password);

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

        try {
            await axios.post(`${url}/api/Auth/register`, newEmployeeData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Employee added successfully!");
            setShowAddModal(false);

            // Optionally, refresh the dashboard data
            const response = await axios.get(`${url}/api/Dashboard?year=${year}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const dashboardData = response.data || {};
            setEmployees(dashboardData.records || []);
        } catch (err) {
            console.error("Error adding employee:", err);
            alert("Failed to add employee.");
        }
    };

    const handleYearSubmit = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${url}/api/Dashboard?year=${year}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const dashboardData = response.data || {};
            setTotalEmployees(dashboardData.totalEmployees || 0);
            setEmployeesWithCertificate(dashboardData.employeesWithCertificate || 0);
            setOverallAdoptionRate(dashboardData.overallAdoptionRate || 0);
            setEmployees(dashboardData.records || []);
        } catch (err) {
            console.error("Failed to load dashboard data:", err);
            setError("Failed to load dashboard data.");
            setEmployees([]);
        } finally {
            setLoading(false);
        }
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
                            src="/api/placeholder/40/40" // Replace with the actual profile photo URL
                            alt="User Avatar"
                            className="rounded-full w-10 h-10 cursor-pointer"
                            onClick={() => navigate("/profile")} // Navigate to the profile page
                        />
                        <span>{userInfo?.firstName} {userInfo?.lastName}</span> {/* Dynamically display user name */}
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

                {/* Year Input */}
                <div className="flex justify-between items-center mb-4">
                    <input
                        type="text"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Enter Year"
                    />
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={handleYearSubmit} // Trigger the API call
                    >
                        Submit
                    </button>
                </div>

                {/* Employee Management */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Employee Management</h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Add Employee
                    </button>
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

                {/* Employee Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cert Issue Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cert Expiry Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.length > 0 ? (
                                    employees.map((employee) => (
                                        <tr key={employee.employeeId}>
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
                                                {employee.certifiedDate || "No Certificate"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {employee.expiryDate || "No Certificate"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No employees found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPage;