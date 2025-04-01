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
        certifiedDate: "",
        validThrough: "",
        level: ""
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

    // Fetch the current user's certifications
    const fetchMyCertifications = async () => {
        try {
            setLoading(true);
            const email = localStorage.getItem('email');
            if (!email) {
                console.warn("User email not found");
                setLoading(false);
                return;
            }

            // Try different possible endpoints
            let response;
            try {
                response = await axios.get(`${url}/api/User/certifications`);
            } catch (firstError) {
                console.log("First attempt failed, trying alternative endpoint");
                try {
                    response = await axios.get(`${url}/User/certifications`);
                } catch (secondError) {
                    // Last attempt with email parameter
                    response = await axios.get(`${url}/api/Certification/user?email=${encodeURIComponent(email)}`);
                }
            }

            setMyCertifications(response.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching certifications:", err);
            setLoading(false);
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
            certifiedDate: "",
            validThrough: "",
            level: ""
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

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString();
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate</label>
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
                <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Associate">Associate</option>
                    <option value="Professional">Professional</option>
                    <option value="Expert">Expert</option>
                </select>
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
                        <button
                            onClick={handleAddNew}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Add New Certificate
                        </button>
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
                                                            {cert.level}
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
                                                            <button
                                                                onClick={() => {
                                                                    setCurrentCert(cert);
                                                                    setFormData({
                                                                        certification: cert.name,
                                                                        certifiedDate: new Date(cert.certifiedDate).toISOString().split('T')[0],
                                                                        validThrough: new Date(cert.expiryDate).toISOString().split('T')[0],
                                                                        level: cert.level
                                                                    });
                                                                    setShowEditModal(true);
                                                                }}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                Edit
                                                            </button>
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
                onSubmit={(e) => {
                    e.preventDefault();
                    // This function would typically add the certificate to the backend
                    // For now, we're just showing a demo
                    alert("This is a static demo. Adding certificates is not functional.");
                    setShowAddModal(false);
                }}
            >
                <CertificationForm />
            </Modal>

            {/* Edit Certificate Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Certificate"
                onSubmit={(e) => {
                    e.preventDefault();
                    // This function would typically update the certificate in the backend
                    // For now, we're just showing a demo
                    alert("This is a static demo. Editing certificates is not functional.");
                    setShowEditModal(false);
                }}
            >
                <CertificationForm />
            </Modal>
        </div>
    );
};

export default Home;