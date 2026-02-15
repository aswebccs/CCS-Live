// //siddhis updated UI Frontend

// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "sonner";
// import { Mail, Lock, Eye, EyeOff } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// // Images
// import img1 from "../assets/img1.png";
// import img3 from "../assets/img3.png";

// const API_URL = import.meta.env.VITE_API_URL;

// /* ---------------- Image Slideshow ---------------- */
// function ImageSlideshow({ images }) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [fade, setFade] = useState(true);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setFade(false);
//       setTimeout(() => {
//         setCurrentIndex((prev) => (prev + 1) % images.length);
//         setFade(true);
//       }, 500);
//     }, 3500);

//     return () => clearInterval(interval);
//   }, [images.length]);

//   return (
//     <div className="relative w-full h-96 rounded-2xl overflow-hidden">
//       <img
//         src={images[currentIndex]}
//         alt={`Slide ${currentIndex + 1}`}
//         className={`w-full h-full object-cover transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"
//           }`}
//       />

//       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
//         {images.map((_, idx) => (
//           <div
//             key={idx}
//             className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-blue-500 w-8" : "bg-blue-300"
//               }`}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// /* ---------------- Login Component ---------------- */
// export default function Login() {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   /*  BACKEND LOGIC (UNCHANGED) */
//   const submit = async (e) => {
//     e.preventDefault();

//     if (!email || !password) {
//       return toast.error("All fields are required");
//     }

//     setLoading(true);
//     try {
//       const res = await axios.post(`${API_URL}/auth/login`, {
//         email: email.toLowerCase().trim(),
//         password,
//       });

//       const { token, user } = res.data;

//       localStorage.setItem("token", token);
//       localStorage.setItem("user_type", user.user_type);
//       localStorage.setItem("userType", user.user_type);

//       // Check if welcome screen is needed
//       const welcomeCheck = await axios.get(`${API_URL}/welcome/status`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (welcomeCheck.data.needsWelcome) {
//         toast.success("Welcome! Let's complete your profile");
//         if (user.user_type === 5) {
//           navigate("/welcome/university");
//         } else {
//           navigate("/welcome");
//         }
//       } else {
//         toast.success("Welcome back 🎉");
//         navigate("/dashboard");
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const images = [img1, img3];

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-3 relative overflow-hidden">
//       {/* Diagonal Grid Pattern Background */}
//       <div className="absolute inset-0 opacity-30">
//         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
//           <defs>
//             <pattern id="diagonalGrid" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
//               <line x1="0" y1="0" x2="0" y2="60" stroke="#e5e7eb" strokeWidth="1" />
//               <line x1="0" y1="0" x2="60" y2="0" stroke="#e5e7eb" strokeWidth="1" />
//             </pattern>
//           </defs>
//           <rect width="100%" height="100%" fill="url(#diagonalGrid)" />
//         </svg>
//       </div>

//       {/* Dotted Border Circles in Corners */}
//       <div className="absolute top-8 right-8 w-32 h-32 border-4 border-dotted border-gray-300 rounded-full"></div>
//       <div className="absolute bottom-8 left-8 w-40 h-40 border-4 border-dotted border-gray-300 rounded-full"></div>
//       <div className="absolute top-1/3 left-16 w-24 h-24 border-4 border-dotted border-gray-300 rounded-full"></div>
//       <div className="absolute bottom-1/4 right-24 w-28 h-28 border-4 border-dotted border-gray-300 rounded-full"></div>

//       {/* Centered Card Container */}
//       <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden relative z-10">
//         <div className="flex flex-col lg:flex-row">
//           {/* Left Side - Login Form */}
//           <div className="lg:w-1/2 p-6 lg:p-8 overflow-y-auto relative" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
//             <div className="max-w-md mx-auto space-y-3">
//               {/* Header */}
//               <div className="space-y-1">
//                 <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
//                 <p className="text-sm text-gray-600">Welcome back! Please enter your details.</p>
//               </div>

