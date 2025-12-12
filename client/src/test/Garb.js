import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  getDocs,
  orderBy,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../components/FirebaseConfig";
import { AlertCircle, Clock, CheckCircle, Truck } from "lucide-react";

const CollectorLanding = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Set up real-time listener
    const q = query(
      collection(db, "ewasteSchedules"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const schedulesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSchedules(schedulesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error in real-time listener:", error);
        setError("Failed to load e-waste schedules");
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleAcceptPickup = async (scheduleId) => {
    try {
      const collectorData = JSON.parse(localStorage.getItem("user"));

      if (!collectorData) {
        throw new Error("Collector data not found");
      }

      const scheduleRef = doc(db, "ewasteSchedules", scheduleId);
      await updateDoc(scheduleRef, {
        status: "pending_verification",
        collectorId: auth.currentUser.uid,
        collectorName: collectorData.name || "Unnamed Collector",
        collectorEmail: collectorData.email,
        collectorPhone: collectorData.phone || "",
        acceptedAt: new Date().toISOString(),
      });

      setSuccessMessage(
        "Pickup request sent successfully! Awaiting lender verification."
      );
      setTimeout(() => setSuccessMessage(""), 5000); // Clear message after 5 seconds
    } catch (err) {
      console.error("Error accepting pickup:", err);
      setError(err.message || "Failed to accept pickup. Please try again.");
      setTimeout(() => setError(""), 5000); // Clear error after 5 seconds
    }
  };

  const getStatusBadge = (status, collectorId) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
            <Clock size={16} />
            Pending
          </span>
        );
      case "pending_verification":
        return (
          <span className="flex items-center gap-1 text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
            <AlertCircle size={16} />
            Awaiting Verification
          </span>
        );
      case "verified":
        return (
          <span className="flex items-center gap-1 text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            <CheckCircle size={16} />
            Verified
          </span>
        );
      case "accepted":
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-100 px-3 py-1 rounded-full">
            <Truck size={16} />
            In Progress
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Available E-waste Pickups
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 flex items-center gap-2 animate-fadeIn">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 rounded-md mb-6 flex items-center gap-2 animate-fadeIn">
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {schedule.imageUrl && (
              <div className="aspect-w-16 aspect-h-9 relative group">
                <img
                  src={schedule.imageUrl}
                  alt={schedule.ewasteName}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    View Details
                  </span>
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {schedule.ewasteName}
                </h3>
                {getStatusBadge(schedule.status, schedule.collectorId)}
              </div>

              <div className="space-y-3 mb-4">
                <p className="text-gray-600 flex items-center gap-2">
                  <Clock size={16} />
                  <span className="font-medium">Pickup Time:</span>{" "}
                  {formatDateTime(schedule.pickupTime)}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Location:</span>{" "}
                  {schedule.location || "To be confirmed"}
                </p>
              </div>

              {schedule.status === "pending" && (
                <button
                  onClick={() => handleAcceptPickup(schedule.id)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 
                  transition-all duration-200 transform hover:-translate-y-1 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  flex items-center justify-center gap-2"
                >
                  <Truck size={20} />
                  Accept Pickup
                </button>
              )}

              {schedule.status === "pending_verification" &&
                schedule.collectorId === auth.currentUser?.uid && (
                  <div className="bg-orange-50 border border-orange-200 text-orange-700 p-4 rounded-md">
                    <p className="font-medium mb-1">Verification Pending</p>
                    <p className="text-sm">
                      Waiting for lender to verify your request.
                    </p>
                  </div>
                )}

              {schedule.status === "verified" &&
                schedule.collectorId === auth.currentUser?.uid && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md">
                    <p className="font-medium mb-1">Request Verified!</p>
                    <p className="text-sm">You can proceed with the pickup.</p>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>

      {schedules.length === 0 && !loading && (
        <div className="text-center text-gray-600 mt-8 p-8 bg-gray-50 rounded-lg">
          <Truck size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl font-medium">No e-waste pickups available</p>
          <p className="text-sm mt-2">
            Check back later for new pickup requests
          </p>
        </div>
      )}
    </div>
  );
};

export default CollectorLanding;
