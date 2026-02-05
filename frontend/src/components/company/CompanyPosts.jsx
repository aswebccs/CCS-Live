// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { Label } from "../ui/label";
// import { Textarea } from "../ui/textarea";
// import { Progress } from "../ui/progress";
// import {
//     Pencil, Bold, Italic, List, ChevronLeft, Plus,
//     Check, X, MapPin, Briefcase, DollarSign,
//     Clock, Users, BookOpen, Languages, Award, Calendar,
//     MessageSquare, Mail, Phone, Building, Home, Heart, Shield
// } from "lucide-react";

// const API_BASE = "http://localhost:5000";

// const apiRequest = async (url, method = "GET", body) => {
//     const token = localStorage.getItem("token");

//     const res = await fetch(`${API_BASE}${url}`, {
//         method,
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: token ? `Bearer ${token}` : "",
//         },
//         body: body ? JSON.stringify(body) : undefined,
//     });

//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || "Something went wrong");
//     return data;
// };

// const LOCATION_TYPES = [
//     { value: "", label: "Select an option" },
//     { value: "In person", label: "In person" },
//     { value: "Fully remote", label: "Fully remote" },
//     { value: "Hybrid", label: "Hybrid" },
//     { value: "On the road", label: "On the road" },
// ];
// const JOB_TYPES = [
//     "Full-time", "Permanent", "Fresher", "Part-time",
//     "Internship", "Contractual / Temporary", "Freelance", "Volunteer"
// ];

// const TIMELINES = [
//     { value: "", label: "Select an option" },
//     { value: "1 to 3 days", label: "1 to 3 days" },
//     { value: "3 to 7 days", label: "3 to 7 days" },
//     { value: "1 to 2 weeks", label: "1 to 2 weeks" },
//     { value: "2 to 4 weeks", label: "2 to 4 weeks" },
//     { value: "More than 4 weeks", label: "More than 4 weeks" }
// ];

// const ED_LEVELS = [
//     "Secondary (10th Pass)",
//     "Higher Secondary (12th Pass)",
//     "Diploma",
//     "Bachelor's Degree",
//     "Master's Degree",
//     "Doctorate"
// ];

// const PAY_RATES = ["per hour", "per day", "per month", "per year"];

// const BENEFIT_OPTIONS = [
//     { id: "health", label: "Health insurance", icon: Heart },
//     { id: "wfh", label: "Work from home", icon: Home },
//     { id: "flexible", label: "Flexible schedule", icon: Clock },
//     { id: "life", label: "Life insurance", icon: Shield },
// ];

// const QUALIFICATION_SECTIONS = [
//     { id: "education", label: "Education", icon: BookOpen, type: "select" },
//     {
//         id: "experience",
//         label: "Experience",
//         icon: Briefcase,
//         type: "structured",
//         fields: [
//             { name: "years", label: "How many years of experience are required?" },
//             { name: "type", label: "What type of experience?" }
//         ]
//     },
//     {
//         id: "language",
//         label: "Language",
//         icon: Languages,
//         type: "multiselect",
//         options: ["English", "Hindi", "Tamil", "Telugu", "Marathi", "Bengali", "Gujarati", "Kannada", "Malayalam", "Punjabi"]
//     },
//     {
//         id: "certifications",
//         label: "Licence / Certification",
//         icon: Award,
//         type: "text"
//     },
//     {
//         id: "location_qual",
//         label: "Location",
//         icon: MapPin,
//         type: "text"
//     },
//     {
//         id: "shift",
//         label: "Shift availability",
//         icon: Clock,
//         type: "multiselect",
//         options: ["Day shift", "Night shift", "Evening shift", "Weekend availability", "Flexible hours"]
//     },
//     {
//         id: "travel",
//         label: "Willingness to travel",
//         icon: Building,
//         type: "select_percent",
//         options: ["Not required", "Up to 25%", "Up to 50%", "Up to 75%", "Up to 100%"]
//     },
//     { id: "custom", label: "Create custom question", icon: MessageSquare, type: "custom" },
// ];

// export default function IndeedClonePost() {
//     const navigate = useNavigate();
//     const [step, setStep] = useState(1);
//     const [expandedQuals, setExpandedQuals] = useState({});
//     const totalSteps = 7;
//     const [job, setJob] = useState(
//         {

//             title: "",
//             location_type: "",
//             location: "",
//             must_reside: "",
//             timeline: "",
//             hiring_count: 1,
//             job_types: [],
//             pay_show_by: "",
//             pay_min: "",
//             pay_max: "",
//             pay_rate: "",
//             selected_benefits: [],
//             custom_benefits: "",
//             description: "",
//             education: "",
//             experience_years: "",
//             experience_type: "",
//             language: [],
//             certifications: "",
//             location_qual: "",
//             shift: [],
//             travel: "",
//             custom_questions: [],
//         });

//     useEffect(() => {
//         if (job.location_type === "Fully remote" && !job.location) {
//             setJob(prev => ({
//                 ...prev,
//                 location: "Remote"
//             }));
//         }
//     }, [job.location_type]);

//     const PAY_VALIDATION_RULES = {
//         "per hour": { min: 50, max: 5000 },
//         "per day": { min: 400, max: 50000 },
//         "per month": { min: 5000, max: 500000 },
//         "per year": { min: 60000, max: 50000000 }
//     };



//     const updateJob = (field, value) => {
//         setJob((prev) => ({ ...prev, [field]: value }));
//     };


//     const toggleJobType = (t) => {
//         setJob(prev => ({
//             ...prev,
//             job_types: prev.job_types.includes(t)
//                 ? prev.job_types.filter(i => i !== t)
//                 : [...prev.job_types, t]
//         }));
//     };

//     const toggleBenefit = (id) => {
//         setJob(prev => ({
//             ...prev,
//             selected_benefits: prev.selected_benefits.includes(id)
//                 ? prev.selected_benefits.filter(i => i !== id)
//                 : [...prev.selected_benefits, id]
//         }));
//     };
//     const handlePayContinue = () => {
//         const error = validatePay();
//         if (error) {
//             alert(error);
//             return;
//         }
//         next();
//     };

//     const validatePay = () => {
//         if (!job.pay_show_by) {
//             return "Please select how you want to show pay";
//         }

//         if (!job.pay_rate) {
//             return "Please select pay rate";
//         }

//         const min = Number(job.pay_min);
//         const max = Number(job.pay_max);
//         const rules = PAY_VALIDATION_RULES[job.pay_rate];

//         if (job.pay_show_by !== "maximum" && (!min || min <= 0)) {
//             return "Please enter a valid minimum pay";
//         }

//         if (job.pay_show_by === "maximum" && (!min || min <= 0)) {
//             return "Please enter a valid maximum pay";
//         }

//         if (rules && min < rules.min) {
//             return `Pay is too low for ${job.pay_rate}. Typical minimum is ₹${rules.min}`;
//         }

//         if (rules && min > rules.max) {
//             return `Pay is too high for ${job.pay_rate}. Typical maximum is ₹${rules.max}`;
//         }

//         if (job.pay_show_by === "range") {
//             if (!max || max <= min) {
//                 return "Maximum pay must be greater than minimum pay";
//             }
//             if (rules && max > rules.max) {
//                 return `Maximum pay exceeds typical limit of ₹${rules.max}`;
//             }
//         }

//         return null;
//     };

//     const toggleArrayItem = (field, item) => {
//         setJob(prev => ({
//             ...prev,
//             [field]: prev[field].includes(item)
//                 ? prev[field].filter(i => i !== item)
//                 : [...prev[field], item]
//         }));
//     };

//     const toggleQualSection = (id) => {
//         setExpandedQuals(prev => ({ ...prev, [id]: !prev[id] }));
//     };

//     const addCustomQuestion = () => {
//         setJob(prev => ({
//             ...prev,
//             custom_questions: [...prev.custom_questions, { id: Date.now(), text: "", required: false }]
//         }));
//     };

//     const updateCustomQuestion = (id, field, value) => {
//         setJob(prev => ({
//             ...prev,
//             custom_questions: prev.custom_questions.map(q =>
//                 q.id === id ? { ...q, [field]: value } : q
//             )
//         }));
//     };

//     const removeCustomQuestion = (id) => {
//         setJob(prev => ({
//             ...prev,
//             custom_questions: prev.custom_questions.filter(q => q.id !== id)
//         }));
//     };

