import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // User data will be fetched from API
    const [userData, setUserData] = useState({
        firstName: "",
        lastName: "",
        title: "",
        email: "",
        mobile: "",
        employeeId: "",
        profileImage: "/api/placeholder/150/150" // Default placeholder until loaded from API
    });

    // API fetch function for user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Replace with actual API endpoint
                // const response = await fetch('/api/user/profile');
                // const data = await response.json();
                // setUserData(data);
                console.log("Will fetch user data from API");
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords don't match!"); // This will trigger the alert
            return;
        }


        try {
            // Will be implemented with actual API
            // const response = await fetch('/api/user/password', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({
            //         currentPassword: passwordData.currentPassword,
            //         newPassword: passwordData.newPassword
            //     })
            // });

            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw new Error(errorData.message || 'Failed to update password');
            // }

            console.log("Will update password via API");

            // Close modal and reset form
            setShowPasswordModal(false);
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

            // Show success message - in a real app, use a proper notification system
            alert("Password update request sent. This will be processed when the API is connected.");
        } catch (error) {
            console.error("Error updating password:", error);
            alert("Error updating password: " + error.message);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create a temporary preview
            const imageUrl = URL.createObjectURL(file);
            setUserData({
                ...userData,
                profileImage: imageUrl
            });

            // File upload logic - will be implemented with actual API
            const uploadProfileImage = async () => {
                try {
                    // Example API upload implementation
                    // const formData = new FormData();
                    // formData.append('profileImage', file);
                    // const response = await fetch('/api/user/profile/image', {
                    //     method: 'POST',
                    //     body: formData
                    // });
                    // const data = await response.json();
                    // If needed, update with the returned image URL from server
                    console.log("Will upload image to API:", file.name);
                } catch (error) {
                    console.error("Error uploading image:", error);
                }
            };

            uploadProfileImage();
        }
    };

    const navigateToHome = () => {
        navigate('/home');
    };

    const PasswordChangeModal = () => {
        if (!showPasswordModal) return null;

        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                    <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Password
                                </label>
                                <input
                                    id="currentPassword"
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowPasswordModal(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full bg-gray-100">
            {/* Header */}
            <header className="bg-blue-600 w-full p-4 flex justify-between items-center">
                <button
                    className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                    onClick={navigateToHome}
                >
                    Home
                </button>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white">
                        <img
                            src={userData.profileImage}
                            alt="User Avatar"
                            className="rounded-full w-10 h-10 object-cover"
                        />
                        <span>{userData.firstName} {userData.lastName}</span>
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
                <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Profile</h1>
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Change Password
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Profile Image Section */}
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <img
                                    src={userData.profileImage}
                                    alt="Profile"
                                    className="w-36 h-36 rounded-full object-cover border-4 border-gray-200"
                                />
                            </div>
                            <button
                                onClick={handleUploadClick}
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Upload
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* User Details Section */}
                        <div className="flex-1">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold">{userData.firstName} {userData.lastName}</h2>
                                    <p className="text-gray-600">{userData.title}</p>
                                </div>

                                <div className="mt-2">
                                    <div className="flex items-center mb-2">
                                        <span className="text-gray-600 mr-2">Email:</span>
                                        <span>{userData.email}</span>
                                    </div>
                                    <div className="flex items-center mb-2">
                                        <span className="text-gray-600 mr-2">Mobile:</span>
                                        <span>{userData.mobile}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-gray-600 mr-2">Employee ID:</span>
                                        <span>{userData.employeeId}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Password Change Modal */}
            <PasswordChangeModal />
        </div>
    );
};

export default Profile;