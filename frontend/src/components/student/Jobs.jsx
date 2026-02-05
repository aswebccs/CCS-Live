// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//     Search,
//     MapPin,
//     Briefcase,
//     Building2,
//     Clock,
//     Heart,
//     Flag,
//     ChevronDown,
//     X,
// } from "lucide-react";

// const BACKEND_URL = "http://localhost:5000";

// export default function JobBoard() {
//     const navigate = useNavigate();
//     const [loadingAppliedJobs, setLoadingAppliedJobs] = useState(true);
//     const [appliedJobs, setAppliedJobs] = useState(new Set());
//     const token = localStorage.getItem("token");

//     /* ================= STATE ================= */
//     const [jobs, setJobs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [location, setLocation] = useState("");
//     const [selectedJob, setSelectedJob] = useState(null);
//     const [savedJobs, setSavedJobs] = useState(new Set());
//     const [openDropdown, setOpenDropdown] = useState(null);

//     const [filters, setFilters] = useState({
//         datePosted: [],
//         employmentType: [],
//         workMode: [],
//         companyType: [],
//         industry: [],
//     });

//     /* ================= FETCH JOBS ================= */
//     useEffect(() => {
//         fetchJobs();
//     }, []);

//     const fetchJobs = async () => {
//         try {
//             setLoading(true);

//             const res = await fetch(`${BACKEND_URL}/api/profile/companies`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             const data = await res.json();

//             /**
//              * Convert company-wise jobs → flat list
//              * IMPORTANT: Ensure job.id is stored as string for consistent comparison
//              */
//             const formattedJobs = data.flatMap((company) =>
//                 company.jobs.map((job) => ({
//                     id: String(job.id), // ✅ Convert to string immediately
//                     title: job.title,
//                     company: company.company_name,

//                     location: job.location || "Not specified",
//                     workMode: job.work_mode || "On-site",

//                     salary: job.salary || "As per company norms",

//                     employmentType:
//                         job.job_types?.length > 0
//                             ? job.job_types.join(", ")
//                             : "Full-time",

//                     experience: job.experience || "Not specified",

//                     posted: job.posted_at
//                         ? new Date(job.posted_at).toLocaleDateString()
//                         : "Recently",

//                     postedRaw: job.posted_at,

//                     companyType: company.company_type || "Company",
//                     industry: company.industry || "General",

//                     description: job.description || "No description provided.",

//                     benefits: job.benefits || [],
//                     shifts: job.shifts || [],
//                     languages: job.languages || [],
//                 }))
//             );

//             setJobs(formattedJobs);
//         } catch (err) {
//             console.error("FETCH JOBS ERROR:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     /* ================= FETCH APPLIED JOBS ================= */
//     useEffect(() => {
//         const fetchAppliedJobs = async () => {
//             try {
//                 const res = await fetch(`${BACKEND_URL}/api/profile/jobs/applied`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 const data = await res.json();

//                 if (data.success) {
//                     // ✅ Backend already returns strings, create Set directly
//                     setAppliedJobs(new Set(data.data));
//                     console.log("Applied Jobs:", data.data); // Debug log
//                 }
//             } catch (err) {
//                 console.error("Error fetching applied jobs:", err);
//             } finally {
//                 setLoadingAppliedJobs(false);
//             }
//         };

//         fetchAppliedJobs();
//     }, [token]);

//     /* ================= SAVE/UNSAVE JOB ================= */
//     const toggleSaveJob = (jobId) => {
//         const newSaved = new Set(savedJobs);
//         if (newSaved.has(jobId)) {
//             newSaved.delete(jobId);
//         } else {
//             newSaved.add(jobId);
//         }
//         setSavedJobs(newSaved);
//     };

//     /* ================= FILTER HANDLERS ================= */
//     const handleFilterChange = (filterType, value) => {
//         setFilters((prev) => {
//             const currentValues = prev[filterType];
//             const newValues = currentValues.includes(value)
//                 ? currentValues.filter((v) => v !== value)
//                 : [...currentValues, value];
//             return { ...prev, [filterType]: newValues };
//         });
//     };

//     const removeFilter = (filterType, value) => {
//         setFilters((prev) => ({
//             ...prev,
//             [filterType]: prev[filterType].filter((v) => v !== value),
//         }));
//     };

//     const clearAllFilters = () => {
//         setFilters({
//             datePosted: [],
//             employmentType: [],
//             workMode: [],
//             companyType: [],
//             industry: [],
//         });
//     };

