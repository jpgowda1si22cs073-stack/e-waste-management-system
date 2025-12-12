import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDoc, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from "../../components/FirebaseConfig";
import { ShoppingCart, Award, ChevronLeft, Loader2 } from "lucide-react";
import CelebrationModal from "../../utils/CelebrationModal";

const LenderStore = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCelebration, setShowCelebration] = useState(false);
  const [purchasedItem, setPurchasedItem] = useState(null);
  const [processingItemId, setProcessingItemId] = useState(null);

  const storeItems = [
    {
      id: 1,
      name: "Eco-Friendly Water Bottle",
      points: 0, // Set to 0 for testing
      description: "Premium stainless steel, keeps drinks cold for 24 hours",
      category: "lifestyle",
      imageUrl:
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=300&h=200",
    },
    {
      id: 2,
      name: "Plant Seeds Kit",
      points: 300,
      description: "Organic vegetable and flower seeds with guide",
      category: "garden",
      imageUrl:
        "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=300&h=200",
    },
    {
      id: 3,
      name: "Recycling Bin Set",
      points: 800,
      description: "3-compartment sorting system with labels",
      category: "home",
      imageUrl:
        "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=300&h=200",
    },
    {
      id: 4,
      name: "Solar Power Bank",
      points: 1000,
      description: "10000mAh capacity with dual USB ports",
      category: "electronics",
      imageUrl:
        "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=300&h=200",
    },
    {
      id: 5,
      name: "Bamboo Utensil Set",
      points: 400,
      description: "Eco-friendly dining set with carrying case",
      category: "lifestyle",
      imageUrl:
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&h=200",
    },
  ];

  const categories = [
    { id: "all", name: "All Items" },
    { id: "lifestyle", name: "Lifestyle" },
    { id: "garden", name: "Garden" },
    { id: "home", name: "Home" },
    { id: "electronics", name: "Electronics" },
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "lender") {
      navigate("/login");
      return;
    }
    fetchUserPoints(user.uid);

    // Cleanup function
    return () => {
      setShowCelebration(false);
      setPurchasedItem(null);
    };
  }, [navigate]);

  const fetchUserPoints = async (userId) => {
    try {
      const userDoc = doc(db, "users", userId);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        setPoints(userSnapshot.data().points || 0);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching points:", err);
      setError("Failed to fetch points balance");
      setLoading(false);
    }
  };

  const handlePurchase = async (item) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (points < item.points) {
      setError("Insufficient points for this purchase");
      return;
    }

    setProcessingItemId(item.id);

    try {
      const userRef = doc(db, "users", user.uid);
      const newPoints = points - item.points;

      await updateDoc(userRef, {
        points: newPoints,
      });

      await addDoc(collection(db, "purchases"), {
        userId: user.uid,
        itemId: item.id,
        itemName: item.name,
        pointsSpent: item.points,
        purchaseDate: new Date().toISOString(),
      });

      setPoints(newPoints);
      setPurchasedItem(item);
      setShowCelebration(true);
    } catch (err) {
      console.error("Error making purchase:", err);
      setError("Failed to complete purchase");
    } finally {
      setProcessingItemId(null);
    }
  };

  const filteredItems = storeItems.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
      <div className="max-w-7xl mx-auto px-2 py-4">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => navigate("/lender")}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Rewards Store
            </h1>
          </div>
          <div className="flex items-center space-x-2 bg-white px-2 py-2 md:px-4 md:py-4 rounded-lg shadow-sm">
            <Award className="w-6 h-6 text-yellow-500" />
            <span className="text-xl font-semibold text-gray-900">
              {points} Points
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === category.id
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Store Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-200"
            >
              <div className="relative h-48 bg-gray-200">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/300x200?text=Product+Image";
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-lg font-bold text-gray-900">
                      {item.points} points
                    </span>
                  </div>
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={
                      points < item.points || processingItemId === item.id
                    }
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      processingItemId === item.id
                        ? "bg-green-400 text-white cursor-wait"
                        : points >= item.points
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {processingItemId === item.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>Redeem</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        item={purchasedItem}
      />
    </div>
  );
};

export default LenderStore;
