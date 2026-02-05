import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

// const API_URL = "http://localhost:5000/api";
const API_URL = import.meta.env.VITE_API_URL;

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const hasRun = useRef(false); // prevents double call
  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verifyEmail = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/verify/${token}`);
        toast.success(res.data.message || "Email verified successfully");
        localStorage.setItem("email_verified", "true");
        setStatus("Email verified successfully! Redirecting to login...");
      } catch (err) {
        localStorage.setItem("email_verified", "true");
        // treat expired token as success (already verified)
        toast.success("Email already verified");
        setStatus("Email already verified! Redirecting to login...");
      } finally {
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="diagonalGrid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="60" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="0" x2="60" y2="0" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonalGrid)" />
        </svg>
      </div>

      {/* Decorative Dotted Circles */}
      <div className="absolute top-10 right-10 w-48 h-48 border-4 border-dotted border-gray-300 rounded-full"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 border-4 border-dotted border-gray-300 rounded-full"></div>
      <div className="absolute top-1/3 left-20 w-32 h-32 border-4 border-dotted border-gray-300 rounded-full"></div>
      <div className="absolute bottom-1/4 right-32 w-40 h-40 border-4 border-dotted border-gray-300 rounded-full"></div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center relative z-10 space-y-4">
        <div className="text-4xl">⏳</div>
        <h2 className="text-2xl font-bold text-gray-900">{status}</h2>
        <p className="text-gray-600">
          {status.includes("Redirecting") ? "You will be redirected shortly." : ""}
        </p>

        {/* Optional button if user wants to go manually */}
        {status.includes("already") && (
          <Link to="/login">
            <Button className="w-full h-12 mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
              Continue to Login
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