//     /* ================= FILTER LOGIC ================= */
//     const filteredJobs = jobs.filter((job) => {
//         const matchesSearch =
//             searchQuery === "" ||
//             job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             job.company.toLowerCase().includes(searchQuery.toLowerCase());

//         const matchesLocation =
//             location === "" ||
//             job.location.toLowerCase().includes(location.toLowerCase());

//         const matchesEmployment =
//             filters.employmentType.length === 0 ||
//             filters.employmentType.some((t) =>
//                 job.employmentType.includes(t)
//             );

//         const matchesWorkMode =
//             filters.workMode.length === 0 ||
//             filters.workMode.includes(job.workMode);

//         const matchesCompanyType =
//             filters.companyType.length === 0 ||
//             filters.companyType.includes(job.companyType);

//         const matchesIndustry =
//             filters.industry.length === 0 ||
//             filters.industry.includes(job.industry);

//         let matchesDatePosted = true;

//         if (filters.datePosted.length > 0) {
//             if (!job.postedRaw) return false;

//             const jobDate = new Date(job.postedRaw);
//             const now = new Date();
//             const daysDifference = Math.floor(
//                 (now - jobDate) / (1000 * 60 * 60 * 24)
//             );

//             matchesDatePosted = filters.datePosted.some((filter) => {
//                 if (filter === "Past 24 hours") return daysDifference <= 1;
//                 if (filter === "Past 3 days") return daysDifference <= 3;
//                 if (filter === "Past 7 days") return daysDifference <= 7;
//                 if (filter === "Past 14 days") return daysDifference <= 14;
//                 if (filter === "Past 30 days") return daysDifference <= 30;
//                 return true;
//             });
//         }

//         return (
//             matchesSearch &&
//             matchesLocation &&
//             matchesEmployment &&
//             matchesWorkMode &&
//             matchesCompanyType &&
//             matchesIndustry &&
//             matchesDatePosted
//         );
//     });

//     /* ================= FILTER DROPDOWN COMPONENT ================= */
//     const FilterDropdown = ({ title, options, filterKey }) => {
//         const isOpen = openDropdown === filterKey;
//         const selectedCount = filters[filterKey].length;

//         return (
//             <div className="relative">
//                 <button
//                     onClick={() => setOpenDropdown(isOpen ? null : filterKey)}
//                     className={`px-4 py-2 border rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors ${selectedCount > 0
//                         ? "border-blue-600 bg-blue-50 text-blue-700"
//                         : "border-gray-300 bg-white text-gray-700"
//                         }`}
//                 >
//                     {title}
//                     {selectedCount > 0 && (
//                         <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
//                             {selectedCount}
//                         </span>
//                     )}
//                     <ChevronDown
//                         className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
//                             }`}
//                     />
//                 </button>

//                 {isOpen && (
//                     <>
//                         <div
//                             className="fixed inset-0 z-10"
//                             onClick={() => setOpenDropdown(null)}
//                         />
//                         <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-64 max-h-96 overflow-y-auto">
//                             <div className="p-4 space-y-2">
//                                 {options.map((option) => (
//                                     <label
//                                         key={option}
//                                         className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
//                                     >
//                                         <input
//                                             type="checkbox"
//                                             checked={filters[filterKey].includes(
//                                                 option
//                                             )}
//                                             onChange={() =>
//                                                 handleFilterChange(
//                                                     filterKey,
//                                                     option
//                                                 )
//                                             }
//                                             className="mr-3 w-4 h-4 text-blue-600"
//                                         />
//                                         <span className="text-sm text-gray-700">
//                                             {option}
//                                         </span>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>
//                     </>
//                 )}
//             </div>
//         );
//     };

//     const hasActiveFilters = Object.values(filters).some(
//         (arr) => arr.length > 0
//     );

//     /* ================= UI ================= */
//     return (
//         <div className="flex flex-col h-screen bg-gray-50">
//             {/* Header - Search Bar */}
//             <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
//                 <div className="px-6 py-4">
//                     <div className="flex items-center gap-3 max-w-7xl mx-auto">
//                         <div className="flex-1 relative">
//                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                             <input
//                                 type="text"
//                                 placeholder="Job title, keywords, or company"
//                                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                             />
//                         </div>
//                         <div className="w-80 relative">
//                             <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                             <input
//                                 type="text"
//                                 placeholder="City, state, or pin code"
//                                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 value={location}
//                                 onChange={(e) => setLocation(e.target.value)}
//                             />
//                         </div>
//                         <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors whitespace-nowrap">
//                             Find jobs
//                         </button>
//                     </div>
//                 </div>

