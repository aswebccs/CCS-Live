// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios";
// import { toast } from "sonner";

// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// const API_URL = "http://localhost:5000/api";

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);

//   const submit = async (e) => {
//     e.preventDefault();
//     if (!email) return toast.error("Email is required");

//     setLoading(true);
//     try {
//       await axios.post(`${API_URL}/auth/forgot-password`, { email });
//       toast.success("Reset link sent to your email 📩");
//       setEmail("");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to send reset link");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
//       <Card className="w-full max-w-md shadow-lg">
//         <CardHeader>
//           <h2 className="text-2xl font-semibold text-center">
//             Forgot Password?
//           </h2>
//           <p className="text-sm text-muted-foreground text-center">
//             Enter your registered email to receive a reset link
//           </p>
//         </CardHeader>

//         <CardContent>
//           <form onSubmit={submit} className="space-y-4">
//             <div>
//               <Label>Email Address</Label>
//               <Input
//                 type="email"
//                 placeholder="email@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>

//             <Button className="w-full" disabled={loading}>
//               {loading ? "Sending..." : "Send Reset Link"}
//             </Button>

//             <p className="text-sm text-center">
//               Remember your password?{" "}
//               <Link to="/login" className="font-medium">
//                 Login
//               </Link>
//             </p>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const API_URL = import.meta.env.VITE_API_URL;

// const API_URL = "http://localhost:5000/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    // ✅ Old backend logic preserved
    if (!email) return toast.error("Email is required");

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      toast.success("Reset link sent to your email 📩");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
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
            <h1 className="text-3xl font-bold text-gray-900">
              Forgot Password
            </h1>
            <p className="text-gray-600">
              Enter your registered email to receive a reset link
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">
                Email<span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {loading ? "Sending..." : "Send Reset Link"}
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
