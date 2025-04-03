import React, { useEffect, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Memoized Password Modal
const PasswordChangeModal = memo(({ show, passwordData, handleChange, handleSubmit, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Password</button>
          </div>
        </form>
      </div>
    </div>
  );
});

const Profile = () => {
  const navigate = useNavigate();
  const url = "http://localhost:5282";
  const token = localStorage.getItem("token");

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${url}/api/Profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(response.data);

        // If profilePictureUrl is returned, update localStorage
        if (response.data?.profilePictureUrl) {
          localStorage.setItem("profilePictureUrl", response.data.profilePictureUrl);
        }
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
          "Content-Type": "multipart/form-data"
        }
      });

      const imageUrl = response.data.url;
      const fullUrl = imageUrl.startsWith("http") ? imageUrl : `${url}/${imageUrl.replace(/^\/+/, "")}`;

      // Update both state and localStorage
      setProfileData((prev) => ({ ...prev, profilePictureUrl: fullUrl }));
      localStorage.setItem("profilePictureUrl", fullUrl);

      alert("Profile picture updated!");
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      await axios.post(`${url}/api/Auth/change-password`, passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Password updated successfully.");
    } catch (err) {
      console.error("Error updating password:", err);
      alert("Failed to update password.");
    } finally {
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }
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