//                 {/* Filter Buttons Row */}
//                 <div className="px-6 pb-4">
//                     <div className="flex items-center gap-3 max-w-7xl mx-auto flex-wrap">
//                         <FilterDropdown
//                             title="Date Posted"
//                             options={[
//                                 "Past 24 hours",
//                                 "Past 3 days",
//                                 "Past 7 days",
//                                 "Past 14 days",
//                                 "Past 30 days",
//                             ]}
//                             filterKey="datePosted"
//                         />
//                         <FilterDropdown
//                             title="Employment Type"
//                             options={[
//                                 "Full-time", "Permanent", "Fresher", "Part-time",
//                                 "Internship", "Contractual / Temporary", "Freelance", "Volunteer"
//                             ]}
//                             filterKey="employmentType"
//                         />
//                         <FilterDropdown
//                             title="Work Mode"
//                             options={["Remote", "On-site", "Hybrid", "In person", "On the road"]}
//                             filterKey="workMode"
//                         />
//                         <FilterDropdown
//                             title="Company Type"
//                             options={[
//                                 "Public company",
//                                 "Privately held",
//                                 "Partnership",
//                                 "Nonprofit",
//                                 "Government Agency",
//                                 "Self-employed",
//                             ]}
//                             filterKey="companyType"
//                         />
//                         <FilterDropdown
//                             title="Industry"
//                             options={[
//                                 "Web Development & Digital Marketing",
//                                 "IT Services",
//                                 "Analytics",
//                                 "Design",
//                                 "Marketing",
//                                 "Consulting",
//                                 "Mobile Apps",
//                                 "E-commerce",
//                                 "Finance",
//                                 "General",
//                             ]}
//                             filterKey="industry"
//                         />

//                         {hasActiveFilters && (
//                             <button
//                                 onClick={clearAllFilters}
//                                 className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
//                             >
//                                 Clear all
//                             </button>
//                         )}
//                     </div>
//                 </div>

//                 {/* Active Filters Display */}
//                 {hasActiveFilters && (
//                     <div className="px-6 pb-4 border-t border-gray-100">
//                         <div className="max-w-7xl mx-auto pt-3">
//                             <div className="flex items-center gap-2 flex-wrap">
//                                 <span className="text-sm text-gray-600">
//                                     Active filters:
//                                 </span>
//                                 {Object.entries(filters).map(([key, values]) =>
//                                     values.map((value) => (
//                                         <span
//                                             key={`${key}-${value}`}
//                                             className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
//                                         >
//                                             {value}
//                                             <button
//                                                 onClick={() =>
//                                                     removeFilter(key, value)
//                                                 }
//                                                 className="hover:bg-blue-200 rounded-full p-0.5"
//                                             >
//                                                 <X className="w-3 h-3" />
//                                             </button>
//                                         </span>
//                                     ))
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </header>

//             <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">
//                 {/* Left - Job Listings */}
//                 <main className="flex-1 overflow-y-auto bg-gray-50 border-r border-gray-200">
//                     <div className="p-4">
//                         <div className="mb-4 flex justify-between items-center">
//                             <p className="text-sm text-gray-600">
//                                 {loading ? (
//                                     "Loading..."
//                                 ) : (
//                                     <>
//                                         <span className="font-semibold">
//                                             {filteredJobs.length}
//                                         </span>{" "}
//                                         jobs found
//                                     </>
//                                 )}
//                             </p>
//                         </div>

//                         {loading && (
//                             <p className="text-center text-gray-500 py-10">
//                                 Loading jobs...
//                             </p>
//                         )}

//                         {!loading && filteredJobs.length === 0 && (
//                             <p className="text-center text-gray-500 py-10">
//                                 No jobs found
//                             </p>
//                         )}