//               {/* Form */}
//               <form onSubmit={submit} className="space-y-3">
//                 {/* Email */}
//                 <div className="space-y-1.5">
//                   <Label className="text-sm text-gray-700 font-medium">
//                     Email<span className="text-red-500">*</span>
//                   </Label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <Input
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       placeholder="email@example.com"
//                       autoComplete="username"
//                       className="h-10 pl-10 text-sm border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {/* Password */}
//                 <div className="space-y-1.5">
//                   <Label className="text-sm text-gray-700 font-medium">
//                     Password<span className="text-red-500">*</span>
//                   </Label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <Input
//                       type={showPassword ? "text" : "password"}
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       placeholder="Enter your password"
//                       autoComplete="current-password"
//                       className="h-10 pl-10 pr-10 text-sm border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                       required
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     >
//                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Forgot Password */}
//                 <div className="flex justify-end">
//                   <Link to="/forgot-password" className="text-xs text-blue-600 font-semibold hover:text-blue-700 hover:underline">
//                     Forgot password?
//                   </Link>
//                 </div>

//                 {/* Submit Button */}
//                 <Button 
//                   type="submit"
//                   disabled={loading} 
//                   className="w-full h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
//                 >
//                   {loading ? "Signing in..." : "Sign In"}
//                 </Button>

//                 {/* Sign Up Link */}
//                 <div className="text-center pt-1">
//                   <p className="text-xs text-gray-600">
//                     Don't have an account?{" "}
//                     <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
//                       Create account
//                     </Link>
//                   </p>
//                 </div>
//               </form>
//             </div>
//           </div>

//           {/* Right Side - White background with Image Slideshow */}
//           <div className="lg:w-1/2 bg-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
//             {/* Image Slideshow Container */}
//             <div className="relative z-10 w-full h-full flex items-center justify-center">
//               <div className="w-full max-w-sm">
//                 <ImageSlideshow images={images} />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

//siddhis updated UI Frontend

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Images
import img1 from "../assets/img1.png";
import img3 from "../assets/img3.png";

const API_URL = import.meta.env.VITE_API_URL;

/* ---------------- Image Slideshow ---------------- */
function ImageSlideshow({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setFade(true);
      }, 500);
    }, 3500);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full h-96 rounded-2xl overflow-hidden">
      <img
        src={images[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        className={`w-full h-full object-cover transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"
          }`}
      />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-blue-500 w-8" : "bg-blue-300"
              }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Login Component ---------------- */
export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /*  BACKEND LOGIC (UNCHANGED) */
  const submit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("All fields are required");
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: email.toLowerCase().trim(),
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("user_type", user.user_type);
      localStorage.setItem("userType", user.user_type);

      // Check if welcome screen is needed
      const welcomeCheck = await axios.get(`${API_URL}/welcome/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (welcomeCheck.data.needsWelcome) {
        toast.success("Welcome! Let's complete your profile");
        if (user.user_type === 5) {
          navigate("/welcome/university");
        } else {
          navigate("/welcome");
        }
      } else {
        toast.success("Welcome back 🎉");
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const images = [img1, img3];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-3 relative overflow-hidden">
      {/* Diagonal Grid Pattern Background */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diagonalGrid" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="60" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="0" x2="60" y2="0" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonalGrid)" />
        </svg>
      </div>

      {/* Dotted Border Circles in Corners */}
      <div className="absolute top-8 right-8 w-32 h-32 border-4 border-dotted border-gray-300 rounded-full"></div>
      <div className="absolute bottom-8 left-8 w-40 h-40 border-4 border-dotted border-gray-300 rounded-full"></div>
      <div className="absolute top-1/3 left-16 w-24 h-24 border-4 border-dotted border-gray-300 rounded-full"></div>
      <div className="absolute bottom-1/4 right-24 w-28 h-28 border-4 border-dotted border-gray-300 rounded-full"></div>

      {/* Centered Card Container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden relative z-10">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Login Form */}
          <div className="lg:w-1/2 p-6 lg:p-8 overflow-y-auto relative" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            <div className="max-w-md mx-auto space-y-3">
              {/* Header */}
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
                <p className="text-sm text-gray-600">Welcome back! Please enter your details.</p>
              </div>

              {/* Form */}
              <form onSubmit={submit} className="space-y-3">
                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700 font-medium">
                    Email<span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      autoComplete="username"
                      className="h-10 pl-10 text-sm border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700 font-medium">
                    Password<span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-10 pl-10 pr-10 text-sm border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                {/* Sign Up Link */}
                <div className="text-center pt-1">
                  <p className="text-xs text-gray-600">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                      Create account
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - White background with Image Slideshow */}
          <div className="lg:w-1/2 bg-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Image Slideshow Container */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <div className="w-full max-w-sm">
                <ImageSlideshow images={images} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}