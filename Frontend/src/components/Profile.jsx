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
        <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800" onClick={() => navigate("/home")}>
          Home
        </button>
        <div className="flex items-center gap-4 text-white">
          <img
            src={profileData?.profilePictureUrl || "/api/placeholder/40/40"}
            alt="Avatar"
            className="rounded-full w-10 h-10 object-cover"
          />
          <span>{profileData?.firstName} {profileData?.lastName}</span>
          <button className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Main */}
      <main className="px-4 py-8 mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold mb-6">Profile</h1>

        {loading ? (
          <p className="text-gray-500">Loading profile...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="bg-white p-6 shadow rounded-lg">
            <div className="flex items-center mb-6">
              <div className="relative">
                <img
                  src={profileData?.profilePictureUrl || "/api/placeholder/100/100"}
                  alt="Profile"
                  className="rounded-full w-24 h-24 object-cover"
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
              <div className="ml-6">
                <h2 className="text-xl font-semibold">{profileData?.firstName} {profileData?.lastName}</h2>
                <p className="text-gray-600">{profileData?.email}</p>
              </div>
            </div>
            {uploading && <p className="text-blue-500 mb-4">Uploading...</p>}
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
            <div className="mt-6">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Change Password
              </button>
            </div>
          </div>
        )}
      </main>

      <PasswordChangeModal
        show={showPasswordModal}
        passwordData={passwordData}
        handleChange={handlePasswordChange}
        handleSubmit={handlePasswordSubmit}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default Profile;