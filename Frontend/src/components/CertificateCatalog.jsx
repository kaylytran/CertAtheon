import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const CertificateCatalog = () => {
    const navigate = useNavigate();

    // State for catalog data that will be fetched from API
    const [catalogData, setCatalogData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch certificate catalog data from API
    useEffect(() => {
        const fetchCatalogData = async () => {
            try {
                setLoading(true);
    
                // Simulate loading delay
                await new Promise((res) => setTimeout(res, 100));
    
                console.log("Will fetch certificate catalog from API");
                setLoading(false);
            } catch (err) {
                console.error("Error fetching certificate catalog:", err);
                setError("Failed to load certificate catalog");
                setLoading(false);
            }
        };
    
        fetchCatalogData();
    }, []);
    

    // Navigation functions
    const navigateToHome = () => navigate('/home');
    const navigateToDashboard = () => navigate('/home');
    const navigateToProfile = () => navigate('/profile');

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
                            src="/api/placeholder/40/40"
                            alt="User Avatar"
                            className="rounded-full w-10 h-10 object-cover cursor-pointer"
                            onClick={navigateToProfile}
                        />
                        <span>Ronak Sanghavi</span>
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
            <main className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold mb-6">Certificate Catalogue</h1>

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
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {catalogData.length > 0 ? (
                                        catalogData.map((certificate, index) => (
                                            <tr key={certificate.id} className={index % 2 === 0 ? 'bg-gray-200' : 'bg-white'}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {certificate.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {certificate.expertise}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {certificate.category}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
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
        </div>
    );
};

export default CertificateCatalog;