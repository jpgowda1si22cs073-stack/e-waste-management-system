import React from "react";

const LoadingSpinner = ({ size = "normal", color = "primary" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    normal: "w-8 h-8",
    large: "w-12 h-12",
  };

  const colorClasses = {
    primary: "text-blue-600",
    secondary: "text-gray-600",
    white: "text-white",
  };

  return (
    <div className="relative">
      <div
        className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}
        style={{
          borderRightColor: "currentColor",
          borderBottomColor: "currentColor",
          borderLeftColor: "currentColor",
        }}
      />
    </div>
  );
};

export default LoadingSpinner;
