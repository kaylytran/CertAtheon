import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CertificateCatalog = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    const url = import.meta.env.VITE_API_BASE_URL; // Update this to your backend URL

    // State for catalog data
    const [catalogData, setCatalogData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for modal
    const [showModal, setShowModal] = useState(false);
    const [newCertificate, setNewCertificate] = useState({
        certificateName: "",
        category: "",
        certificateLevel: "",
        description: "",
    });

    // Fetch certificate catalog data from API
    useEffect(() => {
        const fetchCatalogData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${url}/api/CertificateCatalog`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCatalogData(response.data);
            } catch (err) {
                console.error("Error fetching certificate catalog:", err);
                setError("Failed to load certificate catalog");
            } finally {
                setLoading(false);
            }
        };

        fetchCatalogData();
    }, [token]);

    // Handle input changes in the modal
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCertificate((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission to add a new certificate
    const handleAddCertificate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${url}/api/CertificateCatalog/add`,
                newCertificate,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Includes the Bearer token in the header
                        "Content-Type": "application/json",
                    },
                }
            );

            alert("Certificate added successfully!");
            setCatalogData((prev) => [...prev, response.data]); // Update the catalog data with the new certificate
            setShowModal(false); // Close the modal
            setNewCertificate({
                certificateName: "",
                category: "",
                certificateLevel: "",
                description: "",
            }); // Reset the form fields
        } catch (err) {
            console.error("Error adding certificate:", err);
            alert("Failed to add certificate.");
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
        profilePhoto: localStorage.getItem("profilePhoto") || "/api/placeholder/40/40",
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
                    <button
                        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                        onClick={navigateToDashboard}
                    >
                        Dashboard
                    </button>
                    <button
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    >
                        Certificate Catalogue
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white">
                        <img
                            src={userInfo.profilePhoto}
                            alt="User Avatar"
                            className="rounded-full w-10 h-10 object-cover cursor-pointer"
                            onClick={navigateToProfile}
                        />
                        <span>{userInfo.firstName} {userInfo.lastName}</span> {/* Dynamically display user name */}
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

                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <p className="text-gray-500">Loading certificate catalog...</p>
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
                                            <tr key={certificate.id} className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}>
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
                                                No certificates available in the catalog
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={newCertificate.category}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Level</label>
                                    <input
                                        type="text"
                                        name="certificateLevel"
                                        value={newCertificate.certificateLevel}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={newCertificate.description}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
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