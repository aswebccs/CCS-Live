import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// const API_URL = "http://localhost:5000/api";
const API_URL = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    // ✅ Old backend logic preserved
    if (!password || !confirmPassword)
      return toast.error("All fields are required");

    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");

    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
      toast.success("Password reset successfully 🔐");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative z-10">
        <div className="space-y-6">

          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-gray-600">Create a new secure password</p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">
                New Password<span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">
                Confirm Password<span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
              >
                Login
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
