import React, { useState } from "react";
import { db, auth } from "../../components/FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowLeft, Upload, Calendar, Loader2 } from "lucide-react";

const ScheduleEwaste = () => {
  const navigate = useNavigate();
  const [ewasteName, setEwasteName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      let imageUrl = "";
      if (imageFile) {
        const storage = getStorage();
        const imageRef = ref(
          storage,
          `ewaste-images/${auth.currentUser.uid}/${Date.now()}-${
            imageFile.name
          }`
        );
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "ewasteSchedules"), {
        ewasteName,
        imageUrl,
        pickupTime,
        status: "pending",
        createdAt: new Date().toISOString(),
        lenderId: auth.currentUser?.uid,
      });

      setSuccessMessage("E-waste pickup scheduled successfully!");
      setEwasteName("");
      setImageFile(null);
      setImagePreview("");
      setPickupTime("");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Error scheduling pickup. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Schedule E-waste Pickup
          </h1>
          <button
            onClick={() => navigate("/lender")}
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* E-waste Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-waste Name
              </label>
              <input
                type="text"
                value={ewasteName}
                onChange={(e) => setEwasteName(e.target.value)}
                required
                placeholder="Enter the name of your e-waste item"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 transition-colors cursor-pointer"
                onClick={handleImageClick}
              >
                <div className="space-y-2 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <span className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-700">
                      Upload a file
                    </span>
                    <p className="pl-1">or click anywhere in this box</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                id="fileInput"
                onChange={handleImageChange}
                required
                className="sr-only"
              />
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-64 object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Pickup Time Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Pickup Time
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="datetime-local"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5" />
                  <span>Schedule Pickup</span>
                </>
              )}
            </button>
          </form>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleEwaste;
