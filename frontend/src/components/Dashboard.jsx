// import { useEffect, useRef, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { Button } from "./ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import { BookOpen, Menu, X, LogOut, User, Home } from "lucide-react";
// import { toast } from "sonner";


// // const BACKEND_URL = "http://localhost:5000";
// const API_URL = import.meta.env.VITE_API_URL;

// export default function Dashboard() {
//   const goToSkillTests = () => {
//     navigate("/student/skill-test");
//   };

//   const location = useLocation();
//   const navigate = useNavigate();
//   const seenToastIdsRef = useRef(new Set());
//   const userType = Number(localStorage.getItem("user_type"));
//   const token = localStorage.getItem("token");

//   /* ================= ADMIN REDIRECT ================= */
//   useEffect(() => {
//     if (userType === 1 || userType === 2) {
//       navigate("/admin-dashboard");
//     }
//   }, [userType, navigate]);

//   useEffect(() => {
//     const successMessage = location.state?.toastSuccess;
//     const toastId = location.state?.toastId;
//     if (!successMessage) return;
//     if (toastId && seenToastIdsRef.current.has(toastId)) return;

//     if (toastId) seenToastIdsRef.current.add(toastId);
//     toast.success(successMessage);
//     navigate(location.pathname, { replace: true, state: null });
//   }, [location, navigate]);

//   /* ================= STATES ================= */
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);

//   /* ================= SCROLL EFFECT FOR HEADER ================= */
//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 0);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   /* ================= LOGOUT ================= */
//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/login");
//   };

//   /* ================= PROFILE ================= */
//   const goToProfile = () => {
//     if (userType === 3) navigate("/profile/student");
//     else if (userType === 6) navigate("/profile/school");
//     else if (userType === 4) navigate("/profile/college");
//     else if (userType === 5) navigate("/profile/university");
//     else if (userType === 7) navigate("/profile/company");
//   };

//   /* ================= FETCH COMPANY JOBS ================= */
//   useEffect(() => {
//     if (userType === 7) {
//       fetchCompanyJobs();
//     }
//   }, [userType]);

//   const fetchCompanyJobs = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`${API_URL}/company/publish`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const data = await res.json();
//       setJobs(data.jobs || []);
//     } catch (err) {
//       console.error("FETCH JOBS ERROR:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= DELETE JOB ================= */
//   const deleteJob = async (postId) => {
//     if (!window.confirm("Are you sure you want to delete this job?")) return;

//     try {
//       await fetch(`${API_URL}/company/publish/${postId}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setJobs((prev) => prev.filter((job) => job.id !== postId));
//     } catch (err) {
//       console.error("DELETE JOB ERROR:", err);
//     }
//   };

//   return (
//     <>
//       {/* ===== HEADER ===== */}
//       <header
//         className={`sticky top-0 z-50 transition-all duration-300 ${
//           isScrolled ? "bg-white shadow-md" : "bg-white shadow-sm"
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             {/* Logo */}
//             <div
//               onClick={() => navigate("/")}
//               className="flex items-center gap-2 cursor-pointer"
//             >
//               <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
//                 <span className="text-white font-bold text-lg">CCS</span>
//               </div>
//               <span className="text-xl font-bold text-slate-900 hidden sm:inline">
//                 CCS Platform
//               </span>
//             </div>

//             {/* Desktop Navigation */}
//             {userType !== 1 && userType !== 2 && (
//               <nav className="hidden md:flex items-center gap-8">
//                 <button
//                   onClick={() => navigate("/")}
//                   className="flex items-center gap-2 text-slate-700 hover:text-teal-600 font-medium transition-colors"
//                 >
//                   <Home className="w-5 h-5" />
//                   Home
//                 </button>
//                 <button
//                   onClick={goToProfile}
//                   className="flex items-center gap-2 text-slate-700 hover:text-teal-600 font-medium transition-colors"
//                 >
//                   <User className="w-5 h-5" />
//                   Profile
//                 </button>
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
//                 >
//                   <LogOut className="w-5 h-5" />
//                   Logout
//                 </button>
//               </nav>
//             )}

//             {/* Mobile Menu Button */}
//             {userType !== 1 && userType !== 2 && (
//               <button
//                 className="md:hidden p-2"
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               >
//                 {mobileMenuOpen ? (
//                   <X className="w-6 h-6 text-gray-700" />
//                 ) : (
//                   <Menu className="w-6 h-6 text-gray-700" />
//                 )}
//               </button>
//             )}
//           </div>

