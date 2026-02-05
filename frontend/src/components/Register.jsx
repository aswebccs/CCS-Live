// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { GraduationCap, School, Building2, User, Briefcase } from "lucide-react";

// // Import your local images
// import img1 from "../assets/img1.png";
// import img2 from "../assets/img2.png";
// import img3 from "../assets/img3.png";

// const API_URL = import.meta.env.VITE_API_URL;
// // const API_URL = "http://localhost:5000/api";

// // User type options with icons
// const USER_TYPES = [
//   { id: 3, label: "Student / Professional", icon: GraduationCap },
//   { id: 6, label: "School", icon: School },
//   { id: 4, label: "College", icon: Building2 },
//   { id: 5, label: "University", icon: Building2 },
//   { id: 7, label: "Company", icon: Briefcase },
// ];

// // Image Slideshow Component
// function ImageSlideshow({ images }) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [fade, setFade] = useState(true);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setFade(false);
//       setTimeout(() => {
//         setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
//         setFade(true);
//       }, 500);
//     }, 3500);

//     return () => clearInterval(interval);
//   }, [images.length]);

//   return (
//     <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl">
//       <img
//         src={images[currentIndex]}
//         alt={`Slide ${currentIndex + 1}`}
//         className={`w-full h-full object-cover transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'
//           }`}
//       />

//       <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
//         {images.map((_, idx) => (
//           <div
//             key={idx}
//             className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-8' : 'bg-white/50'
//               }`}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// // Component for "Check your email" screen
// function CheckEmail({ email, setIsRegistered }) {
//   const [cooldown, setCooldown] = useState(0);

//   useEffect(() => {
//     if (cooldown > 0) {
//       const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [cooldown]);

//   const handleResend = async () => {
//     if (cooldown > 0) return;
//     try {
//       await axios.post(`${API_URL}/auth/resend-verification`, { email });
//       toast.success("Verification email resent successfully!");
//       setCooldown(30);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to resend email");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4 relative overflow-hidden">
//       <div className="absolute top-10 right-10 w-48 h-48 border-4 border-dotted border-white/40 rounded-full"></div>
//       <div className="absolute bottom-10 left-10 w-64 h-64 border-4 border-dotted border-white/30 rounded-full"></div>

//       <div className="bg-white p-8 shadow-lg rounded-2xl text-center w-full max-w-md relative z-10">
//         <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
//           <span className="text-3xl">📧</span>
//         </div>
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">Almost there!</h2>
//         <p className="text-gray-600 mb-2">
//           We have sent a verification email to
//         </p>
//         <p className="font-semibold text-gray-900 mb-4">{email}</p>
//         <p className="text-gray-600 mb-6">
//           Please click the link in your email to activate your account.
//         </p>

//         <Button
//           onClick={handleResend}
//           disabled={cooldown > 0}
//           className="w-full mb-3 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
//         >
//           {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}
//         </Button>

//         <Button
//           onClick={() => setIsRegistered(false)}
//           variant="outline"
//           className="w-full mb-4 h-12 border-gray-300"
//         >
//           Back to Register
//         </Button>

//         <p className="text-sm text-gray-600">
//           Already verified?{" "}
//           <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default function Register() {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirm_password: "",
//     user_type: "",
//     referral_code: "",
//   });

//   const [isRegistered, setIsRegistered] = useState(false);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const submit = async (e) => {
//     e.preventDefault();

//     if (!form.name || !form.email || !form.password || !form.confirm_password) {
//       return toast.error("Please fill all required fields");
//     }
//     if (form.password !== form.confirm_password) {
//       return toast.error("Passwords do not match");
//     }
//     if (form.password.length < 6) {
//       return toast.error("Password must be at least 6 characters");
//     }
//     if (!form.user_type) {
//       return toast.error("Please select user type");
//     }

//     const payload = {
//       name: form.name.trim(),
//       email: form.email.trim(),
//       password: form.password,
//       user_type: Number(form.user_type),
//       referral_code: form.referral_code || null,
//     };

//     try {
//       await axios.post(`${API_URL}/auth/register`, payload, { withCredentials: true });
//       toast.success("Registration successful! Check your email to verify your account.");
//       setIsRegistered(true);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Registration failed");
//     }
//   };

//   if (isRegistered) {
//     return <CheckEmail email={form.email} setIsRegistered={setIsRegistered} />;
//   }

//   const images = [img1, img2, img3];

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
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
//       <div className="absolute top-10 right-10 w-48 h-48 border-4 border-dotted border-gray-300 rounded-full"></div>
//       <div className="absolute bottom-10 left-10 w-64 h-64 border-4 border-dotted border-gray-300 rounded-full"></div>
//       <div className="absolute top-1/3 left-20 w-32 h-32 border-4 border-dotted border-gray-300 rounded-full"></div>
//       <div className="absolute bottom-1/4 right-32 w-40 h-40 border-4 border-dotted border-gray-300 rounded-full"></div>

