import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    const url = "http://localhost:5282";

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${url}/api/Profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProfileData(response.data);
            } catch (err) {
                console.error("Error fetching profile data:", err);
                setError("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const handleProfilePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);
            const response = await axios.post(`${url}/api/Profile/upload-profile-picture`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            // Update the profile picture URL
            setProfileData((prevData) => ({
                ...prevData,
                profilePictureUrl: response.data.url,
            }));

            alert(response.data.message || "Profile picture uploaded successfully.");
        } catch (err) {
            console.error("Error uploading profile picture:", err);
            alert("Failed to upload profile picture.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-100">
            {/* Header */}
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
                            src={profileData?.profilePictureUrl || "/api/placeholder/40/40"} // Replace with actual profile photo URL
                            alt="User Avatar"
                            className="rounded-full w-10 h-10 cursor-pointer"
                        />
                        <span>{profileData?.firstName} {profileData?.lastName}</span> {/* Dynamically display user name */}
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
            <main className="px-4 py-8 mx-auto max-w-4xl">
                <h1 className="text-2xl font-semibold mb-6">Profile</h1>

                {loading ? (
                    <p className="text-gray-500">Loading profile data...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center mb-6">
                            <div className="relative">
                                <img
                                    src={profileData?.profilePictureUrl || "/api/placeholder/100/100"}
                                    alt="Profile"
                                    className="rounded-full w-24 h-24 mr-6"
                                />
                                <label
                                    htmlFor="profilePhotoUpload"
                                    className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-pointer hover:bg-blue-700"
                                >
                                    Change
                                </label>
                                <input
                                    id="profilePhotoUpload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleProfilePhotoUpload}
                                />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">{profileData?.firstName} {profileData?.lastName}</h2>
                                <p className="text-gray-600">{profileData?.email}</p>
                            </div>
                        </div>
                        {uploading && <p className="text-blue-500 mb-4">Uploading profile picture...</p>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Username</h3>
                                <p className="text-gray-900">{profileData?.userName || "N/A"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                                <p className="text-gray-900">{profileData?.appRole || "N/A"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                                <p className="text-gray-900">{profileData?.phoneNumber || "N/A"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Job Title</h3>
                                <p className="text-gray-900">{profileData?.jobTitle || "N/A"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Must Change Password</h3>
                                <p className="text-gray-900">{profileData?.mustChangePassword ? "Yes" : "No"}</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Profile;