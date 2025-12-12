import React, { useState } from "react";
import { auth, db } from "../FirebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  Check,
  Loader,
  ArrowLeft,
  XCircle,
} from "lucide-react";

// Error Message Component
const ErrorMessage = ({ type, message }) => {
  const getErrorContent = () => {
    switch (type) {
      case "auth/email-already-in-use":
        return {
          title: "Email Already Registered",
          message:
            "This email address is already associated with an account. Please try logging in or use a different email.",
          action: "Try logging in or use another email address",
        };

      case "auth/invalid-email":
        return {
          title: "Invalid Email Format",
          message:
            "Please enter a valid email address (e.g., example@domain.com)",
          action: "Check and correct your email address",
        };

      case "auth/weak-password":
        return {
          title: "Password Too Weak",
          message:
            "Your password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.",
          action: "Create a stronger password",
        };

      case "location/access-denied":
        return {
          title: "Location Access Denied",
          message:
            "We need your location to connect you with nearby e-waste collectors. Please enable location access in your browser settings.",
          action: "Enable location access and try again",
        };

      case "network/error":
        return {
          title: "Network Error",
          message:
            "Unable to connect to the server. Please check your internet connection.",
          action: "Check your connection and try again",
        };

      case "validation/phone":
        return {
          title: "Invalid Phone Number",
          message:
            "Please enter a valid 10-digit phone number without spaces or special characters.",
          action: "Enter a valid phone number",
        };

      case "validation/password-match":
        return {
          title: "Passwords Don't Match",
          message:
            "The passwords you entered don't match. Please make sure both passwords are identical.",
          action: "Re-enter your passwords",
        };

      case "validation/name":
        return {
          title: "Invalid Name",
          message: "Please enter your full name without special characters.",
          action: "Enter your full name",
        };

      case "validation/location":
        return {
          title: "Location Required",
          message:
            "Location access is required for lenders to connect with nearby collectors.",
          action: "Enable location access",
        };

      default:
        return {
          title: "Error",
          message: message || "An unexpected error occurred. Please try again.",
          action: "Try again or contact support if the problem persists",
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <XCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-red-800">
            {errorContent.title}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{errorContent.message}</p>
          </div>
          <div className="mt-1 text-sm text-red-600">
            <p className="font-medium">Suggestion: {errorContent.action}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formErrors, setFormErrors] = useState({});

  const validatePassword = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^A-Za-z0-9]/)) strength++;
    return strength;
  };

  const fetchLocation = () => {
    if (navigator.geolocation) {
      const locationButton = document.getElementById("location-button");
      locationButton.disabled = true;
      locationButton.innerHTML =
        '<span class="animate-spin">↻</span> Fetching...';

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          locationButton.disabled = false;
          locationButton.innerHTML = "Update Location";
        },
        (error) => {
          setFormErrors((prev) => ({
            ...prev,
            location: { type: "location/access-denied" },
          }));
          locationButton.disabled = false;
          locationButton.innerHTML = "Retry Location";
        }
      );
    } else {
      setFormErrors((prev) => ({
        ...prev,
        location: {
          type: "location/access-denied",
          message: "Your browser does not support geolocation.",
        },
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordStrength(validatePassword(value));
    }

    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = { type: "validation/name" };
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = { type: "auth/invalid-email" };
    }

    if (formData.password.length < 8) {
      errors.password = { type: "auth/weak-password" };
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = { type: "validation/password-match" };
    }

    if (!formData.contactNumber.match(/^\d{10}$/)) {
      errors.contactNumber = { type: "validation/phone" };
    }

    if (role === "lender" && !formData.latitude) {
      errors.location = { type: "validation/location" };
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        contactNumber: formData.contactNumber,
        role,
        latitude: role === "lender" ? formData.latitude : null,
        longitude: role === "lender" ? formData.longitude : null,
        createdAt: new Date().toISOString(),
      });

      setLoading(false);
      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      setFormErrors((prev) => ({
        ...prev,
        submit: { type: error.code || "unknown", message: error.message },
      }));
      setLoading(false);
    }
  };

  const renderPasswordStrength = () => {
    const strengthColors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-green-500",
    ];
    const strengthTexts = ["Weak", "Fair", "Good", "Strong"];

    return (
      <div className="mt-2">
        <div className="flex gap-1 mb-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`h-1 w-full rounded-full ${
                i < passwordStrength
                  ? strengthColors[passwordStrength - 1]
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        {passwordStrength > 0 && (
          <span
            className={`text-sm ${strengthColors[passwordStrength - 1].replace(
              "bg-",
              "text-"
            )}`}
          >
            {strengthTexts[passwordStrength - 1]}
          </span>
        )}
      </div>
    );
  };

  const renderForm = () => {
    if (!role) return null;

    return (
      <div className="bg-white shadow-xl rounded-2xl px-8 pt-8 pb-10 w-full max-w-lg transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => setRole("")}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h2 className="text-3xl font-bold text-green-600">
            {role === "lender"
              ? "Lender Registration"
              : "Collector Registration"}
          </h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="relative">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                placeholder="Enter your full name"
              />
            </div>
            {formErrors.name && <ErrorMessage {...formErrors.name} />}
          </div>

          <div className="relative">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                placeholder="Enter your email"
              />
            </div>
            {formErrors.email && <ErrorMessage {...formErrors.email} />}
          </div>

          <div className="relative">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Contact Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                placeholder="Enter your contact number"
              />
            </div>
            {formErrors.contactNumber && (
              <ErrorMessage {...formErrors.contactNumber} />
            )}
          </div>

          <div className="relative">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                placeholder="Create a password"
              />
            </div>
            {renderPasswordStrength()}
            {formErrors.password && <ErrorMessage {...formErrors.password} />}
          </div>

          <div className="relative">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                placeholder="Confirm your password"
              />
            </div>
            {formErrors.confirmPassword && (
              <ErrorMessage {...formErrors.confirmPassword} />
            )}
          </div>

          {role === "lender" && (
            <div className="relative">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Location Access
              </label>
              <button
                id="location-button"
                type="button"
                onClick={fetchLocation}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                {formData.latitude ? "Update Location" : "Fetch Location"}
              </button>
              {formData.latitude && formData.longitude && (
                <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                  <Check className="w-4 h-4" />
                  <span>Location fetched successfully!</span>
                </div>
              )}
              {formErrors.location && <ErrorMessage {...formErrors.location} />}
            </div>
          )}

          {formErrors.submit && <ErrorMessage {...formErrors.submit} />}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              "Complete Registration"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Join Our E-Waste Management Platform
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose your role and start contributing to a sustainable future
            through responsible e-waste management
          </p>
        </div>

        <div className="flex flex-col items-center space-y-8">
          {!role && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <button
                onClick={() => setRole("lender")}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-left group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-green-100 group-hover:bg-green-500 transition-colors">
                    <User className="w-6 h-6 text-green-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Register as Lender
                  </h3>
                </div>
                <p className="text-gray-600">
                  Register as an individual or organization looking to
                  responsibly dispose of electronic waste. Get rewarded for your
                  contribution to sustainable practices.
                </p>
                <div className="mt-4 flex items-center text-green-600 group-hover:text-green-700">
                  <span className="font-semibold">Get Started</span>
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </div>
              </button>

              <button
                onClick={() => setRole("collector")}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-left group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-blue-100 group-hover:bg-blue-500 transition-colors">
                    <MapPin className="w-6 h-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Register as Collector
                  </h3>
                </div>
                <p className="text-gray-600">
                  Join as a certified e-waste collector. Help collect and
                  process electronic waste while maintaining environmental
                  standards.
                </p>
                <div className="mt-4 flex items-center text-blue-600 group-hover:text-blue-700">
                  <span className="font-semibold">Get Started</span>
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </div>
              </button>
            </div>
          )}

          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default Register;