//     const next = () => {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         setStep(s => Math.min(s + 1, totalSteps));
//     };

//     const back = () => {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         setStep(s => Math.max(s - 1, 1));
//     };

//     const validateStep1 = () => {
//         if (job.title.trim().length < 3) return "Job title is too short";
//         if (!job.location_type) return "Location type is required";
//         if (!job.must_reside) return "Please specify residency requirement";
//         if (!job.location || !job.location.trim()) {
//             return "Location is required";
//         }
//         return null;
//     };

//     const validateStep2 = () => {
//         if (!job.timeline) return "Select recruitment timeline";
//         if (Number(job.hiring_count) <= 0) return "Hiring count must be greater than 0";
//         if (job.hiring_count > 50) return "Hiring count cannot exceed 50";

//         return null;
//     };
//     const validateStep3 = () => {
//         if (job.job_types.length === 0)
//             return "Select at least one job type";
//         return null;
//     };
//     const validateStep5 = () => {
//         if (!job.description || job.description.trim().length < 100)
//             return "Job description must be at least 100 characters";
//         return null;
//     };
//     const validateQualifications = () => {
//         if (job.experience_years && isNaN(job.experience_years)) {
//             return "Experience years must be a number";
//         }
//         return null;
//     };
//     const validateBeforePublish = () => {
//         if (!job.title || !job.description || !job.pay_rate) {
//             return "Job post is incomplete";
//         }
//         return null;
//     };

//     const goToStep = (targetStep) => {
//         if (targetStep > step) return;
//         setStep(targetStep);
//     };

//     return (

//         <div className="min-h-screen bg-[#f8f9fa]">
//             <div className="max-w-3xl mx-auto py-8 px-4">

//                 {/* Header */}
//                 <div className="mb-8">
//                     <div className="mb-4">
//                         <h1 className="text-2xl font-bold text-gray-900 mb-1">Post a Job</h1>
//                         <p className="text-gray-600 text-sm">Find your next great team member</p>
//                     </div>

//                     <div className="space-y-2">
//                         <div className="flex justify-between text-sm">
//                             <span className="font-semibold text-gray-700">Step {step} of {totalSteps}</span>
//                         </div>
//                         <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                             <div
//                                 className="h-full bg-[#2557a7] transition-all duration-500"
//                                 style={{ width: `${(step / totalSteps) * 100}%` }}
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* STEP 1 */}
//                 {step === 1 && (
//                     <div className="space-y-5">
//                         <h2 className="text-xl font-bold text-gray-900">Job Basics</h2>

//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
//                             <div className="space-y-2">
//                                 <Label className="text-sm font-semibold text-gray-700">Job title *</Label>
//                                 <Input
//                                     className="h-11 border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 rounded-lg"
//                                     value={job.title}
//                                     onChange={(e) => updateJob("title", e.target.value)}

//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label className="text-sm font-semibold text-gray-700">Job location type *</Label>
//                                 <select
//                                     className="w-full h-11 border-2 border-gray-200 rounded-lg px-4 bg-white focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer"
//                                     value={job.location_type}
//                                     onChange={(e) => updateJob("location_type", e.target.value)}
//                                 >
//                                     {LOCATION_TYPES.map(type => (
//                                         <option key={type.value} value={type.value}>{type.label}</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/* {job.location_type === "In person" && (
//                                 <div className="space-y-2">
//                                     <Label className="text-sm font-semibold text-gray-700">Location *</Label>
//                                     <Input
//                                         className="h-11 border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 rounded-lg"
//                                         value={job.location}
//                                         onChange={(e) => updateJob("location", e.target.value)}
//                                         placeholder="e.g., Mumbai, Maharashtra"
//                                     />
//                                 </div>
//                             )} */}
//                             <div className="space-y-2">
//                                 <Label className="text-sm font-semibold text-gray-700">Job location *</Label>
//                                 <Input
//                                     className="h-11 border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 rounded-lg"
//                                     value={job.location}
//                                     onChange={(e) => updateJob("location", e.target.value)}
//                                     placeholder={
//                                         job.location_type === "Fully remote"
//                                             ? "e.g., India / Global / Remote"
//                                             : "e.g., Mumbai, Maharashtra"
//                                     }
//                                 />
//                             </div>


//                             <div className="space-y-3 pt-4 border-t border-gray-200">
//                                 <Label className="text-sm font-semibold text-gray-700">
//                                     Are employees required to reside in a specific location?
//                                 </Label>
//                                 <div className="flex gap-3">
//                                     {["yes", "no"].map(opt => (
//                                         <label
//                                             key={opt}
//                                             className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-6 py-3 rounded-lg border-2 font-medium capitalize ${job.must_reside === opt
//                                                 ? "border-[#2557a7] bg-blue-50 text-[#2557a7]"
//                                                 : "border-gray-200 hover:border-gray-300 text-gray-700"
//                                                 }`}
//                                         >
//                                             <input
//                                                 type="radio"
//                                                 checked={job.must_reside === opt}
//                                                 onChange={() => updateJob("must_reside", opt)}
//                                                 className="w-4 h-4 accent-[#2557a7]"
//                                             />
//                                             {opt}
//                                         </label>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>

//                         <Footer
//                             next={() => {
//                                 const err = validateStep1();
//                                 if (err) return alert(err);
//                                 next();
//                             }}

//                         />



//                     </div>
//                 )}

//                 {/* STEP 2 */}
//                 {step === 2 && (
//                     <div className="space-y-5">
//                         <h2 className="text-xl font-bold text-gray-900">Hiring Goals</h2>

//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
//                             <div className="space-y-2">
//                                 <Label className="text-sm font-semibold text-gray-700">Recruitment timeline for this job *</Label>
//                                 <select
//                                     className="w-full h-11 border-2 border-gray-200 rounded-lg px-4 bg-white focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer"
//                                     value={job.timeline}
//                                     onChange={(e) => updateJob("timeline", e.target.value)}
//                                 >
//                                     {TIMELINES.map(t => (
//                                         <option key={t.value} value={t.value}>{t.label}</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <div className="space-y-2">
//                                 <Label className="text-sm font-semibold text-gray-700">Number of people to hire *</Label>
//                                 <Input
//                                     type="number"
//                                     min="0"
//                                     className="h-11 w-32 text-center font-semibold border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 rounded-lg"
//                                     value={job.hiring_count}
//                                     onChange={(e) => updateJob("hiring_count", Number(e.target.value))}

//                                 />
//                             </div>
//                         </div>

//                         <Footer
//                             back={back}
//                             next={() => {
//                                 const error = validateStep2();
//                                 if (error) {
//                                     alert(error);
//                                     return;
//                                 }
//                                 next();
//                             }}
//                         />

//                     </div>
//                 )}

//                 {/* STEP 3 */}
//                 {step === 3 && (
//                     <div className="space-y-5">
//                         <h2 className="text-xl font-bold text-gray-900">Add Job Details</h2>

//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                             <div className="flex items-center justify-between mb-4">
//                                 <p className="text-sm text-gray-600">Select all that apply</p>
//                                 <span className="text-sm font-bold text-[#2557a7] bg-blue-50 px-3 py-1 rounded-full">
//                                     {job.job_types.length} selected
//                                 </span>
//                             </div>

//                             <div className="flex flex-wrap gap-2">
//                                 {JOB_TYPES.map(t => {
//                                     const isActive = job.job_types.includes(t);
//                                     return (
//                                         <button
//                                             key={t}
//                                             onClick={() => toggleJobType(t)}
//                                             className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 font-semibold text-sm ${isActive
//                                                 ? "bg-[#2557a7] border-[#2557a7] text-white"
//                                                 : "bg-white border-gray-300 text-gray-700 hover:border-[#2557a7]"
//                                                 }`}
//                                         >
//                                             {isActive ? <Check size={16} strokeWidth={3} /> : <Plus size={16} />}
//                                             {t}
//                                         </button>
//                                     );
//                                 })}
//                             </div>
//                         </div>

//                         <Footer
//                             back={back}
//                             next={() => {
//                                 const error = validateStep3();
//                                 if (error) {
//                                     alert(error);
//                                     return;
//                                 }
//                                 next();
//                             }}
//                         />

//                     </div>
//                 )}

