import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentCert, setCurrentCert] = useState(null);
    const [certificateCatalog, setCertificateCatalog] = useState([]);
    const [myCertifications, setMyCertifications] = useState([]);
    const [profilePic, setProfilePic] = useState("/api/placeholder/40/40");
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        certification: "",
        certifiedDate: "",
        validThrough: "",
        level: ""
    });

    const url = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');

    // Mock user info from localStorage
    const userInfo = {
        firstName: localStorage.getItem('firstName') || 'User',
        lastName: localStorage.getItem('lastName') || '',
        userRole: localStorage.getItem('userRole') || 'User',
    };

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

    // Fetch user's certifications on page load
    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${url}/api/Certificates`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMyCertifications(response.data || []);
            } catch (err) {
                console.error("Error fetching certifications:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchCertificateCatalog = async () => {
            try {
                const response = await axios.get(`${url}/api/CertificateCatalog`);
                const data = response.data;
        
                // Ensure the data is an array and set it to state
                if (Array.isArray(data)) {
                    setCertificateCatalog(data);
                } else {
                    console.error("Unexpected API response structure:", data);
                    setCertificateCatalog([]);
                }
        
                console.log("Certificate Catalog:", data);
            } catch (err) {
                console.error("Error fetching certificate catalog:", err);
            }
        };

        const fetchProfilePicture = async () => {
            try {
                const response = await axios.get(`${url}/api/Profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const imageUrl = response.data?.profilePictureUrl;
                if (imageUrl) {
                    const fullUrl = imageUrl.startsWith("http")
                        ? imageUrl
                        : `${url}/${imageUrl.replace(/^\/+/, "")}`;
                    setProfilePic(fullUrl);
                    localStorage.setItem("profilePictureUrl", fullUrl);
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
    }, [token]);

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
            // Send the POST request
            await axios.post(`${url}/api/Certificates/add`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

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
            setMyCertifications(response.data || []);
        } catch (err) {
            console.error("Error adding certificate:", err);
            alert("Failed to add certificate.");
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
            // Send the PUT request
            await axios.put(`${url}/api/Certificates/${currentCert.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Certificate updated successfully!");
            setShowEditModal(false);
            setCurrentCert(null);

            // Refresh the certifications list
            const response = await axios.get(`${url}/api/Certificates`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMyCertifications(response.data || []);
        } catch (err) {
            console.error("Error updating certificate:", err);
            alert("Failed to update certificate.");
        }
    };

    const handleDeleteCert = async (certId) => {
        if (window.confirm("Are you sure you want to delete this certification?")) {
            try {
                await axios.delete(`${url}/api/Certificates/${certId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                alert("Certification deleted successfully!");

                // Refresh the certifications list
                const response = await axios.get(`${url}/api/Certificates`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMyCertifications(response.data || []);
            } catch (err) {
                console.error("Error deleting certification:", err);
                alert("Failed to delete certification.");
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
                            <option key={index} value={cert.certificateName}>
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
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {myCertifications.map((cert) => (
                                            <tr key={cert.id}>
                                                {/* Certification Name */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {cert.certificateName || "N/A"}
                                                </td>

                                                {/* Certified Date */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {cert.certifiedDate || "N/A"}
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
                                                    {cert.validTill || "N/A"}
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
                                        ))}
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