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

    const [userData, setUserData] = useState({
        firstName: "Dillon",
        lastName: "McLaughlin",
        title: "Employee",
        email: "tester@gmail.com",
        mobile: "123-456-7890",
        employeeId: "EMP001",
        profileImage: "/api/placeholder/150/150"
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch("/api/Profile/details", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                const data = await response.json();
                setUserData(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
};

        fetchUserData();
    }, []);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords don't match!");
            return;
        }

        try {
            console.log("Will update password via API");
        } catch (error) {
            console.error("Error updating password:", error);
            alert("Error updating password: " + error.message);
        }

        setShowPasswordModal(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        alert("Password update request sent.");
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const uploadProfileImage = async () => {
                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        alert("No token found. Please log in again.");
                        return;
                    }
    
                    const formData = new FormData();
                    formData.append("file", file);
    
                    const response = await fetch("http://localhost:5282/api/Profile/upload-profile-picture", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        body: formData
                    });
    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Upload failed. Server says: ${errorText}`);
                    }
    
                    const result = await response.json();
                    console.log("Upload result:", result);
    
                    setUserData(prev => ({
                        ...prev,
                        profileImage: result.url
                    }));
    
                    alert("Profile image updated!");
    
                } catch (error) {
                    console.error("Error uploading image:", error);
                    alert("Failed to upload image. " + error.message);
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button type="button" onClick={() => setShowPasswordModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Password</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full bg-gray-100">
            <header className="bg-blue-600 w-full p-4 flex justify-between items-center">
                <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800" onClick={navigateToHome}>Home</button>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white">
                        <img src={userData.profileImage} alt="User Avatar" className="rounded-full w-10 h-10 object-cover" />
                        <span>{userData.firstName} {userData.lastName}</span>
                    </div>
                    <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800" onClick={() => navigate('/')}>Logout</button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Profile</h1>
                        <button onClick={() => setShowPasswordModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Change Password</button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <img src={userData.profileImage} alt="Profile" className="w-36 h-36 rounded-full object-cover border-4 border-gray-200" />
                            </div>
                            <button onClick={handleUploadClick} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Upload</button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>

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

            <PasswordChangeModal />
        </div>
    );
};

export default Profile;
