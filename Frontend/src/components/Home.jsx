import React from "react";

const CertificationDashboard = () => {
    const [certifications, setCertifications] = React.useState([]);

    return (
        <div className="min-h-screen w-full bg-gray-100">
            {/* Header */}
            <header className="bg-blue-600 w-full p-4 flex justify-between items-center">
                <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">
                    Home
                </button>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white">
                        <span>User</span>
                    </div>
                    <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-4 py-8 mx-auto max-w-7xl">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Certifications</h2>
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
                                    {certifications.map((cert) => (
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
                                                    <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                                                        Modify
                                                    </button>
                                                    <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Add New
                </button>
            </main>
        </div>
    );
};

export default CertificationDashboard;