//       {/* Centered Card Container */}
//       <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10">
//         <div className="flex flex-col lg:flex-row">
//           {/* Left Side - Form (Now on Left on Desktop) */}
//           <div className="lg:w-1/2 p-8 lg:p-12 overflow-y-auto max-h-screen">
//             <div className="max-w-md mx-auto space-y-6">
//               {/* Header */}
//               <div className="space-y-2">
//                 <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
//                 <p className="text-gray-600">Create your account to get started</p>
//               </div>

//               {/* Form */}
//               <form onSubmit={submit} className="space-y-5">
//                 {/* Full Name */}
//                 <div className="space-y-2">
//                   <Label className="text-gray-700 font-medium">
//                     Full Name<span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     name="name"
//                     value={form.name}
//                     onChange={handleChange}
//                     placeholder="Enter your full name"
//                     required
//                     className="h-12 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                   />
//                 </div>

//                 {/* Email */}
//                 <div className="space-y-2">
//                   <Label className="text-gray-700 font-medium">
//                     Email<span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     type="email"
//                     name="email"
//                     value={form.email}
//                     onChange={handleChange}
//                     placeholder="email@example.com"
//                     autoComplete="username"
//                     required
//                     className="h-12 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                   />

//                 </div>

//                 {/* Password Fields */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label className="text-gray-700 font-medium">
//                       Password<span className="text-red-500">*</span>
//                     </Label>
//                     <Input
//                       type="password"
//                       name="password"
//                       value={form.password}
//                       onChange={handleChange}
//                       placeholder="Min 6 chars"
//                       autoComplete="new-password"
//                       required
//                       className="h-12 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label className="text-gray-700 font-medium">
//                       Confirm<span className="text-red-500">*</span>
//                     </Label>
//                     <Input
//                       type="password"
//                       name="confirm_password"
//                       value={form.confirm_password}
//                       onChange={handleChange}
//                       placeholder="Confirm"
//                       autoComplete="new-password"
//                       required
//                       className="h-12 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                     />
//                   </div>
//                 </div>

//                 {/* User Type - Unstop Style */}
//                 <div className="space-y-3">
//                   <Label className="text-gray-700 font-medium">
//                     User type<span className="text-red-500">*</span>
//                   </Label>
//                   <div className="grid grid-cols-2 gap-3">
//                     {USER_TYPES.map((type) => {
//                       const Icon = type.icon;
//                       const isWide = type.id === 3;
//                       return (
//                         <button
//                           key={type.id}
//                           type="button"
//                           onClick={() => setForm({ ...form, user_type: String(type.id) })}
//                           className={`flex items-center justify-center gap-2 h-12 px-4 rounded-full border-2 transition-all duration-200 ${isWide ? 'col-span-2' : ''
//                             } ${form.user_type === String(type.id)
//                               ? 'border-blue-500 bg-blue-50 text-blue-700'
//                               : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
//                             }`}
//                         >
//                           <Icon className="w-6 h-6" />
//                           <span className="text-base font-medium">{type.label}</span>
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 {/* Referral Code - Only show for Student/Professional */}
//                 {form.user_type === "3" && (
//                   <div className="space-y-2">
//                     <Label className="text-gray-700 font-medium">Referral Code (Optional)</Label>
//                     <Input
//                       name="referral_code"
//                       value={form.referral_code}
//                       onChange={handleChange}
//                       placeholder="Enter referral code"
//                       className="h-12 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                     />
//                   </div>
//                 )}

//                 {/* Submit */}
//                 <Button
//                   type="submit"
//                   className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
//                 >
//                   Create Account
//                 </Button>

//                 {/* Sign In Link */}
//                 <div className="text-center pt-2">
//                   <p className="text-sm text-gray-600">
//                     Already have an account?{" "}
//                     <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
//                       Sign In
//                     </Link>
//                   </p>
//                 </div>
//               </form>
//             </div>
//           </div>

//           {/* Right Side - Yellow Grid with Image Slideshow (Now on Right) */}
//           <div className="lg:w-1/2 bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500 rounded-3xl m-6 p-8 flex flex-col items-center justify-center relative overflow-hidden">
//             {/* Grid Pattern */}
//             <div className="absolute inset-0 opacity-15">
//               <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
//                 <defs>
//                   <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
//                     <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
//                   </pattern>
//                 </defs>
//                 <rect width="100%" height="100%" fill="url(#grid)" />
//               </svg>
//             </div>

//             {/* Single Image Slideshow Container */}
//             <div className="relative z-10 w-full h-full flex items-center justify-center">
//               <div className="w-full max-w-md">
//                 <ImageSlideshow images={images} />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

