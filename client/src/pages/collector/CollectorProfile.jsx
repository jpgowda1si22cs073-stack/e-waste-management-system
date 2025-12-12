import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../components/FirebaseConfig";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../utils/LoadingSpinner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Check,
  X,
  AlertCircle,
  Camera,
  ArrowLeft,
} from "lucide-react";

const CollectorProfile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editedData, setEditedData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== "collector") {
      navigate("/login");
      return;
    }

    const fetchProfileData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error("No user authenticated");

        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileData(userData);
          setEditedData({
            name: userData.name || "",
            email: userData.email || "",
            contactNumber: userData.contactNumber || "",
            latitude: userData.latitude || null,
            longitude: userData.longitude || null,
          });
        } else {
          throw new Error("User data not found");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
        if (err.message === "No user authenticated") navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationUpdate = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setEditedData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          setError("Failed to get location. Please enable location services.");
          setTimeout(() => setError(""), 3000);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleSave = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("No user authenticated");

      await updateDoc(doc(db, "users", userId), {
        name: editedData.name,
        contactNumber: editedData.contactNumber,
        latitude: editedData.latitude,
        longitude: editedData.longitude,
      });

      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...userData,
            name: editedData.name,
            phone: editedData.contactNumber,
          })
        );
      }

      setProfileData((prev) => ({ ...prev, ...editedData }));
      setEditMode(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
      if (err.message === "No user authenticated") navigate("/login");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" color="blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate("/collector")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative p-8 bg-gradient-to-br from-green-500 to-blue-600">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
            <div className="relative flex justify-between items-start">
              <div>
                <div className="h-24 w-24 rounded-full bg-white shadow-lg flex items-center justify-center mb-4">
                  <Camera className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {profileData?.name}
                </h2>
                <p className="text-green-50">Manage your account information</p>
              </div>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Edit2 size={20} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Check size={20} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <X size={20} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-8">
            {successMessage && (
              <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg">
                <Check className="h-5 w-5" />
                <p>{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            )}

            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <User className="text-green-600" />
                  Full Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="name"
                    value={editedData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-800 text-lg font-medium">
                    {profileData?.name}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <Mail className="text-green-600" />
                  Email Address
                </label>
                <p className="text-gray-800 text-lg font-medium">
                  {profileData?.email}
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <Phone className="text-green-600" />
                  Contact Number
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    name="contactNumber"
                    value={editedData.contactNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter your contact number"
                  />
                ) : (
                  <p className="text-gray-800 text-lg font-medium">
                    {profileData?.contactNumber || "Not set"}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <MapPin className="text-green-600" />
                  Location
                </label>
                {editMode ? (
                  <button
                    onClick={handleLocationUpdate}
                    className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-600 px-4 py-3 rounded-lg hover:bg-green-100 transition-all duration-200 border border-green-200"
                  >
                    <MapPin size={20} />
                    Update Location
                  </button>
                ) : (
                  <p className="text-gray-800 text-lg font-medium">
                    {profileData?.latitude
                      ? `${profileData.latitude.toFixed(
                          6
                        )}, ${profileData.longitude.toFixed(6)}`
                      : "Location not set"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorProfile;