//                         <div className="space-y-3">
//                             {!loading &&
//                                 filteredJobs.map((job) => (
//                                     <div
//                                         key={job.id}
//                                         onClick={() => setSelectedJob(job)}
//                                         className={`bg-white p-4 rounded-lg border cursor-pointer hover:shadow-lg transition-all ${selectedJob?.id === job.id
//                                             ? "border-blue-500 shadow-lg ring-2 ring-blue-100"
//                                             : "border-gray-200"
//                                             }`}
//                                     >
//                                         <div className="flex justify-between items-start">
//                                             <div className="flex-1">
//                                                 <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
//                                                     {job.title}
//                                                 </h3>
//                                                 <p className="text-gray-700 font-medium mt-1">
//                                                     {job.company}
//                                                 </p>
//                                                 <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 flex-wrap">
//                                                     <span className="flex items-center gap-1">
//                                                         <MapPin className="w-4 h-4" />
//                                                         {job.location}
//                                                     </span>
//                                                     <span className="flex items-center gap-1">
//                                                         <span className="font-semibold text-gray-600">₹</span>
//                                                         {job.salary}
//                                                     </span>
//                                                     <span className="flex items-center gap-1">
//                                                         <Building2 className="w-4 h-4" />
//                                                         {job.workMode}
//                                                     </span>
//                                                 </div>
//                                                 <div className="flex items-center gap-2 mt-3 flex-wrap">
//                                                     {job.employmentType
//                                                         .split(", ")
//                                                         .map((type) => (
//                                                             <span
//                                                                 key={type}
//                                                                 className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded font-medium"
//                                                             >
//                                                                 {type}
//                                                             </span>
//                                                         ))}
//                                                     <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded font-medium">
//                                                         {job.companyType}
//                                                     </span>
//                                                 </div>
//                                                 <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
//                                                     <Clock className="w-3 h-3" />
//                                                     Posted {job.posted}
//                                                 </p>
//                                             </div>
//                                             <button
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     toggleSaveJob(job.id);
//                                                 }}
//                                                 className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//                                             >
//                                                 <Heart
//                                                     className={`w-5 h-5 ${savedJobs.has(job.id)
//                                                         ? "fill-red-500 text-red-500"
//                                                         : "text-gray-400"
//                                                         }`}
//                                                 />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))}
//                         </div>
//                     </div>
//                 </main>

//                 {/* Right - Job Details */}
//                 <aside className="w-[420px] bg-white overflow-y-auto overflow-x-hidden">
//                     {selectedJob ? (
//                         <div className="p-6 max-w-full">
//                             <div className="flex justify-between items-start mb-4">
//                                 <div>
//                                     <h2 className="text-2xl font-bold text-gray-900">
//                                         {selectedJob.title}
//                                     </h2>
//                                     <p className="text-lg text-gray-700 mt-1 font-medium">
//                                         {selectedJob.company}
//                                     </p>
//                                 </div>
//                                 <div className="flex gap-2">
//                                     <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">

//                                     </button>
//                                     <button
//                                         onClick={() =>
//                                             toggleSaveJob(selectedJob.id)
//                                         }
//                                         className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//                                     >
//                                         <Heart
//                                             className={`w-5 h-5 ${savedJobs.has(selectedJob.id)
//                                                 ? "fill-red-500 text-red-500"
//                                                 : "text-gray-600"
//                                                 }`}
//                                         />
//                                     </button>
//                                 </div>
//                             </div>

//                             <div className="space-y-2 mb-6">
//                                 <div className="flex items-center gap-2 text-gray-700">
//                                     <MapPin className="w-5 h-5 text-gray-500" />
//                                     <span>{selectedJob.location}</span>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-gray-700">
//                                     <span className="font-semibold text-gray-600">₹</span>
//                                     <span>{selectedJob.salary}</span>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-gray-700">
//                                     <Briefcase className="w-5 h-5 text-gray-500" />
//                                     <span>{selectedJob.employmentType}</span>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-gray-700">
//                                     <Building2 className="w-5 h-5 text-gray-500" />
//                                     <span>
//                                         {selectedJob.workMode} •{" "}
//                                         {selectedJob.companyType}
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-gray-700">
//                                     <Clock className="w-5 h-5 text-gray-500" />
//                                     <span>
//                                         {selectedJob.experience} experience
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-gray-700">
//                                     <Clock className="w-5 h-5 text-gray-500" />
//                                     <span>Posted {selectedJob.posted}</span>
//                                 </div>
//                             </div>

//                             {/* ✅ FIXED: Proper string comparison */}
//                             {loadingAppliedJobs ? (
//                                 <button
//                                     disabled
//                                     className="w-full py-3 bg-gray-200 text-gray-500 font-semibold rounded-lg mb-3 cursor-not-allowed"
//                                 >
//                                     Loading...
//                                 </button>
//                             ) : appliedJobs.has(selectedJob.id) ? (
//                                 <button
//                                     disabled
//                                     className="w-full py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg mb-3 cursor-not-allowed"
//                                 >
//                                     Already Applied
//                                 </button>
//                             ) : (
//                                 <button
//                                     onClick={() => {
//                                         navigate(`/jobs/apply/${selectedJob.id}`);
//                                         // ✅ Add to applied jobs immediately
//                                         setAppliedJobs(prev => new Set([...prev, selectedJob.id]));
//                                     }}
//                                     className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 mb-3 transition-colors"
//                                 >
//                                     Apply Now
//                                 </button>
//                             )}

