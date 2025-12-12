import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white shadow-md z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold">
                <span className="text-green-500">Eco</span>
                <span className="text-blue-500">Collect</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6">
              <a
                href="login"
                className="text-gray-600 hover:text-green-600 transition"
              >
                Login
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-green-600 transition"
              >
                How It Works
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="login"
              className="block px-3 py-2 text-gray-600 hover:bg-gray-100"
            >
              Login
            </a>
            <a
              href="#how-it-works"
              className="block px-3 py-2 text-gray-600 hover:bg-gray-100"
            >
              How It Works
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="pt-20 bg-gradient-to-r from-green-500 to-blue-600"
      >
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Smart E-Waste Recycling Made Simple
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8">
            Join the movement for responsible electronic waste management
          </p>
          <button
            className="bg-white text-green-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition"
            onClick={() => navigate("/login")}
          >
            Register With Us Now!
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose EcoCollect?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-4">AI-Powered Chatbot</h3>
              <p className="text-gray-600">
                Dedicated e-waste recycling assistant for quick assistance
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-bold mb-4">Eco-Friendly Process</h3>
              <p className="text-gray-600">
                100% sustainable recycling methods for minimal environmental
                impact
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-4">Global Impact</h3>
              <p className="text-gray-600">
                Contributing to worldwide sustainability goals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Simple 3-Step Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Schedule Pickup</h3>
              <p className="text-gray-600">
                Use our app to request a collection
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">We Collect</h3>
              <p className="text-gray-600">Our team picks up your e-waste</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Recycle & Reward</h3>
              <p className="text-gray-600">Get rewards for your contribution</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          {/* Flex container for Quick Links and Social Media */}
          <div className="flex flex-col sm:flex-row justify-between gap-8">
            {/* Quick Links Section */}
            <div>
              <h4 className="text-xl font-bold mb-4 text-white">Quick Links</h4>
              <div className="space-y-2">
                <a
                  href="Login"
                  className="block text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Login
                </a>
                <a
                  href="#how-it-works"
                  className="block text-gray-400 hover:text-white transition-colors duration-200"
                >
                  How It Works
                </a>
              </div>
            </div>

            {/* Social Media Icons */}
            <div>
              <h4 className="text-xl font-bold mb-4 text-white">
                Connect With Us
              </h4>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.901 1.153h3.68l-8.04 9.134L24 22.846h-7.406l-5.8-7.584-6.638 7.584H1.076l8.999-10.251L0 1.153h7.594l5.243 6.944L18.901 1.153zm-2.732 17.08h2.036L7.884 3.257H5.631l10.538 14.976z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.162c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07M12 0C8.741 0 8.332.014 7.052.072 5.333.157 3.99.513 2.808 1.695 1.626 2.877 1.27 4.22 1.185 5.94.127 7.22.113 7.628.113 12s.014 4.78.072 6.06c.085 1.717.441 3.06 1.623 4.242 1.182 1.182 2.525 1.538 4.242 1.623C7.22 23.886 7.628 23.9 12 23.9s4.78-.014 6.06-.072c1.717-.085 3.06-.441 4.242-1.623 1.182-1.182 1.538-2.525 1.623-4.242.058-1.28.072-1.688.072-6.06s-.014-4.78-.072-6.06c-.085-1.717-.441-3.06-1.623-4.242-1.182-1.182-2.525-1.538-4.242-1.623C16.78.014 16.372 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.784 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 EcoCollect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