//siddhis updated ui frontend


import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, School, Building2, User, Briefcase } from "lucide-react";

// Import your local images
import img1 from "../assets/img1.png";
import img2 from "../assets/img2.png";
import img3 from "../assets/img3.png";

const API_URL = import.meta.env.VITE_API_URL;

// User type options with icons
const USER_TYPES = [
  { id: 3, label: "Student / Professional", icon: GraduationCap },
  { id: 6, label: "School", icon: School },
  { id: 4, label: "College", icon: Building2 },
  { id: 5, label: "University", icon: Building2 },
  { id: 7, label: "Company", icon: Briefcase },
];

// Image Slideshow Component
function ImageSlideshow({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
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
        className={`w-full h-full object-cover transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'
          }`}
      />

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-blue-500 w-8' : 'bg-blue-300'
              }`}
          />
        ))}
      </div>
    </div>
  );
}

// Component for "Check your email" screen
function CheckEmail({ email, setIsRegistered }) {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await axios.post(`${API_URL}/auth/resend-verification`, { email });
      toast.success("Verification email resent successfully!");
      setCooldown(30);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend email");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-48 h-48 border-4 border-dotted border-white/40 rounded-full"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 border-4 border-dotted border-white/30 rounded-full"></div>

      <div className="bg-white p-8 shadow-lg rounded-2xl text-center w-full max-w-md relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <span className="text-3xl">📧</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Almost there!</h2>
        <p className="text-gray-600 mb-2">
          We have sent a verification email to
        </p>
        <p className="font-semibold text-gray-900 mb-4">{email}</p>
        <p className="text-gray-600 mb-6">
          Please click the link in your email to activate your account.
        </p>

        <Button
          onClick={handleResend}
          disabled={cooldown > 0}
          className="w-full mb-3 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}
        </Button>

        <Button
          onClick={() => setIsRegistered(false)}
          variant="outline"
          className="w-full mb-4 h-12 border-gray-300"
        >
          Back to Register
        </Button>

        <p className="text-sm text-gray-600">
          Already verified?{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    user_type: "",
    referral_code: "",
  });

  const [isRegistered, setIsRegistered] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirm_password) {
      return toast.error("Please fill all required fields");
    }
    if (form.password !== form.confirm_password) {
      return toast.error("Passwords do not match");
    }
    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    if (!form.user_type) {
      return toast.error("Please select user type");
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      user_type: Number(form.user_type),
      referral_code: form.referral_code || null,
    };

    try {
      await axios.post(`${API_URL}/auth/register`, payload, { withCredentials: true });
      toast.success("Registration successful! Check your email to verify your account.");
      setIsRegistered(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  if (isRegistered) {
    return <CheckEmail email={form.email} setIsRegistered={setIsRegistered} />;
  }

  const images = [img1, img2, img3];

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

      {/* Centered Card Container - Optimized for 100% zoom */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden relative z-10">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Form */}
          <div className="lg:w-1/2 p-6 lg:p-8 overflow-y-auto relative" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            <div className="max-w-md mx-auto space-y-3">
              {/* Header */}
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">Sign Up</h1>
                <p className="text-sm text-gray-600">Create your account to get started</p>
              </div>
              
              {/* Form */}
              <form onSubmit={submit} className="space-y-3">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700 font-medium">
                    Full Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="h-10 text-sm border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                
                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700 font-medium">
                    Email<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    autoComplete="username"
                    required
                    className="h-10 text-sm border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                
                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700 font-medium">
                      Password<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min 6 chars"
                      autoComplete="new-password"
                      required
                      className="h-10 text-sm border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700 font-medium">
                      Confirm<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="password"
                      name="confirm_password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      placeholder="Confirm"
                      autoComplete="new-password"
                      required
                      className="h-10 text-sm border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
                
                {/* User Type */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-700 font-medium">
                    User type<span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {USER_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isWide = type.id === 3;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setForm({ ...form, user_type: String(type.id) })}
                          className={`flex items-center justify-center gap-1.5 h-9 px-3 rounded-full border-2 transition-all duration-200 ${isWide ? 'col-span-2' : ''
                            } ${form.user_type === String(type.id)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Referral Code */}
                {form.user_type === "3" && (
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700 font-medium">Referral Code (Optional)</Label>
                    <Input
                      name="referral_code"
                      value={form.referral_code}
                      onChange={handleChange}
                      placeholder="Enter referral code"
                      className="h-10 text-sm border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                )}
                
                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Create Account
                </Button>
                
                {/* Sign In Link */}
                <div className="text-center pt-1">
                  <p className="text-xs text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
          
          {/* Right Side - White background with Image Slideshow */}
          <div className="lg:w-1/2 bg-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Single Image Slideshow Container */}
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