//                 {/* STEP 4 */}
//                 {step === 4 && (
//                     <div className="space-y-5">
//                         <h2 className="text-xl font-bold text-gray-900">Add Pay and Benefits</h2>

//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div className="space-y-2">
//                                     <Label className="text-sm font-semibold text-gray-700">Show pay by</Label>
//                                     <select
//                                         className="w-full h-11 border-2 border-gray-200 rounded-lg px-4 bg-white focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer"
//                                         value={job.pay_show_by}
//                                         onChange={(e) => updateJob("pay_show_by", e.target.value)}
//                                     >
//                                         {/* Updated: Default select an option */}
//                                         <option value="">Select an option</option>
//                                         <option value="range">Range</option>
//                                         <option value="minimum">Starting amount</option>
//                                         <option value="maximum">Maximum amount</option>
//                                     </select>
//                                 </div>

//                                 <div className="space-y-2">
//                                     <Label className="text-sm font-semibold text-gray-700">Rate</Label>
//                                     <select
//                                         className="w-full h-11 border-2 border-gray-200 rounded-lg px-4 bg-white focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer"
//                                         value={job.pay_rate}
//                                         onChange={(e) => {
//                                             updateJob("pay_rate", e.target.value);
//                                             updateJob("pay_min", "");
//                                             updateJob("pay_max", "");
//                                         }}

//                                     >
//                                         {/* Updated: Default select an option */}
//                                         <option value="">Select an option</option>
//                                         {PAY_RATES.map(r => <option key={r} value={r}>{r}</option>)}
//                                     </select>
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <div className="space-y-2">
//                                     <Label className="text-sm font-semibold text-gray-700">
//                                         {job.pay_show_by === 'maximum' ? 'Maximum' : 'Minimum'}
//                                     </Label>
//                                     <div className="relative">
//                                         <span className="absolute left-4 top-3 text-gray-500 font-bold">₹</span>
//                                         <Input
//                                             type="number"
//                                             className="pl-9 h-11 border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 rounded-lg"
//                                             value={job.pay_min}
//                                             onChange={(e) => updateJob("pay_min", e.target.value)}
//                                             placeholder="0"
//                                         />
//                                     </div>
//                                 </div>

//                                 {job.pay_show_by === 'range' && (
//                                     <div className="space-y-2">
//                                         <Label className="text-sm font-semibold text-gray-700">Maximum</Label>
//                                         <div className="relative">
//                                             <span className="absolute left-4 top-3 text-gray-500 font-bold">₹</span>
//                                             <Input
//                                                 type="number"
//                                                 className="pl-9 h-11 border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 rounded-lg"
//                                                 value={job.pay_max}
//                                                 onChange={(e) => updateJob("pay_max", e.target.value)}
//                                                 placeholder="0"
//                                             />
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>

//                             <div className="space-y-3 pt-4 border-t border-gray-200">
//                                 <Label className="text-sm font-semibold text-gray-700">Benefits</Label>
//                                 <div className="flex flex-wrap gap-2">
//                                     {BENEFIT_OPTIONS.map(benefit => {
//                                         const isActive = job.selected_benefits.includes(benefit.id);
//                                         const IconComponent = benefit.icon;
//                                         return (
//                                             <button
//                                                 key={benefit.id}
//                                                 type="button"
//                                                 onClick={() => toggleBenefit(benefit.id)}

//                                                 className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 font-semibold text-sm transition-all ${isActive
//                                                     ? "bg-[#2557a7] border-[#2557a7] text-white"
//                                                     : "bg-white border-gray-300 text-gray-700 hover:border-[#2557a7]"
//                                                     }`}
//                                             >
//                                                 <IconComponent size={16} />
//                                                 {benefit.label}
//                                             </button>
//                                         );
//                                     })}
//                                 </div>
//                             </div>

//                             <div className="space-y-2">
//                                 <Label className="text-sm font-semibold text-gray-700">Additional benefits (optional)</Label>
//                                 <Textarea
//                                     className="min-h-[80px] resize-none border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 rounded-lg"
//                                     placeholder="e.g., Professional development budget, gym membership..."
//                                     value={job.custom_benefits}
//                                     onChange={(e) => updateJob("custom_benefits", e.target.value)}
//                                 />
//                             </div>
//                         </div>

//                         <Footer
//                             next={handlePayContinue}
//                             back={back}

//                         />

//                     </div>

//                 )}


//                 {/* STEP 5 */}

//                 {step === 5 && (

//                     <div className="space-y-5">
//                         <h2 className="text-xl font-bold text-gray-900">Job Description</h2>

//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//                             <div className="bg-gray-50 border-b px-4 py-2 flex gap-2">
//                                 <button className="p-2 hover:bg-white rounded-lg text-gray-700 border border-transparent hover:border-gray-300">
//                                     <Bold size={16} />
//                                 </button>
//                                 <button className="p-2 hover:bg-white rounded-lg text-gray-700 border border-transparent hover:border-gray-300">
//                                     <Italic size={16} />
//                                 </button>
//                                 <div className="w-px bg-gray-300 mx-1" />
//                                 <button className="p-2 hover:bg-white rounded-lg text-gray-700 border border-transparent hover:border-gray-300">
//                                     <List size={16} />
//                                 </button>
//                             </div>

//                             <textarea
//                                 className="w-full p-6 min-h-[350px] text-gray-900 outline-none focus:bg-blue-50/30"
//                                 placeholder="Describe the role, responsibilities, and requirements..."
//                                 value={job.description}
//                                 onChange={(e) => updateJob("description", e.target.value)}
//                             />

//                             <div className="bg-gray-50 border-t px-6 py-3 flex justify-between">
//                                 <span className="text-sm text-gray-500">Make it compelling</span>
//                                 <span className="text-sm font-medium text-gray-600">{job.description.length} characters</span>
//                             </div>
//                         </div>

//                         <Footer
//                             back={back}
//                             next={() => {
//                                 const error = validateStep5();
//                                 if (error) {
//                                     alert(error);
//                                     return;
//                                 }
//                                 next();
//                             }}
//                         />

//                     </div>
//                 )}

//                 {/* STEP 6 */}
//                 {step === 6 && (
//                     <div className="space-y-5">
//                         <h2 className="text-xl font-bold text-gray-900">Applicant Qualifications</h2>

//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3">
//                             {QUALIFICATION_SECTIONS.map(section => {
//                                 const IconComponent = section.icon;
//                                 const isExpanded = expandedQuals[section.id];
//                                 let hasValue = false;

//                                 if (section.id === 'education') hasValue = job.education.length > 0;
//                                 else if (section.id === 'experience') hasValue = job.experience_years || job.experience_type;
//                                 else if (section.id === 'language') hasValue = job.language.length > 0;
//                                 else if (section.id === 'shift') hasValue = job.shift.length > 0;
//                                 else if (section.id === 'travel') hasValue = job.travel.length > 0;
//                                 else hasValue = job[section.id] && job[section.id].length > 0;

//                                 return (
//                                     <div key={section.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
//                                         <button
//                                             onClick={() => toggleQualSection(section.id)}
//                                             className="w-full flex items-center gap-3 p-4 hover:bg-gray-50"
//                                         >
//                                             <div className="w-8 h-8 rounded-lg bg-[#2557a7] flex items-center justify-center">
//                                                 <IconComponent size={16} className="text-white" />
//                                             </div>
//                                             <span className="flex-1 text-left font-semibold text-gray-800">{section.label}</span>
//                                             <div className="flex items-center gap-2">
//                                                 {!isExpanded && hasValue && <Check size={18} className="text-green-600" />}
//                                                 <Plus size={20} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
//                                             </div>
//                                         </button>

//                                         {isExpanded && (
//                                             <div className="p-4 pt-0 border-t border-gray-200">
//                                                 {/* Education - Select buttons */}
//                                                 {section.type === 'select' && section.id === 'education' && (
//                                                     <div className="space-y-3">
//                                                         <Label className="text-sm font-semibold text-gray-700">Select education level</Label>
//                                                         <div className="flex flex-wrap gap-2">
//                                                             {ED_LEVELS.map(level => {
//                                                                 const isSelected = job.education === level;
//                                                                 return (
//                                                                     <button
//                                                                         key={level}
//                                                                         onClick={() => updateJob('education', isSelected ? '' : level)}
//                                                                         className={`px-4 py-2 rounded-full border-2 text-sm font-medium ${isSelected
//                                                                             ? 'bg-[#2557a7] border-[#2557a7] text-white'
//                                                                             : 'bg-white border-gray-300 text-gray-700 hover:border-[#2557a7]'
//                                                                             }`}
//                                                                     >
//                                                                         {level}
//                                                                     </button>
//                                                                 );
//                                                             })}
//                                                         </div>
//                                                         <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
//                                                             <Button variant="outline" onClick={() => toggleQualSection(section.id)} className="h-9 border-2">Cancel</Button>
//                                                             <Button onClick={() => toggleQualSection(section.id)} className="h-9 bg-[#2557a7] hover:bg-[#164081] text-white">Update</Button>
//                                                         </div>
//                                                     </div>
//                                                 )}

