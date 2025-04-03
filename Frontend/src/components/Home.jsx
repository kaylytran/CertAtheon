import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CertificationDashboard = () => {
    const navigate = useNavigate();
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentCert, setCurrentCert] = useState(null);
    const [formData, setFormData] = useState({
        certification: "",
        certifiedDate: "",
        validThrough: "",
        level: ""
    });

    // Fetch certifications from API
    useEffect(() => {
        const fetchCertifications = async () => {
            try {
                setLoading(true);
                // Replace with actual API call when backend is ready
                // const response = await fetch('/api/certifications');
                // const data = await response.json();
                // setCertifications(data);
                console.log("Will fetch certifications from API");
                setLoading(false);
            } catch (err) {
                console.error("Error fetching certifications:", err);
                setError("Failed to load certifications");
                setLoading(false);
            }
        };

        fetchCertifications();
    }, []);

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

    const handleEdit = (cert) => {
        setCurrentCert(cert);
        setFormData({
            certification: cert.name,
            certifiedDate: cert.certifiedDate,
            validThrough: cert.expiryDate,
            level: cert.level
        });
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this certification?")) {
            try {
                // Replace with actual API call when backend is ready
                // await fetch(`/api/certifications/${id}`, {
                //     method: 'DELETE'
                // });

                // Update local state after successful API call
                setCertifications(certifications.filter(cert => cert.id !== id));
                console.log("Will delete certification via API:", id);
            } catch (err) {
                console.error("Error deleting certification:", err);
                alert("Failed to delete certification");
            }
        }
    };

    const handleSubmitAdd = async (e) => {
        e.preventDefault();

        try {
            const newCert = {
                name: formData.certification,
                certifiedDate: formData.certifiedDate,
                level: formData.level,
                expiryDate: formData.validThrough
            };

            // Replace with actual API call when backend is ready
            // const response = await fetch('/api/certifications', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(newCert)
            // });
            // const data = await response.json();

            // For now, simulate a response with a generated ID
            const mockResponse = {
                ...newCert,
                id: Date.now() // Temporary ID generation
            };

            setCertifications([...certifications, mockResponse]);
            setShowAddModal(false);
            console.log("Will add certification via API:", newCert);
        } catch (err) {
            console.error("Error adding certification:", err);
            alert("Failed to add certification");
        }
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();

        try {
            const updatedCert = {
                id: currentCert.id,
                name: formData.certification,
                certifiedDate: formData.certifiedDate,
                level: formData.level,
                expiryDate: formData.validThrough
            };

            // Replace with actual API call when backend is ready
            // await fetch(`/api/certifications/${currentCert.id}`, {
            //     method: 'PUT',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(updatedCert)
            // });

            // Update local state after successful API call
            const updatedCerts = certifications.map(cert => {
                if (cert.id === currentCert.id) {
                    return updatedCert;
                }
                return cert;
            });

            setCertifications(updatedCerts);
            setShowEditModal(false);
            console.log("Will update certification via API:", updatedCert);
        } catch (err) {
            console.error("Error updating certification:", err);
            alert("Failed to update certification");
        }
    };

    const navigateToProfile = () => {
        navigate('/profile');
    };

    const navigateToCatalog = () => {
        navigate('/catalog');
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
                <label htmlFor="certification" className="block text-sm font-medium text-gray-700 mb-1">Certificate</label>
                <input
                    id="certification"
                    type="text"
                    name="certification"
                    value={formData.certification}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                />
            </div>
            <div>
                <label htmlFor="certifiedDate" className="block text-sm font-medium text-gray-700 mb-1">Certified Date</label>
                <input
                    id="certifiedDate"
                    type="date"
                    name="certifiedDate"
                    value={formData.certifiedDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                />
            </div>
            <div>
                <label htmlFor="validThrough" className="block text-sm font-medium text-gray-700 mb-1">Valid Through</label>
                <input
                    id="validThrough"
                    type="date"
                    name="validThrough"
                    value={formData.validThrough}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                />
            </div>
            <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">Certificate Level</label>
                <select
                    id="level"
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
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white">
                        <img
                            src="/api/placeholder/40/40"
                            alt="User Avatar"
                            className="rounded-full w-10 h-10 cursor-pointer"
                            onClick={navigateToProfile}
                        />
                        <span>User</span>
                    </div>
                    <button
                        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                        onClick={() => navigate('/')}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-4 py-8 mx-auto max-w-7xl">
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Certifications</h2>
                        <button
                            onClick={handleAddNew}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Add New Certificate
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <p className="text-gray-500">Loading certifications...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <p>{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-2 text-sm underline"
                            >
                                Try again
                            </button>
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
                                        {certifications.length > 0 ? (
                                            certifications.map((cert) => (
                                                <tr key={cert.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {cert.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {cert.certifiedDate}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {cert.level}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {cert.expiryDate}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEdit(cert)}
                                                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                                            >
                                                                Modify
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(cert.id)}
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
                                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No certifications found. Add a new certification to get started.
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

            {/* Add Certificate Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Certificate"
                onSubmit={handleSubmitAdd}
            >
                <CertificationForm />
            </Modal>

            {/* Edit Certificate Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Modify Certificate"
                onSubmit={handleSubmitEdit}
            >
                <CertificationForm />
            </Modal>
        </div>
    );
};

export default CertificationDashboard;