//           {/* Mobile Navigation */}
//           {userType !== 1 && userType !== 2 && mobileMenuOpen && (
//             <div className="md:hidden pb-4 border-t border-slate-200 pt-4 space-y-3">
//               <button
//                 onClick={() => {
//                   navigate("/");
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full text-left text-slate-700 hover:text-teal-600 font-medium py-2"
//               >
//                 Home
//               </button>
//               <button
//                 onClick={() => {
//                   goToProfile();
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full text-left text-slate-700 hover:text-teal-600 font-medium py-2"
//               >
//                 Profile
//               </button>
//               <button
//                 onClick={handleLogout}
//                 className="w-full text-left text-red-600 hover:text-red-700 font-medium py-2"
//               >
//                 Logout
//               </button>
//             </div>
//           )}
//         </div>
//       </header>

//       <div className="min-h-screen bg-slate-50 px-4 py-10 space-y-8">

//       {/* ================= DASHBOARD HEADERS ================= */}
//       <div className="text-center space-y-2">
//         {userType === 3 && (
//           <>
//             <h1 className="text-3xl font-bold">🎓 Student Dashboard</h1>
//             <p className="text-gray-600">
//               Welcome! View your learning progress and activities.
//             </p>
//           </>
//         )}

//         {userType === 6 && (
//           <>
//             <h1 className="text-3xl font-bold">🏫 School Dashboard</h1>
//             <p className="text-gray-600">
//               Manage school operations and students.
//             </p>
//           </>
//         )}

//         {userType === 4 && (
//           <>
//             <h1 className="text-3xl font-bold">🎓 College Dashboard</h1>
//             <p className="text-gray-600">
//               Handle college departments and admissions.
//             </p>
//           </>
//         )}

//         {userType === 5 && (
//           <>
//             <h1 className="text-3xl font-bold">🏛️ University Dashboard</h1>
//             <p className="text-gray-600">
//               University administration and analytics.
//             </p>
//           </>
//         )}

//         {userType === 7 && (
//           <>
//             <h1 className="text-3xl font-bold">🏢 Company Dashboard</h1>
//             <p className="text-gray-600">
//               Manage jobs and recruitment process.
//             </p>
//           </>
//         )}
//       </div>

//       {/* ================= COMPANY JOB LIST ================= */}
//       {userType === 7 && (
//         <div className="max-w-5xl mx-auto space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Your Job Posts</CardTitle>
//             </CardHeader>

//             <CardContent className="space-y-4">
//               {loading && <p className="text-gray-500">Loading jobs...</p>}

//               {!loading && jobs.length === 0 && (
//                 <p className="text-gray-500">No job posts created yet.</p>
//               )}

//               {jobs.map((job) => (
//                 <div
//                   key={job.id}
//                   className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
//                   onClick={async () => {
//                     try {
//                       const res = await fetch(`${API_URL}/company/publish/${job.id}`, {
//                         method: "GET",
//                         headers: {
//                           Authorization: `Bearer ${token}`,
//                         },
//                       });

//                       if (!res.ok) throw new Error("Failed to fetch job details");

//                       const data = await res.json();

//                       // You can store the job details in localStorage, state, or context
//                       localStorage.setItem("selectedJob", JSON.stringify(data));

//                       // Navigate to frontend route for job details
//                       navigate(`/company/posts/${job.id}`);
//                     } catch (err) {
//                       console.error("Error fetching job details:", err);
//                       alert("Failed to load job details");
//                     }
//                   }}
//                 >
//                   <div>
//                     <h3 className="font-semibold text-lg">{job.title}</h3>
//                     <p className="text-sm text-gray-500">
//                       Status: <span className="capitalize">{job.status}</span>
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       Created: {new Date(job.created_at).toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* ================= ACTION BUTTONS ================= */}
//       <div className="flex justify-center gap-4">
//         {userType !== 1 && userType !== 2 && (
//           <Button onClick={goToProfile}>Profile</Button>
//         )}
//         {/* STUDENT JOBS BUTTON */}
//         {userType === 3 && (
//           <>
//             <Button
//               onClick={() => navigate("/jobs")}
//               className="bg-blue-600 hover:bg-blue-700 text-white"
//             >
//               Jobs
//             </Button>