//                                                 {/* Experience - Structured fields */}
//                                                 {section.type === 'structured' && section.id === 'experience' && (
//                                                     <div className="space-y-4">
//                                                         {section.fields.map(field => (
//                                                             <div key={field.name} className="space-y-2">
//                                                                 <Label className="text-sm font-semibold text-gray-700">{field.label}</Label>
//                                                                 <Input
//                                                                     placeholder={field.placeholder}
//                                                                     value={job[`experience_${field.name}`] || ''}
//                                                                     onChange={(e) => updateJob(`experience_${field.name}`, e.target.value)}
//                                                                     className="h-10 border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100"
//                                                                 />
//                                                             </div>
//                                                         ))}
//                                                         <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
//                                                             <Button variant="outline" onClick={() => toggleQualSection(section.id)} className="h-9 border-2">Cancel</Button>
//                                                             <Button onClick={() => toggleQualSection(section.id)} className="h-9 bg-[#2557a7] hover:bg-[#164081] text-white">Update</Button>
//                                                         </div>
//                                                     </div>
//                                                 )}

//                                                 {/* Language & Shift - Multi-select */}
//                                                 {section.type === 'multiselect' && (
//                                                     <div className="space-y-3">
//                                                         <Label className="text-sm font-semibold text-gray-700">Select all that apply</Label>
//                                                         <div className="flex flex-wrap gap-2">
//                                                             {section.options.map(option => {
//                                                                 const isSelected = job[section.id].includes(option);
//                                                                 return (
//                                                                     <button
//                                                                         key={option}
//                                                                         onClick={() => toggleArrayItem(section.id, option)}
//                                                                         className={`px-4 py-2 rounded-full border-2 text-sm font-medium ${isSelected
//                                                                             ? 'bg-[#2557a7] border-[#2557a7] text-white'
//                                                                             : 'bg-white border-gray-300 text-gray-700 hover:border-[#2557a7]'
//                                                                             }`}
//                                                                     >
//                                                                         {option}
//                                                                     </button>
//                                                                 );
//                                                             })}
//                                                         </div>
//                                                         <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
//                                                             <Button variant="outline" onClick={() => toggleQualSection(section.id)} className="h-9 border-2">Cancel</Button>
//                                                             <Button onClick={() => toggleQualSection(section.id)} className="h-9 bg-[#2557a7] hover:bg-[#164081] text-white">Update</Button>
//                                                         </div>
//                                                     </div>
//                                                 )}

//                                                 {/* Travel - Select percentage */}
//                                                 {section.type === 'select_percent' && (
//                                                     <div className="space-y-3">
//                                                         <Label className="text-sm font-semibold text-gray-700">Travel requirement</Label>
//                                                         <div className="flex flex-wrap gap-2">
//                                                             {section.options.map(option => {
//                                                                 const isSelected = job.travel === option;
//                                                                 return (
//                                                                     <button
//                                                                         key={option}
//                                                                         onClick={() => updateJob('travel', isSelected ? '' : option)}
//                                                                         className={`px-4 py-2 rounded-full border-2 text-sm font-medium ${isSelected
//                                                                             ? 'bg-[#2557a7] border-[#2557a7] text-white'
//                                                                             : 'bg-white border-gray-300 text-gray-700 hover:border-[#2557a7]'
//                                                                             }`}
//                                                                     >
//                                                                         {option}
//                                                                     </button>
//                                                                 );
//                                                             })}
//                                                         </div>
//                                                         <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
//                                                             <Button variant="outline" onClick={() => toggleQualSection(section.id)} className="h-9 border-2">Cancel</Button>
//                                                             <Button onClick={() => toggleQualSection(section.id)} className="h-9 bg-[#2557a7] hover:bg-[#164081] text-white">Update</Button>
//                                                         </div>
//                                                     </div>
//                                                 )}

//                                                 {/* Text input fields */}
//                                                 {section.type === 'text' && (
//                                                     <div className="space-y-3">
//                                                         <Input
//                                                             placeholder={section.placeholder}
//                                                             value={job[section.id] || ''}
//                                                             onChange={(e) => updateJob(section.id, e.target.value)}
//                                                             className="h-10 border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100"
//                                                         />
//                                                         <div className="flex justify-end gap-3 pt-2">
//                                                             <Button variant="outline" onClick={() => toggleQualSection(section.id)} className="h-9 border-2">Cancel</Button>
//                                                             <Button onClick={() => toggleQualSection(section.id)} className="h-9 bg-[#2557a7] hover:bg-[#164081] text-white">Update</Button>
//                                                         </div>
//                                                     </div>
//                                                 )}

//                                                 {/* Custom questions */}
//                                                 {section.type === 'custom' && (
//                                                     <div className="space-y-3">
//                                                         {job.custom_questions.map((q, idx) => (
//                                                             <div key={q.id} className="p-3 border-2 border-gray-200 rounded-lg space-y-2 bg-gray-50">
//                                                                 <div className="flex items-start gap-2">
//                                                                     <Input
//                                                                         placeholder={`Question ${idx + 1}`}
//                                                                         value={q.text}
//                                                                         onChange={(e) => updateCustomQuestion(q.id, 'text', e.target.value)}
//                                                                         className="flex-1 h-9"
//                                                                     />
//                                                                     <button onClick={() => removeCustomQuestion(q.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
//                                                                         <X size={16} />
//                                                                     </button>
//                                                                 </div>
//                                                                 <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         checked={q.required}
//                                                                         onChange={(e) => updateCustomQuestion(q.id, 'required', e.target.checked)}
//                                                                         className="w-3.5 h-3.5 accent-[#2557a7]"
//                                                                     />
//                                                                     Required question
//                                                                 </label>
//                                                             </div>
//                                                         ))}
//                                                         <Button variant="outline" onClick={addCustomQuestion} className="w-full h-9 border-2 border-dashed">
//                                                             <Plus size={16} className="mr-1" />
//                                                             Add another question
//                                                         </Button>
//                                                         <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 mt-3">
//                                                             <Button variant="outline" onClick={() => toggleQualSection(section.id)} className="h-9 border-2">Cancel</Button>
//                                                             <Button onClick={() => toggleQualSection(section.id)} className="h-9 bg-[#2557a7] hover:bg-[#164081] text-white">Update</Button>
//                                                         </div>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         )}
//                                     </div>
//                                 );
//                             })}
//                         </div>

//                         <Footer
//                             label="Preview"
//                             next={() => {
//                                 const err = validateQualifications();
//                                 if (err) return alert(err);
//                                 next();
//                             }}
//                             back={back}
//                         />


//                     </div>
//                 )}

//                 {step === 7 && (
//                     <div className="space-y-5">
//                         <h2 className="text-xl font-bold text-gray-900">Preview & Publish</h2>

//                         <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
//                             <div className="bg-[#2557a7] p-6 text-white">
//                                 <h3 className="text-2xl font-bold mb-3">{job.title || "Job Title"}</h3>
//                                 <div className="flex flex-wrap gap-2 text-sm">
//                                     {job.location_type && (
//                                         <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
//                                             <MapPin size={14} /> {job.location_type}
//                                         </span>
//                                     )}
//                                     {job.job_types.length > 0 && (
//                                         <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
//                                             <Briefcase size={14} /> {job.job_types.join(", ")}
//                                         </span>
//                                     )}
//                                     {job.pay_min && (
//                                         <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
//                                             <DollarSign size={14} /> ₹{job.pay_min}{job.pay_show_by === 'range' && job.pay_max ? ` - ₹${job.pay_max}` : '+'} {job.pay_rate}
//                                         </span>
//                                     )}
//                                 </div>
//                             </div>

