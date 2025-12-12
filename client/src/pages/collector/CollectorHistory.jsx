import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../components/FirebaseConfig";
import LoadingSpinner from "../../utils/LoadingSpinner";
import {
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Mail,
  Phone,
  User,
  Calendar,
  Package,
  AlertCircle,
  ArrowLeft,
  Award,
} from "lucide-react";

const CollectorHistory = () => {
  const navigate = useNavigate();
  const [pickupHistory, setPickupHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lenderDetails, setLenderDetails] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== "collector") {
      navigate("/login");
      return;
    }

    const fetchPickupHistory = async () => {
      try {
        const q = query(
          collection(db, "ewasteSchedules"),
          where("collectorId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(
          q,
          async (snapshot) => {
            const pickupsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            const lenderPromises = pickupsData.map(async (pickup) => {
              if (pickup.lenderId) {
                try {
                  const lenderDoc = await getDoc(
                    doc(db, "users", pickup.lenderId)
                  );
                  if (lenderDoc.exists()) {
                    return {
                      lenderId: pickup.lenderId,
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
            setPickupHistory(pickupsData);
            setLoading(false);
          },
          (error) => {
            console.error("Error in real-time listener:", error);
            setError("Failed to load pickup history");
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error("Error fetching pickup history:", err);
        setError("Failed to load pickup history");
        setLoading(false);
      }
    };

    fetchPickupHistory();
  }, [navigate]);

  const statusFilters = [
    { value: "all", label: "All Pickups" },
    { value: "pending_verification", label: "Awaiting Verification" },
    { value: "verified", label: "Verified" },
  ];

  const getStatusStyle = (status) => {
    const styles = {
      pending_verification: "bg-orange-100 text-orange-800 border-orange-200",
      verified: "bg-blue-100 text-blue-800 border-blue-200",
      accepted: "bg-green-100 text-green-800 border-green-200",
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
      return dateString;
    }
  };

  const filteredPickups = pickupHistory.filter((pickup) =>
    statusFilter === "all" ? true : pickup.status === statusFilter
  );

  const openGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, "_blank");
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
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/collector")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Pickup History</h1>
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

        {/* Pickup Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPickups.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No pickups found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your completed pickups will appear here
              </p>
            </div>
          ) : (
            filteredPickups.map((pickup) => (
              <div
                key={pickup.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedPickup(pickup)}
              >
                {pickup.imageUrl && (
                  <div className="relative h-48">
                    <img
                      src={pickup.imageUrl}
                      alt={pickup.ewasteName}
                      className="w-full h-full object-cover"
                    />
                    {pickup.status === "verified" && (
                      <div className="absolute top-2 right-2">
                        <div className="flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                          <Award className="w-4 h-4 mr-1" />
                          Points Earned
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {pickup.ewasteName}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                        pickup.status
                      )}`}
                    >
                      {pickup.status === "pending_verification"
                        ? "Awaiting Verification"
                        : pickup.status.charAt(0).toUpperCase() +
                          pickup.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600">
                    {lenderDetails[pickup.lenderId] && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>
                          Lender: {lenderDetails[pickup.lenderId].name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Pickup: {formatDate(pickup.pickupTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Accepted: {formatDate(pickup.acceptedAt)}</span>
                    </div>
                  </div>

                  {pickup.status === "verified" && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                        <div>
                          <h4 className="font-medium text-green-900">
                            Pickup Verified
                          </h4>
                          <p className="text-sm text-green-800 mt-2">
                            Verified at: {formatDate(pickup.verifiedAt)}
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

        {/* Modal */}
        {selectedPickup && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPickup(null)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-2xl font-semibold text-gray-800">
                  Pickup Details
                </h3>
                <button
                  onClick={() => setSelectedPickup(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {selectedPickup.imageUrl && (
                  <img
                    src={selectedPickup.imageUrl}
                    alt={selectedPickup.ewasteName}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xl font-semibold text-gray-800">
                      {selectedPickup.ewasteName}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                        selectedPickup.status
                      )}`}
                    >
                      {selectedPickup.status === "pending_verification"
                        ? "Awaiting Verification"
                        : selectedPickup.status.charAt(0).toUpperCase() +
                          selectedPickup.status.slice(1)}
                    </span>
                  </div>

                  {lenderDetails[selectedPickup.lenderId] && (
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-5 h-5" />
                        <span className="font-medium">Lender:</span>
                        <span>
                          {lenderDetails[selectedPickup.lenderId].name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-5 h-5" />
                        <span className="font-medium">Email:</span>
                        <span>
                          {lenderDetails[selectedPickup.lenderId].email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-5 h-5" />
                        <span className="font-medium">Contact:</span>
                        <span>
                          {lenderDetails[selectedPickup.lenderId].contactNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">Pickup Time:</span>
                        <span>{formatDate(selectedPickup.pickupTime)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() =>
                      openGoogleMaps(
                        lenderDetails[selectedPickup.lenderId]?.latitude,
                        lenderDetails[selectedPickup.lenderId]?.longitude
                      )
                    }
                    className="mt-6 w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 
                    transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-5 h-5" />
                    View Location on Google Maps
                  </button>

                  {selectedPickup.status === "verified" && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                        <div>
                          <h4 className="font-medium text-green-900">
                            Pickup Verification Details
                          </h4>
                          <p className="text-sm text-green-800 mt-2">
                            Verified at: {formatDate(selectedPickup.verifiedAt)}
                          </p>
                          {selectedPickup.verificationNotes && (
                            <p className="text-sm text-green-800 mt-1">
                              Notes: {selectedPickup.verificationNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPickup.status === "pending_verification" && (
                    <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <h4 className="font-medium text-orange-900">
                            Awaiting Verification
                          </h4>
                          <p className="text-sm text-orange-800 mt-2">
                            The lender needs to verify this pickup. You'll be
                            notified once it's verified.
                          </p>
                        </div>
                      </div>
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

export default CollectorHistory;