//                             <button
//                                 onClick={() => toggleSaveJob(selectedJob.id)}
//                                 className="w-full py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 mb-6 transition-colors"
//                             >
//                                 {savedJobs.has(selectedJob.id)
//                                     ? "Saved"
//                                     : "Save Job"}
//                             </button>

//                             <div className="border-t border-gray-200 pt-6">
//                                 <h3 className="text-lg font-semibold text-gray-900 mb-3">
//                                     Job Description
//                                 </h3>
//                                 <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap break-words overflow-wrap-anywhere">
//                                     {selectedJob.description}
//                                 </p>

//                                 {selectedJob.benefits?.length > 0 && (
//                                     <>
//                                         <h3 className="text-lg font-semibold text-gray-900 mb-3">
//                                             Benefits
//                                         </h3>
//                                         <div className="flex flex-wrap gap-2 mb-6">
//                                             {selectedJob.benefits.map(
//                                                 (benefit, idx) => (
//                                                     <span
//                                                         key={idx}
//                                                         className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100"
//                                                     >
//                                                         {benefit}
//                                                     </span>
//                                                 )
//                                             )}
//                                         </div>
//                                     </>
//                                 )}

//                                 {selectedJob.shifts?.length > 0 && (
//                                     <>
//                                         <h3 className="text-lg font-semibold text-gray-900 mb-3">
//                                             Shifts
//                                         </h3>
//                                         <div className="flex flex-wrap gap-2 mb-6">
//                                             {selectedJob.shifts.map(
//                                                 (shift, idx) => (
//                                                     <span
//                                                         key={idx}
//                                                         className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-100"
//                                                     >
//                                                         {shift}
//                                                     </span>
//                                                 )
//                                             )}
//                                         </div>
//                                     </>
//                                 )}

//                                 {selectedJob.languages?.length > 0 && (
//                                     <>
//                                         <h3 className="text-lg font-semibold text-gray-900 mb-3">
//                                             Languages
//                                         </h3>
//                                         <div className="flex flex-wrap gap-2 mb-6">
//                                             {selectedJob.languages.map(
//                                                 (language, idx) => (
//                                                     <span
//                                                         key={idx}
//                                                         className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
//                                                     >
//                                                         {language}
//                                                     </span>
//                                                 )
//                                             )}
//                                         </div>
//                                     </>
//                                 )}

//                                 <h3 className="text-lg font-semibold text-gray-900 mb-3">
//                                     About the Role
//                                 </h3>
//                                 <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2 text-sm">
//                                     <div className="flex justify-between">
//                                         <span className="text-gray-600">
//                                             Industry:
//                                         </span>
//                                         <span className="font-medium text-gray-900">
//                                             {selectedJob.industry}
//                                         </span>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span className="text-gray-600">
//                                             Company Type:
//                                         </span>
//                                         <span className="font-medium text-gray-900">
//                                             {selectedJob.companyType}
//                                         </span>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span className="text-gray-600">
//                                             Work Mode:
//                                         </span>
//                                         <span className="font-medium text-gray-900">
//                                             {selectedJob.workMode}
//                                         </span>
//                                     </div>
//                                 </div>

//                                 <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm transition-colors">
//                                     <Flag className="w-4 h-4" />
//                                     Report job
//                                 </button>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="flex items-center justify-center h-full text-gray-500">
//                             <div className="text-center p-8">
//                                 <Briefcase className="w-20 h-20 mx-auto mb-4 text-gray-300" />
//                                 <p className="text-lg font-medium">
//                                     Select a job to view details
//                                 </p>
//                                 <p className="text-sm text-gray-400 mt-2">
//                                     Click on any job listing to see full
//                                     information
//                                 </p>
//                             </div>
//                         </div>
//                     )}
//                 </aside>
//             </div>
//         </div>
//     );
// }


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    MapPin,
    Briefcase,
    Building2,
    Clock,
    Heart,
    Flag,
    ChevronDown,
    X,
} from "lucide-react";

// const BACKEND_URL = "http://localhost:5000";

const API_URL = import.meta.env.VITE_API_URL;