//                             <div className="p-6 space-y-5">
//                                 {job.description && (
//                                     <div>
//                                         <h4 className="text-base font-bold mb-2 text-gray-900">Job Description</h4>
//                                         <div className="text-sm text-gray-700 whitespace-pre-wrap">{job.description}</div>
//                                     </div>
//                                 )}

//                                 {(job.selected_benefits.length > 0 || job.custom_benefits) && (
//                                     <div className="border-t border-gray-200 pt-5">
//                                         <h4 className="text-base font-bold mb-2 text-gray-900">Benefits</h4>
//                                         <div className="space-y-2">
//                                             {job.selected_benefits.map(id => {
//                                                 const benefit = BENEFIT_OPTIONS.find(b => b.id === id);
//                                                 return benefit ? (
//                                                     <div key={id} className="flex items-center gap-2 text-sm text-gray-700">
//                                                         <Check size={14} className="text-green-600" />
//                                                         <span>{benefit.label}</span>
//                                                     </div>
//                                                 ) : null;
//                                             })}
//                                             {job.custom_benefits && <p className="text-sm text-gray-700">{job.custom_benefits}</p>}
//                                         </div>
//                                     </div>
//                                 )}

//                                 {job.timeline && (
//                                     <div className="border-t border-gray-200 pt-4 bg-gray-50 -mx-6 px-6 py-3 -mb-6 text-sm text-gray-600">
//                                         <Clock size={16} className="inline text-[#2557a7] mr-2" />
//                                         Hiring <strong>{job.hiring_count}</strong> candidate(s) • Timeline: <strong>{job.timeline}</strong>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         <div className="flex gap-3">
//                             <Button onClick={back} variant="outline" className="flex-1 h-10 border-2">
//                                 <ChevronLeft size={18} className="mr-2" />
//                                 Back
//                             </Button>
//                             <Button
//                                 className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white"
//                                 onClick={async () => {
//                                     const err = validateBeforePublish();
//                                     if (err) return alert(err);

//                                     try {
//                                         await apiRequest("/api/company/publish", "POST", {
//                                             ...job,
//                                             status: "published",
//                                         });

//                                         localStorage.removeItem("job_draft");

//                                         // ✅ Show success message briefly
//                                         alert("🎉 Job created successfully!");

//                                         const userType = Number(localStorage.getItem("user_type"));

//                                         if (userType === 7) {
//                                             navigate("/dashboard"); // ✅ Company Dashboard
//                                         } else if (userType === 3) {
//                                             navigate("/dashboard"); // Student Dashboard
//                                         } else if (userType === 6) {
//                                             navigate("/dashboard"); // School Dashboard
//                                         } else if (userType === 4) {
//                                             navigate("/dashboard"); // College Dashboard
//                                         } else if (userType === 5) {
//                                             navigate("/dashboard"); // University Dashboard
//                                         }


//                                     } catch (err) {
//                                         alert(err.message);
//                                     }
//                                 }}


//                             >
//                                 <Check size={18} className="mr-2" />
//                                 Publish Job
//                             </Button>
//                         </div>
//                     </div>
//                 )}

//             </div>
//         </div>
//     );
// }
// function Footer({ next, back, label = "Continue", disabled = false }) {
//     return (
//         <div className="flex justify-between items-center pt-6">
//             {back ? (
//                 <button onClick={back} className="text-gray-600 font-semibold flex items-center gap-2 hover:text-gray-900 px-4 py-2 hover:bg-gray-100 rounded-lg">
//                     <ChevronLeft size={18} /> Back
//                 </button>
//             ) : <div />}
//             {next && (
//                 <Button
//                     onClick={next}
//                     disabled={disabled}
//                     className={`h-10 px-6 font-semibold rounded-lg ml-auto
//     ${disabled
//                             ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                             : "bg-[#2557a7] hover:bg-[#164081] text-white"
//                         }`}
//                 >
//                     {label}
//                 </Button>

//             )}
//         </div>
//     );
// }

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Progress } from "../ui/progress";
import {
    Pencil, Bold, Italic, List, ChevronLeft, Plus,
    Check, X, MapPin, Briefcase, DollarSign,
    Clock, Users, BookOpen, Languages, Award, Calendar,
    MessageSquare, Mail, Phone, Building, Home, Heart, Shield
} from "lucide-react";

// const API_BASE = "http://localhost:5000";
const API_URL = import.meta.env.VITE_API_URL;

const apiRequest = async (url, method = "GET", body) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}${url}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Something went wrong");
    return data;
};

const LOCATION_TYPES = [
    { value: "", label: "Select an option" },
    { value: "In person", label: "In person" },
    { value: "Fully remote", label: "Fully remote" },
    { value: "Hybrid", label: "Hybrid" },
    { value: "On the road", label: "On the road" },
];
const JOB_TYPES = [
    "Full-time", "Permanent", "Fresher", "Part-time",
    "Internship", "Contractual / Temporary", "Freelance", "Volunteer"
];

const TIMELINES = [
    { value: "", label: "Select an option" },
    { value: "1 to 3 days", label: "1 to 3 days" },
    { value: "3 to 7 days", label: "3 to 7 days" },
    { value: "1 to 2 weeks", label: "1 to 2 weeks" },
    { value: "2 to 4 weeks", label: "2 to 4 weeks" },
    { value: "More than 4 weeks", label: "More than 4 weeks" }
];

const ED_LEVELS = [
    "Secondary (10th Pass)",
    "Higher Secondary (12th Pass)",
    "Diploma",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate"
];

const PAY_RATES = ["per hour", "per day", "per month", "per year"];

const BENEFIT_OPTIONS = [
    { id: "health", label: "Health insurance", icon: Heart },
    { id: "wfh", label: "Work from home", icon: Home },
    { id: "flexible", label: "Flexible schedule", icon: Clock },
    { id: "life", label: "Life insurance", icon: Shield },
];

const QUALIFICATION_SECTIONS = [
    { id: "education", label: "Education", icon: BookOpen, type: "select" },
    {
        id: "experience",
        label: "Experience",
        icon: Briefcase,
        type: "structured",
        fields: [
            { name: "years", label: "How many years of experience are required?" },
            { name: "type", label: "What type of experience?" }
        ]
    },
    {
        id: "language",
        label: "Language",
        icon: Languages,
        type: "multiselect",
        options: ["English", "Hindi", "Tamil", "Telugu", "Marathi", "Bengali", "Gujarati", "Kannada", "Malayalam", "Punjabi"]
    },
    {
        id: "certifications",
        label: "Licence / Certification",
        icon: Award,
        type: "text"
    },
    {
        id: "location_qual",
        label: "Location",
        icon: MapPin,
        type: "text"
    },
    {
        id: "shift",
        label: "Shift availability",
        icon: Clock,
        type: "multiselect",
        options: ["Day shift", "Night shift", "Evening shift", "Weekend availability", "Flexible hours"]
    },
    {
        id: "travel",
        label: "Willingness to travel",
        icon: Building,
        type: "select_percent",
        options: ["Not required", "Up to 25%", "Up to 50%", "Up to 75%", "Up to 100%"]
    },
    { id: "custom", label: "Create custom question", icon: MessageSquare, type: "custom" },
];

