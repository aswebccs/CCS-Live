import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, Home } from "lucide-react";

export const Header = () => {
    const navigate = useNavigate();
    const userType = Number(localStorage.getItem("user_type"));
    
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    /* ================= SCROLL EFFECT FOR HEADER ================= */
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    /* ================= LOGOUT ================= */
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    /* ================= PROFILE ================= */
    const goToProfile = () => {
        if (userType === 3) navigate("/profile/student");
        else if (userType === 6) navigate("/profile/school");
        else if (userType === 4) navigate("/profile/college");
        else if (userType === 5) navigate("/profile/university");
        else if (userType === 7) navigate("/profile/company");
        else if (userType === 8) navigate("/profile/institute");
    };

    // Hide header for admin users
    if (userType === 1 || userType === 2) {
        return null;
    }

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${
                isScrolled ? "bg-white shadow-md" : "bg-white shadow-sm"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div
                        onClick={() => navigate("/dashboard")}
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
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center gap-2 text-slate-700 hover:text-teal-600 font-medium transition-colors"
                        >
                            <Home className="w-5 h-5" />
                            Home
                        </button>
                        <button
                            onClick={goToProfile}
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
                        <button
                            onClick={() => {
                                navigate("/dashboard");
                                setMobileMenuOpen(false);
                            }}
                            className="w-full text-left text-slate-700 hover:text-teal-600 font-medium py-2"
                        >
                            Home
                        </button>
                        <button
                            onClick={() => {
                                goToProfile();
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
                    </div>
                )}
            </div>
        </header>
    );
};
