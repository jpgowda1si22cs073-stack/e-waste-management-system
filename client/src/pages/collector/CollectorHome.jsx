import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  updateDoc,
  doc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../components/FirebaseConfig";
import {
  User,
  Clock,
  Package,
  Truck,
  MapPin,
  History,
  LogOut,
  Menu,
  X,
  Calendar,
  Recycle,
} from "lucide-react";
import LoadingSpinner from "../../utils/LoadingSpinner";

const CollectorHome = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lenderDetails, setLenderDetails] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchSchedules = async () => {
      const q = query(
        collection(db, "ewasteSchedules"),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          const schedulesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const lenderPromises = schedulesData.map(async (schedule) => {
            if (schedule.lenderId) {
              try {
                const lenderDoc = await getDoc(
                  doc(db, "users", schedule.lenderId)
                );
                if (lenderDoc.exists()) {
                  return {
                    lenderId: schedule.lenderId,
                    ...lenderDoc.data(),
                  };
                }
              } catch (err) {
                console.error("Error fetching lender details:", err);
              }
            }
            return null;
          });

          const lenderResults = await Promise.all(lenderPromises);
          const lenderMap = {};
          lenderResults.forEach((lender) => {
            if (lender) {
              lenderMap[lender.lenderId] = lender;
            }
          });

          setLenderDetails(lenderMap);
          setSchedules(schedulesData);
          setLoading(false);
        },
        (error) => {
          console.error("Error in real-time listener:", error);
          setError("Failed to load e-waste schedules");
          setLoading(false);
        }
      );

      return () => unsubscribe();
    };

    fetchSchedules();
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Error accepting pickup:", err);
      setError(err.message || "Failed to accept pickup. Please try again.");
      setTimeout(() => setError(""), 5000);
    }
  };

  const statusFilters = [
    { value: "all", label: "All Schedules" },
    { value: "pending", label: "Available" },
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTimeRemaining = (pickupTime) => {
    const pickup = new Date(pickupTime);
    const timeDiff = pickup - currentTime;

    if (timeDiff <= 0) return "Expired";

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const openImageInNewTab = (e, imageUrl) => {
    e.preventDefault();
    e.stopPropagation();
    if (imageUrl) {
      window.location.href = imageUrl;
    }
  };

  const filteredSchedules = schedules.filter((schedule) =>
    statusFilter === "all" ? true : schedule.status === statusFilter
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" color="blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-8">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Recycle className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold ml-1">
                <span className="text-green-500">Eco</span>
                <span className="text-blue-500">Collect</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate("/collector/profile")}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => navigate("/collector/history")}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <History className="w-5 h-5" />
                <span>History</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  navigate("/collector/profile");
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  navigate("/collector/history");
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <History className="w-5 h-5" />
                <span>History</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Available Pickups
            </h1>
          </div>

          <div className="flex items-center space-x-4">
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
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Schedule Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedules.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No schedules found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Check back later for new pickup requests
              </p>
            </div>
          ) : (
            filteredSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedSchedule(schedule)}
              >
                {schedule.imageUrl && (
                  <div className="relative h-48">
                    <img
                      src={schedule.imageUrl}
                      alt={schedule.ewasteName}
                      className="w-full h-full object-cover"
                    />
                    {schedule.status === "pending" && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-white/90 backdrop-blur-sm shadow-md rounded-full px-3 py-1.5">
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {calculateTimeRemaining(schedule.pickupTime)}
                            </span>
                          </div>
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
                    {lenderDetails[schedule.lenderId] && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>
                          Lender: {lenderDetails[schedule.lenderId].name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Pickup: {formatDateTime(schedule.pickupTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Created: {formatDateTime(schedule.createdAt)}</span>
                    </div>
                  </div>

                  {schedule.status === "pending" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptPickup(schedule.id);
                      }}
                      className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 
                      transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Truck className="w-5 h-5" />
                      Accept Pickup
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Modal */}
        {selectedSchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Pickup Details
                  </h3>
                  <button
                    onClick={() => setSelectedSchedule(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {selectedSchedule.imageUrl && (
                  <div className="cursor-pointer relative group mb-6">
                    <a
                      href={selectedSchedule.imageUrl}
                      onClick={(e) =>
                        openImageInNewTab(e, selectedSchedule.imageUrl)
                      }
                      className="block"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={selectedSchedule.imageUrl}
                        alt={selectedSchedule.ewasteName}
                        className="w-full h-64 object-cover rounded-lg transition-opacity group-hover:opacity-90"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                          Click to view full image
                        </div>
                      </div>
                    </a>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedSchedule.ewasteName}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                        selectedSchedule.status
                      )}`}
                    >
                      {selectedSchedule.status === "pending_verification"
                        ? "Awaiting Verification"
                        : selectedSchedule.status.charAt(0).toUpperCase() +
                          selectedSchedule.status.slice(1)}
                    </span>
                  </div>

                  {lenderDetails[selectedSchedule.lenderId] && (
                    <div className="space-y-4">
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <User className="w-5 h-5 text-blue-500 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-900">
                              Lender Details
                            </h4>
                            <div className="mt-3 space-y-2">
                              <p className="text-sm text-blue-800">
                                Name:{" "}
                                {lenderDetails[selectedSchedule.lenderId].name}
                              </p>
                              <p className="text-sm text-blue-800">
                                Email:{" "}
                                {lenderDetails[selectedSchedule.lenderId].email}
                              </p>
                              {lenderDetails[selectedSchedule.lenderId]
                                .contactNumber && (
                                <p className="text-sm text-blue-800">
                                  Phone:{" "}
                                  {
                                    lenderDetails[selectedSchedule.lenderId]
                                      .contactNumber
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <Clock className="w-5 h-5 text-gray-500" />
                          <div>
                            <span className="text-sm font-medium">
                              Pickup Time
                            </span>
                            <p className="text-sm">
                              {formatDateTime(selectedSchedule.pickupTime)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div>
                            <span className="text-sm font-medium">
                              Created At
                            </span>
                            <p className="text-sm">
                              {formatDateTime(selectedSchedule.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {selectedSchedule.description && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Package className="w-5 h-5 text-gray-500 mt-1" />
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                Description
                              </span>
                              <p className="mt-1 text-sm text-gray-600">
                                {selectedSchedule.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedSchedule.status === "pending" && (
                        <button
                          onClick={() =>
                            handleAcceptPickup(selectedSchedule.id)
                          }
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 
                          transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <Truck className="w-5 h-5" />
                          Accept Pickup
                        </button>
                      )}

                      {lenderDetails[selectedSchedule.lenderId]?.latitude && (
                        <button
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps?q=${
                                lenderDetails[selectedSchedule.lenderId]
                                  .latitude
                              },${
                                lenderDetails[selectedSchedule.lenderId]
                                  .longitude
                              }`,
                              "_blank"
                            )
                          }
                          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 
                          transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <MapPin className="w-5 h-5" />
                          View Location on Google Maps
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectorHome;