export default function IndeedClonePost() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [expandedQuals, setExpandedQuals] = useState({});
    const totalSteps = 7;
    const [job, setJob] = useState(
        {

            title: "",
            location_type: "",
            location: "",
            must_reside: "",
            timeline: "",
            hiring_count: 1,
            job_types: [],
            pay_show_by: "",
            pay_min: "",
            pay_max: "",
            pay_rate: "",
            selected_benefits: [],
            custom_benefits: "",
            description: "",
            education: "",
            experience_years: "",
            experience_type: "",
            language: [],
            certifications: "",
            location_qual: "",
            shift: [],
            travel: "",
            custom_questions: [],
        });

    useEffect(() => {
        if (job.location_type === "Fully remote" && !job.location) {
            setJob(prev => ({
                ...prev,
                location: "Remote"
            }));
        }
    }, [job.location_type]);

    const PAY_VALIDATION_RULES = {
        "per hour": { min: 50, max: 5000 },
        "per day": { min: 400, max: 50000 },
        "per month": { min: 5000, max: 500000 },
        "per year": { min: 60000, max: 50000000 }
    };



    const updateJob = (field, value) => {
        setJob((prev) => ({ ...prev, [field]: value }));
    };


    const toggleJobType = (t) => {
        setJob(prev => ({
            ...prev,
            job_types: prev.job_types.includes(t)
                ? prev.job_types.filter(i => i !== t)
                : [...prev.job_types, t]
        }));
    };

    const toggleBenefit = (id) => {
        setJob(prev => ({
            ...prev,
            selected_benefits: prev.selected_benefits.includes(id)
                ? prev.selected_benefits.filter(i => i !== id)
                : [...prev.selected_benefits, id]
        }));
    };
    const handlePayContinue = () => {
        const error = validatePay();
        if (error) {
            alert(error);
            return;
        }
        next();
    };

    const validatePay = () => {
        if (!job.pay_show_by) {
            return "Please select how you want to show pay";
        }

        if (!job.pay_rate) {
            return "Please select pay rate";
        }

        const min = Number(job.pay_min);
        const max = Number(job.pay_max);
        const rules = PAY_VALIDATION_RULES[job.pay_rate];

        if (job.pay_show_by !== "maximum" && (!min || min <= 0)) {
            return "Please enter a valid minimum pay";
        }

        if (job.pay_show_by === "maximum" && (!min || min <= 0)) {
            return "Please enter a valid maximum pay";
        }

        if (rules && min < rules.min) {
            return `Pay is too low for ${job.pay_rate}. Typical minimum is ₹${rules.min}`;
        }

        if (rules && min > rules.max) {
            return `Pay is too high for ${job.pay_rate}. Typical maximum is ₹${rules.max}`;
        }

        if (job.pay_show_by === "range") {
            if (!max || max <= min) {
                return "Maximum pay must be greater than minimum pay";
            }
            if (rules && max > rules.max) {
                return `Maximum pay exceeds typical limit of ₹${rules.max}`;
            }
        }

        return null;
    };

    const toggleArrayItem = (field, item) => {
        setJob(prev => ({
            ...prev,
            [field]: prev[field].includes(item)
                ? prev[field].filter(i => i !== item)
                : [...prev[field], item]
        }));
    };

    const toggleQualSection = (id) => {
        setExpandedQuals(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const addCustomQuestion = () => {
        setJob(prev => ({
            ...prev,
            custom_questions: [...prev.custom_questions, { id: Date.now(), text: "", required: false }]
        }));
    };

    const updateCustomQuestion = (id, field, value) => {
        setJob(prev => ({
            ...prev,
            custom_questions: prev.custom_questions.map(q =>
                q.id === id ? { ...q, [field]: value } : q
            )
        }));
    };

    const removeCustomQuestion = (id) => {
        setJob(prev => ({
            ...prev,
            custom_questions: prev.custom_questions.filter(q => q.id !== id)
        }));
    };

    const next = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep(s => Math.min(s + 1, totalSteps));
    };

    const back = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep(s => Math.max(s - 1, 1));
    };

    const validateStep1 = () => {
        if (job.title.trim().length < 3) return "Job title is too short";
        if (!job.location_type) return "Location type is required";
        if (!job.must_reside) return "Please specify residency requirement";
        if (!job.location || !job.location.trim()) {
            return "Location is required";
        }
        return null;
    };

    const validateStep2 = () => {
        if (!job.timeline) return "Select recruitment timeline";
        if (Number(job.hiring_count) <= 0) return "Hiring count must be greater than 0";
        if (job.hiring_count > 50) return "Hiring count cannot exceed 50";

        return null;
    };
    const validateStep3 = () => {
        if (job.job_types.length === 0)
            return "Select at least one job type";
        return null;
    };
    const validateStep5 = () => {
        if (!job.description || job.description.trim().length < 100)
            return "Job description must be at least 100 characters";
        return null;
    };
    const validateQualifications = () => {
        if (job.experience_years && isNaN(job.experience_years)) {
            return "Experience years must be a number";
        }
        return null;
    };
    const validateBeforePublish = () => {
        if (!job.title || !job.description || !job.pay_rate) {
            return "Job post is incomplete";
        }
        return null;
    };

    const goToStep = (targetStep) => {
        if (targetStep > step) return;
        setStep(targetStep);
    };

    return (

        <div className="min-h-screen bg-[#f8f9fa]">
            <div className="max-w-3xl mx-auto py-8 px-4">

                {/* Header */}
                <div className="mb-8">
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Post a Job</h1>
                        <p className="text-gray-600 text-sm">Find your next great team member</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-semibold text-gray-700">Step {step} of {totalSteps}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#2557a7] transition-all duration-500"
                                style={{ width: `${(step / totalSteps) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* STEP 1 */}
                {step === 1 && (
                    <div className="space-y-5">
                        <h2 className="text-xl font-bold text-gray-900">Job Basics</h2>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Job title *</Label>
                                <Input
                                    className="h-11 border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 rounded-lg"
                                    value={job.title}
                                    onChange={(e) => updateJob("title", e.target.value)}

                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Job location type *</Label>
                                <select
                                    className="w-full h-11 border-2 border-gray-200 rounded-lg px-4 bg-white focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer"
                                    value={job.location_type}
                                    onChange={(e) => updateJob("location_type", e.target.value)}
                                >
                                    {LOCATION_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* {job.location_type === "In person" && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">Location *</Label>
                                    <Input
                                        className="h-11 border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 rounded-lg"
                                        value={job.location}
                                        onChange={(e) => updateJob("location", e.target.value)}
                                        placeholder="e.g., Mumbai, Maharashtra"
                                    />
                                </div>
                            )} */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Job location *</Label>
                                <Input
                                    className="h-11 border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 rounded-lg"
                                    value={job.location}
                                    onChange={(e) => updateJob("location", e.target.value)}
                                    placeholder={
                                        job.location_type === "Fully remote"
                                            ? "e.g., India / Global / Remote"
                                            : "e.g., Mumbai, Maharashtra"
                                    }
                                />
                            </div>


                            <div className="space-y-3 pt-4 border-t border-gray-200">
                                <Label className="text-sm font-semibold text-gray-700">
                                    Are employees required to reside in a specific location?
                                </Label>
                                <div className="flex gap-3">
                                    {["yes", "no"].map(opt => (
                                        <label
                                            key={opt}
                                            className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-6 py-3 rounded-lg border-2 font-medium capitalize ${job.must_reside === opt
                                                ? "border-[#2557a7] bg-blue-50 text-[#2557a7]"
                                                : "border-gray-200 hover:border-gray-300 text-gray-700"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                checked={job.must_reside === opt}
                                                onChange={() => updateJob("must_reside", opt)}
                                                className="w-4 h-4 accent-[#2557a7]"
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Footer
                            next={() => {
                                const err = validateStep1();
                                if (err) return alert(err);
                                next();
                            }}

                        />



                    </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <div className="space-y-5">
                        <h2 className="text-xl font-bold text-gray-900">Hiring Goals</h2>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Recruitment timeline for this job *</Label>
                                <select
                                    className="w-full h-11 border-2 border-gray-200 rounded-lg px-4 bg-white focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer"
                                    value={job.timeline}
                                    onChange={(e) => updateJob("timeline", e.target.value)}
                                >
                                    {TIMELINES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Number of people to hire *</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    className="h-11 w-32 text-center font-semibold border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 rounded-lg"
                                    value={job.hiring_count}
                                    onChange={(e) => updateJob("hiring_count", Number(e.target.value))}

                                />
                            </div>
                        </div>

                        <Footer
                            back={back}
                            next={() => {
                                const error = validateStep2();
                                if (error) {
                                    alert(error);
                                    return;
                                }
                                next();
                            }}
                        />

                    </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <div className="space-y-5">
                        <h2 className="text-xl font-bold text-gray-900">Add Job Details</h2>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-gray-600">Select all that apply</p>
                                <span className="text-sm font-bold text-[#2557a7] bg-blue-50 px-3 py-1 rounded-full">
                                    {job.job_types.length} selected
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {JOB_TYPES.map(t => {
                                    const isActive = job.job_types.includes(t);
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => toggleJobType(t)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 font-semibold text-sm ${isActive
                                                ? "bg-[#2557a7] border-[#2557a7] text-white"
                                                : "bg-white border-gray-300 text-gray-700 hover:border-[#2557a7]"
                                                }`}
                                        >
                                            {isActive ? <Check size={16} strokeWidth={3} /> : <Plus size={16} />}
                                            {t}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <Footer
                            back={back}
                            next={() => {
                                const error = validateStep3();
                                if (error) {
                                    alert(error);
                                    return;
                                }
                                next();
                            }}
                        />

                    </div>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                    <div className="space-y-5">
                        <h2 className="text-xl font-bold text-gray-900">Add Pay and Benefits</h2>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">Show pay by</Label>
                                    <select
                                        className="w-full h-11 border-2 border-gray-200 rounded-lg px-4 bg-white focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer"
                                        value={job.pay_show_by}
                                        onChange={(e) => updateJob("pay_show_by", e.target.value)}
                                    >
                                        {/* Updated: Default select an option */}
                                        <option value="">Select an option</option>
                                        <option value="range">Range</option>
                                        <option value="minimum">Starting amount</option>
                                        <option value="maximum">Maximum amount</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">Rate</Label>
                                    <select
                                        className="w-full h-11 border-2 border-gray-200 rounded-lg px-4 bg-white focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer"
                                        value={job.pay_rate}
                                        onChange={(e) => {
                                            updateJob("pay_rate", e.target.value);
                                            updateJob("pay_min", "");
                                            updateJob("pay_max", "");
                                        }}

                                    >
                                        {/* Updated: Default select an option */}
                                        <option value="">Select an option</option>
                                        {PAY_RATES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">
                                        {job.pay_show_by === 'maximum' ? 'Maximum' : 'Minimum'}
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3 text-gray-500 font-bold">₹</span>
                                        <Input
                                            type="number"
                                            className="pl-9 h-11 border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 rounded-lg"
                                            value={job.pay_min}
                                            onChange={(e) => updateJob("pay_min", e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {job.pay_show_by === 'range' && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">Maximum</Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3 text-gray-500 font-bold">₹</span>
                                            <Input
                                                type="number"
                                                className="pl-9 h-11 border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 rounded-lg"
                                                value={job.pay_max}
                                                onChange={(e) => updateJob("pay_max", e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-200">
                                <Label className="text-sm font-semibold text-gray-700">Benefits</Label>
                                <div className="flex flex-wrap gap-2">
                                    {BENEFIT_OPTIONS.map(benefit => {
                                        const isActive = job.selected_benefits.includes(benefit.id);
                                        const IconComponent = benefit.icon;
                                        return (
                                            <button
                                                key={benefit.id}
                                                type="button"
                                                onClick={() => toggleBenefit(benefit.id)}

                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 font-semibold text-sm transition-all ${isActive
                                                    ? "bg-[#2557a7] border-[#2557a7] text-white"
                                                    : "bg-white border-gray-300 text-gray-700 hover:border-[#2557a7]"
                                                    }`}
                                            >
                                                <IconComponent size={16} />
                                                {benefit.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Additional benefits (optional)</Label>
                                <Textarea
                                    className="min-h-[80px] resize-none border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100 rounded-lg"
                                    placeholder="e.g., Professional development budget, gym membership..."
                                    value={job.custom_benefits}
                                    onChange={(e) => updateJob("custom_benefits", e.target.value)}
                                />
                            </div>
                        </div>

                        <Footer
                            next={handlePayContinue}
                            back={back}

                        />

                    </div>

                )}


                {/* STEP 5 */}

                {step === 5 && (

                    <div className="space-y-5">
                        <h2 className="text-xl font-bold text-gray-900">Job Description</h2>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 border-b px-4 py-2 flex gap-2">
                                <button className="p-2 hover:bg-white rounded-lg text-gray-700 border border-transparent hover:border-gray-300">
                                    <Bold size={16} />
                                </button>
                                <button className="p-2 hover:bg-white rounded-lg text-gray-700 border border-transparent hover:border-gray-300">
                                    <Italic size={16} />
                                </button>
                                <div className="w-px bg-gray-300 mx-1" />
                                <button className="p-2 hover:bg-white rounded-lg text-gray-700 border border-transparent hover:border-gray-300">
                                    <List size={16} />
                                </button>
                            </div>

                            <textarea
                                className="w-full p-6 min-h-[350px] text-gray-900 outline-none focus:bg-blue-50/30"
                                placeholder="Describe the role, responsibilities, and requirements..."
                                value={job.description}
                                onChange={(e) => updateJob("description", e.target.value)}
                            />

                            <div className="bg-gray-50 border-t px-6 py-3 flex justify-between">
                                <span className="text-sm text-gray-500">Make it compelling</span>
                                <span className="text-sm font-medium text-gray-600">{job.description.length} characters</span>
                            </div>
                        </div>

                        <Footer
                            back={back}
                            next={() => {
                                const error = validateStep5();
                                if (error) {
                                    alert(error);
                                    return;
                                }
                                next();
                            }}
                        />

                    </div>
                )}

                {/* STEP 6 */}
                {step === 6 && (
                    <div className="space-y-5">
                        <h2 className="text-xl font-bold text-gray-900">Applicant Qualifications</h2>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3">
                            {QUALIFICATION_SECTIONS.map(section => {
                                const IconComponent = section.icon;
                                const isExpanded = expandedQuals[section.id];
                                let hasValue = false;

                                if (section.id === 'education') hasValue = job.education.length > 0;
                                else if (section.id === 'experience') hasValue = job.experience_years || job.experience_type;
                                else if (section.id === 'language') hasValue = job.language.length > 0;
                                else if (section.id === 'shift') hasValue = job.shift.length > 0;
                                else if (section.id === 'travel') hasValue = job.travel.length > 0;
                                else hasValue = job[section.id] && job[section.id].length > 0;

                                return (
                                    <div key={section.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => toggleQualSection(section.id)}
                                            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-[#2557a7] flex items-center justify-center">
                                                <IconComponent size={16} className="text-white" />
                                            </div>
                                            <span className="flex-1 text-left font-semibold text-gray-800">{section.label}</span>
                                            <div className="flex items-center gap-2">
                                                {!isExpanded && hasValue && <Check size={18} className="text-green-600" />}
                                                <Plus size={20} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="p-4 pt-0 border-t border-gray-200">
                                                {/* Education - Select buttons */}
                                                {section.type === 'select' && section.id === 'education' && (
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-semibold text-gray-700">Select education level</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {ED_LEVELS.map(level => {
                                                                const isSelected = job.education === level;
                                                                return (
                                                                    <button
                                                                        key={level}
                                                                        onClick={() => updateJob('education', isSelected ? '' : level)}
                                                                        className={`px-4 py-2 rounded-full border-2 text-sm font-medium ${isSelected
                                                                            ? 'bg-[#2557a7] border-[#2557a7] text-white'
                                                                            : 'bg-white border-gray-300 text-gray-700 hover:border-[#2557a7]'
                                                                            }`}
                                                                    >
                                                                        {level}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
                                                            <Button variant="outline" onClick={() => toggleQualSection(section.id)} className="h-9 border-2">Cancel</Button>
                                                            <Button onClick={() => toggleQualSection(section.id)} className="h-9 bg-[#2557a7] hover:bg-[#164081] text-white">Update</Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Experience - Structured fields */}
                                                {section.type === 'structured' && section.id === 'experience' && (
                                                    <div className="space-y-4">
                                                        {section.fields.map(field => (
                                                            <div key={field.name} className="space-y-2">
                                                                <Label className="text-sm font-semibold text-gray-700">{field.label}</Label>
                                                                <Input
                                                                    placeholder={field.placeholder}
                                                                    value={job[`experience_${field.name}`] || ''}
                                                                    onChange={(e) => updateJob(`experience_${field.name}`, e.target.value)}
                                                                    className="h-10 border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100"
                                                                />
                                                            </div>
                                                        ))}
                                                        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
                                                            <Button variant="outline" onClick={() => toggleQualSection(section.id)} className="h-9 border-2">Cancel</Button>
                                                            <Button onClick={() => toggleQualSection(section.id)} className="h-9 bg-[#2557a7] hover:bg-[#164081] text-white">Update</Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Language & Shift - Multi-select */}
                                                {section.type === 'multiselect' && (
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-semibold text-gray-700">Select all that apply</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {section.options.map(option => {
                                                                const isSelected = job[section.id].includes(option);
                                                                return (
                                                                    <button
                                                                        key={option}
                                                                        onClick={() => toggleArrayItem(section.id, option)}
                                                                        className={`px-4 py-2 rounded-full border-2 text-sm font-medium ${isSelected
                                                                            ? 'bg-[#2557a7] border-[#2557a7] text-white'
                                                                            : 'bg-white border-gray-300 text-gray-700 hover:border-[#2557a7]'
                                                                            }`}
                                                                    >
                                                                        {option}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
                                                            <Button variant="outline" onClick={() => toggleQualSection(section.id)} className="h-9 border-2">Cancel</Button>
                                                            <Button onClick={() => toggleQualSection(section.id)} className="h-9 bg-[#2557a7] hover:bg-[#164081] text-white">Update</Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Travel - Select percentage */}
                                                {section.type === 'select_percent' && (
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-semibold text-gray-700">Travel requirement</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {section.options.map(option => {
                                                                const isSelected = job.travel === option;
                                                                return (
                                                                    <button
                                                                        key={option}
                                                                        onClick={() => updateJob('travel', isSelected ? '' : option)}
                                                                        className={`px-4 py-2 rounded-full border-2 text-sm font-medium ${isSelected
                                                                            ? 'bg-[#2557a7] border-[#2557a7] text-white'
                                                                            : 'bg-white border-gray-300 text-gray-700 hover:border-[#2557a7]'
                                                                            }`}
                                                                    >
                                                                        {option}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
                                                            <Button variant="outline" onClick={() => toggleQualSection(section.id)} className="h-9 border-2">Cancel</Button>
                                                            <Button onClick={() => toggleQualSection(section.id)} className="h-9 bg-[#2557a7] hover:bg-[#164081] text-white">Update</Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Text input fields */}
                                                {section.type === 'text' && (
                                                    <div className="space-y-3">
                                                        <Input
                                                            placeholder={section.placeholder}
                                                            value={job[section.id] || ''}
                                                            onChange={(e) => updateJob(section.id, e.target.value)}
                                                            className="h-10 border-2 border-gray-200 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100"
                                                        />
                                                        <div className="flex justify-end gap-3 pt-2">
                                                            <Button variant="outline" onClick={() => toggleQualSection(section.id)} className="h-9 border-2">Cancel</Button>
                                                            <Button onClick={() => toggleQualSection(section.id)} className="h-9 bg-[#2557a7] hover:bg-[#164081] text-white">Update</Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Custom questions */}
                                                {section.type === 'custom' && (
                                                    <div className="space-y-3">
                                                        {job.custom_questions.map((q, idx) => (
                                                            <div key={q.id} className="p-3 border-2 border-gray-200 rounded-lg space-y-2 bg-gray-50">
                                                                <div className="flex items-start gap-2">
                                                                    <Input
                                                                        placeholder={`Question ${idx + 1}`}
                                                                        value={q.text}
                                                                        onChange={(e) => updateCustomQuestion(q.id, 'text', e.target.value)}
                                                                        className="flex-1 h-9"
                                                                    />
                                                                    <button onClick={() => removeCustomQuestion(q.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={q.required}
                                                                        onChange={(e) => updateCustomQuestion(q.id, 'required', e.target.checked)}
                                                                        className="w-3.5 h-3.5 accent-[#2557a7]"
                                                                    />
                                                                    Required question
                                                                </label>
                                                            </div>
                                                        ))}
                                                        <Button variant="outline" onClick={addCustomQuestion} className="w-full h-9 border-2 border-dashed">
                                                            <Plus size={16} className="mr-1" />
                                                            Add another question
                                                        </Button>
                                                        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 mt-3">
                                                            <Button variant="outline" onClick={() => toggleQualSection(section.id)} className="h-9 border-2">Cancel</Button>
                                                            <Button onClick={() => toggleQualSection(section.id)} className="h-9 bg-[#2557a7] hover:bg-[#164081] text-white">Update</Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <Footer
                            label="Preview"
                            next={() => {
                                const err = validateQualifications();
                                if (err) return alert(err);
                                next();
                            }}
                            back={back}
                        />


                    </div>
                )}

                {step === 7 && (
                    <div className="space-y-5">
                        <h2 className="text-xl font-bold text-gray-900">Preview & Publish</h2>

                        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                            <div className="bg-[#2557a7] p-6 text-white">
                                <h3 className="text-2xl font-bold mb-3">{job.title || "Job Title"}</h3>
                                <div className="flex flex-wrap gap-2 text-sm">
                                    {job.location_type && (
                                        <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
                                            <MapPin size={14} /> {job.location_type}
                                        </span>
                                    )}
                                    {job.job_types.length > 0 && (
                                        <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
                                            <Briefcase size={14} /> {job.job_types.join(", ")}
                                        </span>
                                    )}
                                    {job.pay_min && (
                                        <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
                                            <DollarSign size={14} /> ₹{job.pay_min}{job.pay_show_by === 'range' && job.pay_max ? ` - ₹${job.pay_max}` : '+'} {job.pay_rate}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                {job.description && (
                                    <div>
                                        <h4 className="text-base font-bold mb-2 text-gray-900">Job Description</h4>
                                        <div className="text-sm text-gray-700 whitespace-pre-wrap">{job.description}</div>
                                    </div>
                                )}

                                {(job.selected_benefits.length > 0 || job.custom_benefits) && (
                                    <div className="border-t border-gray-200 pt-5">
                                        <h4 className="text-base font-bold mb-2 text-gray-900">Benefits</h4>
                                        <div className="space-y-2">
                                            {job.selected_benefits.map(id => {
                                                const benefit = BENEFIT_OPTIONS.find(b => b.id === id);
                                                return benefit ? (
                                                    <div key={id} className="flex items-center gap-2 text-sm text-gray-700">
                                                        <Check size={14} className="text-green-600" />
                                                        <span>{benefit.label}</span>
                                                    </div>
                                                ) : null;
                                            })}
                                            {job.custom_benefits && <p className="text-sm text-gray-700">{job.custom_benefits}</p>}
                                        </div>
                                    </div>
                                )}

                                {job.timeline && (
                                    <div className="border-t border-gray-200 pt-4 bg-gray-50 -mx-6 px-6 py-3 -mb-6 text-sm text-gray-600">
                                        <Clock size={16} className="inline text-[#2557a7] mr-2" />
                                        Hiring <strong>{job.hiring_count}</strong> candidate(s) • Timeline: <strong>{job.timeline}</strong>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={back} variant="outline" className="flex-1 h-10 border-2">
                                <ChevronLeft size={18} className="mr-2" />
                                Back
                            </Button>
                            <Button
                                className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white"
                                onClick={async () => {
                                    const err = validateBeforePublish();
                                    if (err) return alert(err);

                                    try {
                                        await apiRequest("/company/publish", "POST", {
                                            ...job,
                                            status: "published",
                                        });

                                        localStorage.removeItem("job_draft");

                                        // ✅ Show success message briefly
                                        alert("🎉 Job created successfully!");

                                        const userType = Number(localStorage.getItem("user_type"));

                                        if (userType === 7) {
                                            navigate("/dashboard"); // ✅ Company Dashboard
                                        } else if (userType === 3) {
                                            navigate("/dashboard"); // Student Dashboard
                                        } else if (userType === 6) {
                                            navigate("/dashboard"); // School Dashboard
                                        } else if (userType === 4) {
                                            navigate("/dashboard"); // College Dashboard
                                        } else if (userType === 5) {
                                            navigate("/dashboard"); // University Dashboard
                                        }


                                    } catch (err) {
                                        alert(err.message);
                                    }
                                }}


                            >
                                <Check size={18} className="mr-2" />
                                Publish Job
                            </Button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
function Footer({ next, back, label = "Continue", disabled = false }) {
    return (
        <div className="flex justify-between items-center pt-6">
            {back ? (
                <button onClick={back} className="text-gray-600 font-semibold flex items-center gap-2 hover:text-gray-900 px-4 py-2 hover:bg-gray-100 rounded-lg">
                    <ChevronLeft size={18} /> Back
                </button>
            ) : <div />}
            {next && (
                <Button
                    onClick={next}
                    disabled={disabled}
                    className={`h-10 px-6 font-semibold rounded-lg ml-auto
    ${disabled
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-[#2557a7] hover:bg-[#164081] text-white"
                        }`}
                >
                    {label}
                </Button>

            )}
        </div>
    );
}