//             {/* ✅ MY APPLIED JOBS BUTTON */}
//             <Button
//               onClick={() => navigate("/student/applied-jobs")}
//               className="bg-purple-600 hover:bg-purple-700 text-white"
//             >
//               My Applied Jobs
//             </Button>
//             <Button
//               onClick={goToSkillTests}
//               className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
//             >
//               <BookOpen size={16} />
//               Take Skill Tests
//             </Button>
//             <Button
//               onClick={() => navigate("/student/events")}
//               className="bg-teal-600 hover:bg-teal-700 text-white"
//             >
//               Apply for Event
//             </Button>
//           </>
//         )}


//         {(userType === 4 || userType === 5 || userType === 6 || userType === 7) && (
//           <Button
//             onClick={() => navigate("/events/create")}
//             className="bg-blue-600 hover:bg-blue-700 text-white"
//           >
//             Create Event
//           </Button>
//         )}

//         {userType === 7 && (
//           <Button
//             onClick={() => navigate("/company/posts")}
//             className="bg-green-600 hover:bg-green-700 text-white"
//           >
//             Create Job
//           </Button>
//         )}
//         {[4, 5, 6, 7].includes(userType) && (
//           <Button
//             onClick={() => navigate("/events/manage")}
//             className="bg-slate-700 hover:bg-slate-800 text-white"
//           >
//             My Events
//           </Button>
//         )}

//         {userType !== 1 && userType !== 2 && (
//           <Button
//             onClick={handleLogout}
//             className="bg-red-500 hover:bg-red-600 text-white"
//           >
//             Logout
//           </Button>
//         )}
//       </div>
//       </div>
//     </>
//   );
// }


