import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Clock,
  Award,
  Zap,
  LogOut,
  Menu,
  RecycleIcon,
  Leaf,
  ShieldCheck,
  Recycle,
} from "lucide-react";

const LenderHome = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md">
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
                onClick={() => navigate("/lender/profile")}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => navigate("/lender/history")}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <Clock className="w-5 h-5" />
                <span>History</span>
              </button>
              <button
                onClick={() => navigate("/lender/reward")}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <Award className="w-5 h-5" />
                <span>Rewards</span>
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
                <Menu className="w-6 h-6" />
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
                  navigate("/lender/profile");
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  navigate("/lender/history");
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <Clock className="w-5 h-5" />
                <span>History</span>
              </button>
              <button
                onClick={() => {
                  navigate("/lender/reward");
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <Award className="w-5 h-5" />
                <span>Rewards</span>
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

      {/* Hero Section */}
      <div className="bg-gradient-to-r  py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Welcome to E-Waste Management
            </h2>
            <p className="text-xl ">
              Make a positive impact on the environment by responsibly disposing
              of your electronic waste
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Primary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Analysis Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Analyze E-Waste
              </h2>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-gray-600 mb-6">
              Upload and analyze your e-waste items to get detailed information
              about their components and recycling potential.
            </p>
            <button
              onClick={() => navigate("/lender/analyse")}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>Start Analysis</span>
            </button>
          </div>

          {/* Schedule Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Schedule Pickup
              </h2>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-gray-600 mb-6">
              Schedule a pickup for your e-waste items. Our certified collectors
              will ensure proper handling and recycling.
            </p>
            <button
              onClick={() => navigate("/lender/schedule")}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Clock className="w-5 h-5" />
              <span>Schedule Now</span>
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <RecycleIcon className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Responsible Recycling
            </h3>
            <p className="text-gray-600">
              Your e-waste is processed following the highest environmental
              standards
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <Leaf className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Environmental Impact</h3>
            <p className="text-gray-600">
              Contribute to reducing electronic waste and protecting our planet
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <ShieldCheck className="w-12 h-12 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Process</h3>
            <p className="text-gray-600">
              Your data is safely wiped before recycling following industry
              standards
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LenderHome;
