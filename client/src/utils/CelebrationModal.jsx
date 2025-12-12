import React from "react";
import { Award, ShoppingBag } from "lucide-react";

const CelebrationModal = ({ isOpen, onClose, item }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 animate-fade-in" />

      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti Animation Dots */}
        <div className="absolute -top-2 left-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
        <div className="absolute -top-4 right-8 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-100" />
        <div className="absolute top-2 right-0 w-2 h-2 bg-green-400 rounded-full animate-ping delay-200" />
        <div className="absolute top-8 -left-2 w-2 h-2 bg-purple-400 rounded-full animate-ping delay-300" />

        {/* Main Content */}
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 rounded-2xl text-center">
          {/* Success Icon */}
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-25" />
            <div className="relative bg-green-500 text-white rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-8 h-8" />
            </div>
          </div>

          {/* Celebration Text */}
          <h2 className="text-3xl font-bold text-gray-800 mb-4 animate-bounce">
            🎉 Wonderful! 🎉
          </h2>

          <div className="space-y-4">
            <p className="text-xl text-gray-700">
              You've successfully redeemed
            </p>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 shadow-inner">
              <h3 className="text-2xl font-semibold text-gray-800">
                {item?.name}
              </h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-lg font-bold text-gray-700">
                  {item?.points} points
                </span>
              </div>
            </div>

            <p className="text-gray-600 italic">
              Your sustainable choices make a real difference!
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 transform hover:scale-105"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default CelebrationModal;