import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BookOpen, Menu, X, LogOut, User, Home } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const goToSkillTests = () => {
    navigate("/student/skill-test");
  };

  const location = useLocation();
  const navigate = useNavigate();
  const seenToastIdsRef = useRef(new Set());
  const userType = Number(localStorage.getItem("user_type"));
  const token = localStorage.getItem("token");

  /* ================= ADMIN REDIRECT ================= */
  useEffect(() => {
    if (userType === 1 || userType === 2) {
      navigate("/admin-dashboard");
    }
  }, [userType, navigate]);

  /* ================= TOAST ON NAVIGATION ================= */
  useEffect(() => {
    const successMessage = location.state?.toastSuccess;
    const toastId = location.state?.toastId;
    if (!successMessage) return;
    if (toastId && seenToastIdsRef.current.has(toastId)) return;

    if (toastId) seenToastIdsRef.current.add(toastId);
    toast.success(successMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  /* ================= STATES ================= */
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
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
  };

  /* ================= FETCH COMPANY JOBS ================= */
  useEffect(() => {
    if (userType === 7) {
      fetchCompanyJobs();
    }
  }, [userType]);

  const fetchCompanyJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/company/publish`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("FETCH JOBS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH STUDENT CERTIFICATES ================= */
  useEffect(() => {
    if (userType === 3) {
      fetchCertificates();
    }
  }, [userType]);

  const fetchCertificates = async () => {
    try {
      setCertificatesLoading(true);
      const res = await fetch(`${API_URL}/certificates/student/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch certificates");
      const data = await res.json();
      setCertificates(data.certificates || []);
    } catch (err) {
      console.error("FETCH CERTIFICATES ERROR:", err);
      setCertificates([]);
    } finally {
      setCertificatesLoading(false);
    }
  };

  /* ================= DOWNLOAD CERTIFICATE ================= */
  const downloadCertificate = async (fileUrl, certificateNumber) => {
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) {
        window.open(fileUrl, "_blank");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate_${certificateNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(fileUrl, "_blank");
    }
  };

  /* ================= DELETE JOB ================= */
  const deleteJob = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await fetch(`${API_URL}/company/publish/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs((prev) => prev.filter((job) => job.id !== postId));
    } catch (err) {
      console.error("DELETE JOB ERROR:", err);
    }
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md" : "bg-white shadow-sm"
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
            {userType !== 1 && userType !== 2 && (
              <nav className="hidden md:flex items-center gap-8">
                <button
                  onClick={() => navigate("/")}
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
            )}

            {/* Mobile Menu Button */}
            {userType !== 1 && userType !== 2 && (
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
            )}
          </div>

          {/* Mobile Navigation */}
          {userType !== 1 && userType !== 2 && mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-slate-200 pt-4 space-y-3">
              <button
                onClick={() => { navigate("/"); setMobileMenuOpen(false); }}
                className="w-full text-left text-slate-700 hover:text-teal-600 font-medium py-2"
              >
                Home
              </button>
              <button
                onClick={() => { goToProfile(); setMobileMenuOpen(false); }}
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

      <div className="min-h-screen bg-slate-50 px-4 py-10 space-y-8">

        {/* ================= DASHBOARD HEADERS ================= */}
        <div className="text-center space-y-2">
          {userType === 3 && (
            <>
              <h1 className="text-3xl font-bold">🎓 Student Dashboard</h1>
              <p className="text-gray-600">Welcome! View your learning progress and activities.</p>
            </>
          )}
          {userType === 6 && (
            <>
              <h1 className="text-3xl font-bold">🏫 School Dashboard</h1>
              <p className="text-gray-600">Manage school operations and students.</p>
            </>
          )}
          {userType === 4 && (
            <>
              <h1 className="text-3xl font-bold">🎓 College Dashboard</h1>
              <p className="text-gray-600">Handle college departments and admissions.</p>
            </>
          )}
          {userType === 5 && (
            <>
              <h1 className="text-3xl font-bold">🏛️ University Dashboard</h1>
              <p className="text-gray-600">University administration and analytics.</p>
            </>
          )}
          {userType === 7 && (
            <>
              <h1 className="text-3xl font-bold">🏢 Company Dashboard</h1>
              <p className="text-gray-600">Manage jobs and recruitment process.</p>
            </>
          )}
        </div>

        {/* ================= COMPANY JOB LIST ================= */}
        {userType === 7 && (
          <div className="max-w-5xl mx-auto space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Job Posts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading && <p className="text-gray-500">Loading jobs...</p>}
                {!loading && jobs.length === 0 && (
                  <p className="text-gray-500">No job posts created yet.</p>
                )}
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={async () => {
                      try {
                        const res = await fetch(`${API_URL}/company/publish/${job.id}`, {
                          method: "GET",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        if (!res.ok) throw new Error("Failed to fetch job details");
                        const data = await res.json();
                        localStorage.setItem("selectedJob", JSON.stringify(data));
                        navigate(`/company/posts/${job.id}`);
                      } catch (err) {
                        console.error("Error fetching job details:", err);
                        alert("Failed to load job details");
                      }
                    }}
                  >
                    <div>
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-sm text-gray-500">
                        Status: <span className="capitalize">{job.status}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ================= ACTION BUTTONS ================= */}
        <div className="flex flex-wrap justify-center gap-4">
          {userType !== 1 && userType !== 2 && (
            <Button onClick={goToProfile}>Profile</Button>
          )}

          {/* ================= STUDENT BUTTONS ================= */}
          {userType === 3 && (
            <>
              <Button
                onClick={() => navigate("/jobs")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Jobs
              </Button>
              <Button
                onClick={() => navigate("/student/applied-jobs")}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                My Applied Jobs
              </Button>
              <Button
                onClick={goToSkillTests}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
              >
                <BookOpen size={16} />
                Take Skill Tests
              </Button>
              <Button
                onClick={() => navigate("/profile/student/certificates")}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                All Certificates
              </Button>
              <Button
                onClick={() => navigate("/student/events")}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Apply for Event
              </Button>
            </>
          )}

          {/* ================= INSTITUTION & COMPANY EVENT BUTTONS ================= */}
          {[4, 5, 6, 7].includes(userType) && (
            <>
              <Button
                onClick={() => navigate("/events/create")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Event
              </Button>
              <Button
                onClick={() => navigate("/events/manage")}
                className="bg-slate-700 hover:bg-slate-800 text-white"
              >
                My Events
              </Button>
            </>
          )}

          {/* ================= COMPANY JOB BUTTON ================= */}
          {userType === 7 && (
            <Button
              onClick={() => navigate("/company/posts")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Create Job
            </Button>
          )}

          {userType !== 1 && userType !== 2 && (
            <Button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </>
  );
}