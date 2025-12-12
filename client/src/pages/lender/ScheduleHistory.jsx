import React, { useState, useEffect } from "react";
import { db } from "../../components/FirebaseConfig";
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  getDocs,
  increment,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../utils/LoadingSpinner";
import {
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Award,
} from "lucide-react";

const ScheduleHistory = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "lender") {
      navigate("/login");
      return;
    }

    fetchSchedules(user.uid);
  }, [navigate]);

  const fetchSchedules = async (userId) => {
    try {
      if (!userId) {
        throw new Error("User ID not found");
      }

      // Query without orderBy first to avoid index issues
      const schedulesQuery = query(
        collection(db, "ewasteSchedules"),
        where("lenderId", "==", userId)
      );

      const querySnapshot = await getDocs(schedulesQuery);
      const schedulesData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => {
          // Sort by createdAt in descending order (newest first)
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA;
        });

      setSchedules(schedulesData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setError("Failed to fetch schedules. Please try again later.");
      setLoading(false);
    }
  };

  const statusFilters = [
    { value: "all", label: "All Schedules" },
    { value: "pending", label: "Pending" },
    { value: "pending_verification", label: "Awaiting Verification" },
    { value: "verified", label: "Verified" },
  ];

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      pending_verification: "bg-orange-100 text-orange-800 border-orange-200",
      verified: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString; // Return original string if formatting fails
    }
  };

  const filteredSchedules = schedules.filter((schedule) =>
    statusFilter === "all" ? true : schedule.status === statusFilter
  );

  const handleVerifyPickup = async (scheduleId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userRef = doc(db, "users", user.uid);
      const scheduleRef = doc(db, "ewasteSchedules", scheduleId);

      // Update schedule status
      await updateDoc(scheduleRef, {
        status: "verified",
        verifiedAt: new Date().toISOString(),
      });

      // Award points to user
      await updateDoc(userRef, {
        points: increment(100), // Firebase increment operator
      });

      // Update local state
      setSchedules((prevSchedules) =>
        prevSchedules.map((schedule) =>
          schedule.id === scheduleId
            ? {
                ...schedule,
                status: "verified",
                verifiedAt: new Date().toISOString(),
              }
            : schedule
        )
      );
    } catch (err) {
      console.error("Error verifying pickup:", err);
      setError("Failed to verify pickup. Please try again.");
    }
  };

  // Update the schedule card in ScheduleHistory.js
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "pending_verification":
        return "bg-orange-100 text-orange-800";
      case "verified":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-red-100 text-red-800";
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
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/lender")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Schedule History
            </h1>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === filter.value
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Schedule Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-xl p-6 space-y-4"
              >
                <div className="h-48 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : filteredSchedules.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No schedules found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new schedule.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/lender/schedule")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  New Schedule
                </button>
              </div>
            </div>
          ) : (
            filteredSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-200"
              >
                {schedule.imageUrl && (
                  <div className="relative h-48">
                    <img
                      src={schedule.imageUrl}
                      alt={schedule.ewasteName}
                      className="w-full h-full object-cover"
                    />
                    {schedule.status === "verified" && (
                      <div className="absolute top-2 right-2">
                        <div className="flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                          <Award className="w-4 h-4 mr-1" />
                          +100 points
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {schedule.ewasteName}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                        schedule.status
                      )}`}
                    >
                      {schedule.status === "pending_verification"
                        ? "Awaiting Verification"
                        : schedule.status.charAt(0).toUpperCase() +
                          schedule.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Scheduled: {formatDate(schedule.pickupTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Created: {formatDate(schedule.createdAt)}</span>
                    </div>
                  </div>

                  {schedule.status === "pending_verification" && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <User className="w-5 h-5 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900">
                            Collector Details
                          </h4>
                          <p className="text-sm text-blue-800 mt-1">
                            {schedule.collectorName}
                          </p>
                          <p className="text-sm text-blue-800">
                            {schedule.collectorEmail}
                          </p>
                          {schedule.collectorPhone && (
                            <p className="text-sm text-blue-800">
                              {schedule.collectorPhone}
                            </p>
                          )}
                          <button
                            onClick={() => handleVerifyPickup(schedule.id)}
                            className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Verify Pickup</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {schedule.status === "verified" && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                        <div>
                          <h4 className="font-medium text-green-900">
                            Verified Collector
                          </h4>
                          <p className="text-sm text-green-800 mt-1">
                            {schedule.collectorName}
                          </p>
                          <p className="text-sm text-green-800">
                            {schedule.collectorEmail}
                          </p>
                          <p className="text-sm text-green-800 mt-2">
                            Verified at: {formatDate(schedule.verifiedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleHistory;