export default function JobBoard() {
    const navigate = useNavigate();
    const [loadingAppliedJobs, setLoadingAppliedJobs] = useState(true);
    const [appliedJobs, setAppliedJobs] = useState(new Set());
    const token = localStorage.getItem("token");
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(""); // ✅ Single unified search
    const [selectedJob, setSelectedJob] = useState(null);
    const [savedJobs, setSavedJobs] = useState(new Set());
    const [openDropdown, setOpenDropdown] = useState(null);

    const [filters, setFilters] = useState({
        datePosted: [],
        employmentType: [],
        workMode: [],
        companyType: [],
        industry: [],
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);

            const res = await fetch(`${API_URL}/student/companies`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            const formattedJobs = data.flatMap((company) =>
                company.jobs.map((job) => ({
                    id: String(job.id),
                    title: job.title,
                    company: company.company_name,
                    location: job.location || "Not specified",
                    workMode: job.work_mode || "On-site",
                    salary: job.salary || "As per company norms",
                    employmentType:
                        job.job_types?.length > 0
                            ? job.job_types.join(", ")
                            : "Full-time",
                    experience: job.experience || "Not specified",
                    posted: job.posted_at
                        ? new Date(job.posted_at).toLocaleDateString()
                        : "Recently",
                    postedRaw: job.posted_at,
                    companyType: company.company_type || "Company",
                    industry: company.industry || "General",
                    description: job.description || "No description provided.",
                    benefits: job.benefits || [],
                    shifts: job.shifts || [],
                    languages: job.languages || [],
                }))
            );

            setJobs(formattedJobs);
        } catch (err) {
            console.error("FETCH JOBS ERROR:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchAppliedJobs = async () => {
            try {
                const res = await fetch(`${API_URL}/student/jobs/applied-ids`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();

                if (data.success) {
                    setAppliedJobs(new Set(data.data));
                }
            } catch (err) {
                console.error("Error fetching applied jobs:", err);
            } finally {
                setLoadingAppliedJobs(false);
            }
        };

        fetchAppliedJobs();
    }, [token]);

    const toggleSaveJob = (jobId) => {
        const newSaved = new Set(savedJobs);
        if (newSaved.has(jobId)) {
            newSaved.delete(jobId);
        } else {
            newSaved.add(jobId);
        }
        setSavedJobs(newSaved);
    };

    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => {
            const currentValues = prev[filterType];
            const newValues = currentValues.includes(value)
                ? currentValues.filter((v) => v !== value)
                : [...currentValues, value];
            return { ...prev, [filterType]: newValues };
        });
    };

    const removeFilter = (filterType, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: prev[filterType].filter((v) => v !== value),
        }));
    };

    const clearAllFilters = () => {
        setFilters({
            datePosted: [],
            employmentType: [],
            workMode: [],
            companyType: [],
            industry: [],
        });
    };

    // ✅ IMPROVED FILTERING LOGIC - Single search handles everything
    const filteredJobs = jobs.filter((job) => {
        // ✅ Unified search - checks job title, company name, AND location
        const searchLower = searchQuery.toLowerCase().trim();
        const matchesSearch =
            searchQuery === "" ||
            job.title.toLowerCase().includes(searchLower) ||
            job.company.toLowerCase().includes(searchLower) ||
            job.location.toLowerCase().includes(searchLower) ||
            job.industry.toLowerCase().includes(searchLower);

        const matchesEmployment =
            filters.employmentType.length === 0 ||
            filters.employmentType.some((t) =>
                job.employmentType.includes(t)
            );

        const matchesWorkMode =
            filters.workMode.length === 0 ||
            filters.workMode.includes(job.workMode);

        const matchesCompanyType =
            filters.companyType.length === 0 ||
            filters.companyType.includes(job.companyType);

        const matchesIndustry =
            filters.industry.length === 0 ||
            filters.industry.includes(job.industry);

        let matchesDatePosted = true;

        if (filters.datePosted.length > 0) {
            if (!job.postedRaw) return false;

            const jobDate = new Date(job.postedRaw);
            const now = new Date();
            const daysDifference = Math.floor(
                (now - jobDate) / (1000 * 60 * 60 * 24)
            );

            matchesDatePosted = filters.datePosted.some((filter) => {
                if (filter === "Past 24 hours") return daysDifference <= 1;
                if (filter === "Past 3 days") return daysDifference <= 3;
                if (filter === "Past 7 days") return daysDifference <= 7;
                if (filter === "Past 14 days") return daysDifference <= 14;
                if (filter === "Past 30 days") return daysDifference <= 30;
                return true;
            });
        }

        return (
            matchesSearch &&
            matchesEmployment &&
            matchesWorkMode &&
            matchesCompanyType &&
            matchesIndustry &&
            matchesDatePosted
        );
    });

    const FilterDropdown = ({ title, options, filterKey }) => {
        const isOpen = openDropdown === filterKey;
        const selectedCount = filters[filterKey].length;

        return (
            <div className="relative">
                <button
                    onClick={() => setOpenDropdown(isOpen ? null : filterKey)}
                    className={`px-4 py-2 border rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors ${selectedCount > 0
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700"
                        }`}
                >
                    {title}
                    {selectedCount > 0 && (
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {selectedCount}
                        </span>
                    )}
                    <ChevronDown
                        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
                            }`}
                    />
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenDropdown(null)}
                        />
                        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-64 max-h-96 overflow-y-auto">
                            <div className="p-4 space-y-2">
                                {options.map((option) => (
                                    <label
                                        key={option}
                                        className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={filters[filterKey].includes(
                                                option
                                            )}
                                            onChange={() =>
                                                handleFilterChange(
                                                    filterKey,
                                                    option
                                                )
                                            }
                                            className="mr-3 w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {option}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    const hasActiveFilters = Object.values(filters).some(
        (arr) => arr.length > 0
    );

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* ✅ UPDATED HEADER - Single Search Box */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="px-6 py-4">
                    <div className="flex items-center gap-3 max-w-7xl mx-auto">
                        {/* ✅ Single Unified Search Box */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by job title, company, location, or industry..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search Suggestions/Examples */}
                    {!searchQuery && (
                        <div className="max-w-7xl mx-auto mt-2 px-6">

                        </div>
                    )}
                </div>

                {/* Filter Dropdowns */}
                <div className="px-6 pb-4">
                    <div className="flex items-center gap-3 max-w-7xl mx-auto flex-wrap">
                        <FilterDropdown
                            title="Date Posted"
                            options={[
                                "Past 24 hours",
                                "Past 3 days",
                                "Past 7 days",
                                "Past 14 days",
                                "Past 30 days",
                            ]}
                            filterKey="datePosted"
                        />
                        <FilterDropdown
                            title="Employment Type"
                            options={[
                                "Full-time", "Permanent", "Fresher", "Part-time",
                                "Internship", "Contractual / Temporary", "Freelance", "Volunteer"
                            ]}
                            filterKey="employmentType"
                        />
                        <FilterDropdown
                            title="Work Mode"
                            options={["Remote", "On-site", "Hybrid", "In person", "On the road"]}
                            filterKey="workMode"
                        />
                        <FilterDropdown
                            title="Company Type"
                            options={[
                                "Public company",
                                "Privately held",
                                "Partnership",
                                "Nonprofit",
                                "Government Agency",
                                "Self-employed",
                            ]}
                            filterKey="companyType"
                        />
                        <FilterDropdown
                            title="Industry"
                            options={[
                                "Web Development & Digital Marketing",
                                "IT Services",
                                "Analytics",
                                "Design",
                                "Marketing",
                                "Consulting",
                                "Mobile Apps",
                                "E-commerce",
                                "Finance",
                                "General",
                            ]}
                            filterKey="industry"
                        />

                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="px-6 pb-4 border-t border-gray-100">
                        <div className="max-w-7xl mx-auto pt-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-gray-600">
                                    Active filters:
                                </span>
                                {Object.entries(filters).map(([key, values]) =>
                                    values.map((value) => (
                                        <span
                                            key={`${key}-${value}`}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                        >
                                            {value}
                                            <button
                                                onClick={() =>
                                                    removeFilter(key, value)
                                                }
                                                className="hover:bg-blue-200 rounded-full p-0.5"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">
                {/* Left - Job Listings */}
                <main className="flex-1 overflow-y-auto bg-gray-50 border-r border-gray-200">
                    <div className="p-4">
                        <div className="mb-4 flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                {loading ? (
                                    "Loading..."
                                ) : (
                                    <>
                                        <span className="font-semibold">
                                            {filteredJobs.length}
                                        </span>{" "}
                                        jobs found
                                        {searchQuery && (
                                            <span className="text-gray-500">
                                                {" "}for "{searchQuery}"
                                            </span>
                                        )}
                                    </>
                                )}
                            </p>
                        </div>

                        {loading && (
                            <p className="text-center text-gray-500 py-10">
                                Loading jobs...
                            </p>
                        )}

                        {!loading && filteredJobs.length === 0 && (
                            <div className="text-center text-gray-500 py-10">
                                <p className="text-lg font-medium mb-2">No jobs found</p>
                                {searchQuery && (
                                    <p className="text-sm">
                                        Try adjusting your search or filters
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="space-y-3">
                            {!loading &&
                                filteredJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        onClick={() => setSelectedJob(job)}
                                        className={`bg-white p-4 rounded-lg border cursor-pointer hover:shadow-lg transition-all ${selectedJob?.id === job.id
                                            ? "border-blue-500 shadow-lg ring-2 ring-blue-100"
                                            : "border-gray-200"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                                                    {job.title}
                                                </h3>
                                                <p className="text-gray-700 font-medium mt-1">
                                                    {job.company}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {job.location}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="font-semibold text-gray-600">₹</span>
                                                        {job.salary}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="w-4 h-4" />
                                                        {job.workMode}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                    {job.employmentType
                                                        .split(", ")
                                                        .map((type) => (
                                                            <span
                                                                key={type}
                                                                className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded font-medium"
                                                            >
                                                                {type}
                                                            </span>
                                                        ))}
                                                    <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded font-medium">
                                                        {job.companyType}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Posted {job.posted}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSaveJob(job.id);
                                                }}
                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <Heart
                                                    className={`w-5 h-5 ${savedJobs.has(job.id)
                                                        ? "fill-red-500 text-red-500"
                                                        : "text-gray-400"
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </main>

                {/* Right - Job Details */}
                <aside className="w-[420px] bg-white overflow-y-auto overflow-x-hidden">
                    {selectedJob ? (
                        <div className="p-6 max-w-full">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {selectedJob.title}
                                    </h2>
                                    <p className="text-lg text-gray-700 mt-1 font-medium">
                                        {selectedJob.company}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            toggleSaveJob(selectedJob.id)
                                        }
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <Heart
                                            className={`w-5 h-5 ${savedJobs.has(selectedJob.id)
                                                ? "fill-red-500 text-red-500"
                                                : "text-gray-600"
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                    <span>{selectedJob.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <span className="font-semibold text-gray-600">₹</span>
                                    <span>{selectedJob.salary}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Briefcase className="w-5 h-5 text-gray-500" />
                                    <span>{selectedJob.employmentType}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Building2 className="w-5 h-5 text-gray-500" />
                                    <span>
                                        {selectedJob.workMode} •{" "}
                                        {selectedJob.companyType}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Clock className="w-5 h-5 text-gray-500" />
                                    <span>
                                        {selectedJob.experience} experience
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Clock className="w-5 h-5 text-gray-500" />
                                    <span>Posted {selectedJob.posted}</span>
                                </div>
                            </div>

                            {loadingAppliedJobs ? (
                                <button
                                    disabled
                                    className="w-full py-3 bg-gray-200 text-gray-500 font-semibold rounded-lg mb-3"
                                >
                                    Loading...
                                </button>
                            ) : appliedJobs.has(String(selectedJob.id)) ? (
                                <button
                                    disabled
                                    className="w-full py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg mb-3"
                                >
                                    Already Applied
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        navigate(`/jobs/apply/${selectedJob.id}`);
                                        setAppliedJobs(prev => {
                                            const updated = new Set(prev);
                                            updated.add(String(selectedJob.id));
                                            return updated;
                                        });
                                    }}
                                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Apply Now
                                </button>
                            )}

                            <button
                                onClick={() => toggleSaveJob(selectedJob.id)}
                                className="w-full py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 mb-6 transition-colors"
                            >
                                {savedJobs.has(selectedJob.id)
                                    ? "Saved"
                                    : "Save Job"}
                            </button>

                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Job Description
                                </h3>
                                <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap break-words overflow-wrap-anywhere">
                                    {selectedJob.description}
                                </p>

                                {selectedJob.benefits?.length > 0 && (
                                    <>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            Benefits
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {selectedJob.benefits.map(
                                                (benefit, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100"
                                                    >
                                                        {benefit}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </>
                                )}

                                {selectedJob.shifts?.length > 0 && (
                                    <>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            Shifts
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {selectedJob.shifts.map(
                                                (shift, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-100"
                                                    >
                                                        {shift}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </>
                                )}

                                {selectedJob.languages?.length > 0 && (
                                    <>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            Languages
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {selectedJob.languages.map(
                                                (language, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
                                                    >
                                                        {language}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </>
                                )}

                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    About the Role
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Industry:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {selectedJob.industry}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Company Type:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {selectedJob.companyType}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Work Mode:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {selectedJob.workMode}
                                        </span>
                                    </div>
                                </div>

                                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm transition-colors">
                                    <Flag className="w-4 h-4" />
                                    Report job
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center p-8">
                                <Briefcase className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">
                                    Select a job to view details
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Click on any job listing to see full
                                    information
                                </p>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}