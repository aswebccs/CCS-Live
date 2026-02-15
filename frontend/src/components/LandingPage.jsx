import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  BookOpen,
  Users,
  Zap,
  ArrowRight,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setIsLoggedIn(true);
      try {
        setUserData(JSON.parse(user));
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }

    // Track scroll for header styling
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Listen for storage changes (for multi-tab scenarios)
    const handleStorageChange = () => {
      const updatedToken = localStorage.getItem("token");
      const updatedUser = localStorage.getItem("user");
      
      if (updatedToken && updatedUser) {
        setIsLoggedIn(true);
        try {
          setUserData(JSON.parse(updatedUser));
        } catch (e) {
          console.error("Failed to parse user data:", e);
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const getProfileRoute = () => {
    if (!userData) return "/dashboard";
    const userType = userData.user_type;
    switch (userType) {
      case 3:
        return "/profile/student";
      case 6:
        return "/profile/school";
      case 4:
        return "/profile/college";
      case 5:
        return "/profile/university";
      case 7:
        return "/profile/company";
      default:
        return "/dashboard";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserData(null);
    navigate("/login");
  };

  const features = [
    {
      icon: <Briefcase className="w-12 h-12" />,
      title: "Job Opportunities",
      description: "Browse and apply for thousands of job listings from top companies",
      bgGradient: "from-blue-50 to-blue-100",
      iconGradient: "from-blue-600 to-blue-700",
      accentColor: "text-blue-600",
    },
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: "Skill Assessment",
      description: "Test and showcase your programming skills with our comprehensive skill tests",
      bgGradient: "from-amber-50 to-orange-100",
      iconGradient: "from-amber-600 to-orange-700",
      accentColor: "text-amber-600",
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Build Your Network",
      description: "Connect with professionals in your field and grow your professional network",
      bgGradient: "from-emerald-50 to-teal-100",
      iconGradient: "from-emerald-600 to-teal-700",
      accentColor: "text-emerald-600",
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "Real-time Events",
      description: "Stay updated with latest industry events and networking opportunities",
      bgGradient: "from-pink-50 to-rose-100",
      iconGradient: "from-pink-600 to-rose-700",
      accentColor: "text-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HEADER ===== */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-md"
            : "bg-white shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">CCS</span>
              </div>
              <span className="text-xl font-bold text-slate-900 hidden sm:inline">
                CCS Platform
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="text-slate-700 hover:text-teal-600 font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <> 
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 text-slate-700 hover:text-teal-600 font-medium transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate(getProfileRoute())}
                    className="flex items-center gap-2 text-slate-700 hover:text-teal-600 font-medium transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-slate-200 pt-4 space-y-3">
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-slate-700 hover:text-teal-600 font-medium py-2"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate("/register");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-slate-700 hover:text-teal-600 font-medium py-2"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      navigate(getProfileRoute());
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-slate-700 hover:text-teal-600 font-medium py-2"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-red-600 hover:text-red-700 font-medium py-2"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="bg-white py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6">
              Your Career Starts Here
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {isLoggedIn
                ? `Welcome back! Explore opportunities, showcase your skills, and connect with industry leaders.`
                : `Join thousands of professionals in finding the perfect opportunity and advancing your career with CCS.`}
            </p>

            {!isLoggedIn ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/register")}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg"
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 mx-auto shadow-lg"
              >
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                5000+
              </div>
              <p className="text-slate-600 text-sm sm:text-base">Active Jobs</p>
            </div>
            <div className="text-center bg-amber-50 rounded-xl p-6 border border-amber-200">
              <div className="text-3xl sm:text-4xl font-bold text-amber-600 mb-2">
                500+
              </div>
              <p className="text-slate-600 text-sm sm:text-base">Skill Tests</p>
            </div>
            <div className="text-center bg-emerald-50 rounded-xl p-6 border border-emerald-200">
              <div className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-2">
                10K+
              </div>
              <p className="text-slate-600 text-sm sm:text-base">Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="bg-white py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Why Choose CCS?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to succeed in your career journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${feature.bgGradient} rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100`}
              >
                <div
                  className={`bg-gradient-to-br ${feature.iconGradient} p-4 rounded-xl w-fit mb-6 text-white transform group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section className="bg-slate-100 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 text-center mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 ml-22">
            {[
              {
                step: "01",
                title: "Create Account",
                description: "Sign up and complete your profile",
                stepColor: "from-blue-600 to-blue-700",
              },
              {
                step: "02",
                title: "Explore Opportunities",
                description: "Browse jobs tailored to your skills",
                stepColor: "from-amber-600 to-orange-700",
              },
              {
                step: "03",
                title: "Assess Skills",
                description: "Take tests to showcase expertise",
                stepColor: "from-emerald-600 to-teal-700",
              },
              {
                step: "04",
                title: "Get Hired",
                description: "Connect with top employers",
                stepColor: "from-pink-600 to-rose-700",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className={`bg-gradient-to-br ${item.stepColor} text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mb-6 shadow-lg`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                {index < 3 && (
                  <div className="hidden md:block absolute top-5 right-10 text-4xl text-slate-400">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="bg-gradient-to-r from-teal-50 to-cyan-50 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join CCS today and unlock unlimited opportunities in your field
          </p>

          {!isLoggedIn && (
            <button
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 mx-auto shadow-lg"
            >
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">CCS</span>
                </div>
                <span className="text-white font-bold text-lg">CCS Platform</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Connecting talent with opportunity. Build your career with CCS.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => navigate("/")}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Jobs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Job Listings
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Skill Tests
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Events
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Networking
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-slate-500">
              &copy; 2026 CCS Platform. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a
                href="#"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-teal-600 hover:text-white transition-all"
              >
                f
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-teal-600 hover:text-white transition-all"
              >
                t
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-teal-600 hover:text-white transition-all"
              >
                in
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
