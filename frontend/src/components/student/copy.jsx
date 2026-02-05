// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import { Input } from "../ui/input";
// import { Label } from "../ui/label";
// import { Button } from "../ui/button";
// import { toast } from "sonner";
// import { STATES_AND_CITIES, SKILL_OPTIONS, CERTIFICATIONS } from "../data/statesAndCities";

// import { 
//     ProfileHeader, 
//     SectionCard, 
//     FormContainer, 
//     ItemCard,
//     EmptyState, 
//     LoadingSpinner,
//     QuickInfoCard 
// } from "../customreuse";

// const API_URL = import.meta.env.VITE_API_URL;

// const DEGREE_OPTIONS = [
//     "B.Tech", "M.Tech", "B.E.", "M.E.", "BSc", "MSc", "BCA", "MCA",
//     "BA", "MA", "BBA", "MBA", "B.Com", "M.Com", "LLB", "LLM",
//     "MBBS", "MD", "BDS", "MDS", "B.Pharm", "M.Pharm", "PhD",
//     "Diploma", "High School", "Other"
// ];

// export default function StudentProfile() {
//     const navigate = useNavigate();
//     const [displayName, setDisplayName] = useState("Your profile");
//     const [profile, setProfile] = useState({ 
//         state: "", city: "", dob: "", bio: "", profile_image_url: "", banner_image_url: "", headline: ""
//     });
//     const [education, setEducation] = useState([]);
//     const [experience, setExperience] = useState([]);
//     const [skills, setSkills] = useState([]);
//     const [certifications, setCertifications] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showEducationForm, setShowEducationForm] = useState(false);
//     const [showExperienceForm, setShowExperienceForm] = useState(false);
//     const [showSkillForm, setShowSkillForm] = useState(false);
//     const [showCertificationForm, setShowCertificationForm] = useState(false);
//     const [customSkillMode, setCustomSkillMode] = useState(false);
//     const [selectedProfileImage, setSelectedProfileImage] = useState(null);
//     const [selectedBannerImage, setSelectedBannerImage] = useState(null);
//     const [mediaUploading, setMediaUploading] = useState(false);
//     const [showEditMenu, setShowEditMenu] = useState(false);
//     const [editingIntro, setEditingIntro] = useState(false);
//     const [editingAbout, setEditingAbout] = useState(false);

//     const [educationForm, setEducationForm] = useState({
//         degree: "", field_of_study: "", institution: "", start_year: "", end_year: "", is_current: false
//     });
//     const [experienceForm, setExperienceForm] = useState({
//         title: "", company: "", start_date: "", end_date: "", is_current: false, description: ""
//     });
//     const [skillForm, setSkillForm] = useState({ skill_name: "" });
//     const [certificationForm, setCertificationForm] = useState({
//         name: "", issuing_organization: "", issue_date: "", expiry_date: "", credential_id: "", credential_url: ""
//     });

//     const token = localStorage.getItem("token");

//     useEffect(() => {
//         fetchProfile();
//     }, []);

//     const fetchProfile = async () => {
//         try {
//             const res = await fetch(`${API_URL}/student`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             const data = await res.json();
//             if (res.ok) {
//                 const p = data.profile || {};
//                 setProfile({
//                     state: p.state || "", city: p.city || "", dob: p.dob ? p.dob.substring(0, 10) : "",
//                     bio: p.bio || "", profile_image_url: p.profile_image_url || "",
//                     banner_image_url: p.banner_image_url || "", headline: p.headline || ""
//                 });
//                 setDisplayName(data.full_name || "Your profile");
//                 setEducation(data.education || []);
//                 setExperience(data.experience || []);
//                 setSkills(data.skills || []);
//                 setCertifications(data.certifications || []);
//             }
//         } catch (err) {
//             toast.error("Failed to load profile");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const apiCall = async (url, method, body) => {
//         try {
//             const res = await fetch(url, {
//                 method,
//                 headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//                 body: body ? JSON.stringify(body) : undefined,
//             });
//             return { ok: res.ok, data: await res.json() };
//         } catch (err) {
//             return { ok: false };
//         }
//     };

//     const updateProfile = async () => {
//         const { ok } = await apiCall(`${API_URL}/student`, "PUT", profile);
//         if (ok) {
//             toast.success("Profile updated successfully!");
//             setEditingIntro(false);
//             setEditingAbout(false);
//             fetchProfile();
//         } else {
//             toast.error("Failed to update");
//         }
//     };

//     const addEducation = async (e) => {
//         e.preventDefault();
//         const { ok } = await apiCall(`${API_URL}/student/education`, "POST", educationForm);
//         if (ok) {
//             toast.success("Education added");
//             setShowEducationForm(false);
//             setEducationForm({ degree: "", field_of_study: "", institution: "", start_year: "", end_year: "", is_current: false });
//             fetchProfile();
//         } else toast.error("Failed to add education");
//     };

//     const deleteEducation = async (id) => {
//         const { ok } = await apiCall(`${API_URL}/student/education/${id}`, "DELETE");
//         if (ok) { toast.success("Deleted"); fetchProfile(); }
//     };

//     const addExperience = async (e) => {
//         e.preventDefault();
//         const { ok } = await apiCall(`${API_URL}/student/experience`, "POST", experienceForm);
//         if (ok) {
//             toast.success("Experience added");
//             setShowExperienceForm(false);
//             setExperienceForm({ title: "", company: "", start_date: "", end_date: "", is_current: false, description: "" });
//             fetchProfile();
//         } else toast.error("Failed to add experience");
//     };

//     const deleteExperience = async (id) => {
//         const { ok } = await apiCall(`${API_URL}/student/experience/${id}`, "DELETE");
//         if (ok) { toast.success("Deleted"); fetchProfile(); }
//     };

//     const handleSkillSelect = (value) => {
//         if (value === "Other") {
//             setCustomSkillMode(true);
//             setSkillForm({ skill_name: "" });
//         } else {
//             setCustomSkillMode(false);
//             setSkillForm({ skill_name: value });
//         }
//     };

//     const addSkill = async (e) => {
//         e.preventDefault();
//         const { ok } = await apiCall(`${API_URL}/student/skills`, "POST", skillForm);
//         if (ok) {
//             toast.success("Skill added");
//             setShowSkillForm(false);
//             setSkillForm({ skill_name: "" });
//             setCustomSkillMode(false);
//             fetchProfile();
//         } else toast.error("Failed to add skill");
//     };

//     const deleteSkill = async (skill_id) => {
//         const { ok } = await apiCall(`${API_URL}/student/skills/${skill_id}`, "DELETE");
//         if (ok) { toast.success("Deleted"); fetchProfile(); }
//     };

//     const addCertification = async (e) => {
//         e.preventDefault();
//         const { ok } = await apiCall(`${API_URL}/student/certifications`, "POST", certificationForm);
//         if (ok) {
//             toast.success("Certification added");
//             setShowCertificationForm(false);
//             setCertificationForm({ name: "", issuing_organization: "", issue_date: "", expiry_date: "", credential_id: "", credential_url: "" });
//             fetchProfile();
//         } else toast.error("Failed to add certification");
//     };

//     const deleteCertification = async (id) => {
//         const { ok } = await apiCall(`${API_URL}/student/certifications/${id}`, "DELETE");
//         if (ok) { toast.success("Deleted"); fetchProfile(); }
//     };

//     const handleImageUpload = async (file, type) => {
//         if (!file) return;
//         setMediaUploading(true);
//         try {
//             const formData = new FormData();
//             formData.append(type === 'profile' ? 'profileImage' : 'bannerImage', file);
//             const res = await fetch(`${API_URL}/student/media`, {
//                 method: "PATCH",
//                 headers: { Authorization: `Bearer ${token}` },
//                 body: formData,
//             });
//             const data = await res.json();
//             if (res.ok) {
//                 toast.success(`${type === 'profile' ? 'Profile picture' : 'Banner'} updated`);
//                 setProfile(prev => ({
//                     ...prev,
//                     [type === 'profile' ? 'profile_image_url' : 'banner_image_url']: 
//                         data[type === 'profile' ? 'profile_image_url' : 'banner_image_url'] + '?t=' + Date.now()
//                 }));
//                 setShowEditMenu(false);
//             } else {
//                 toast.error(data.message || "Failed to upload");
//             }
//         } catch (err) {
//             toast.error("Failed to upload");
//         } finally {
//             setMediaUploading(false);
//         }
//     };

//     const clearImages = async () => {
//         try {
//             const res = await fetch(`${API_URL}/student/media/clear`, {
//                 method: "DELETE",
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             if (res.ok) {
//                 setProfile(prev => ({ ...prev, profile_image_url: "", banner_image_url: "" }));
//                 toast.success("Images cleared");
//                 setShowEditMenu(false);
//             } else {
//                 toast.error("Failed to clear images");
//             }
//         } catch (err) {
//             toast.error("Failed to clear images");
//         }
//     };

//     if (loading) return (
//         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//             <div className="text-center">
//                 <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
//                 <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
//             </div>
//         </div>
//     );

//     const bannerStyle = profile.banner_image_url
//         ? { backgroundImage: `url(${API_URL}${profile.banner_image_url})`, backgroundSize: "contain",backgroundRepeat: "no-repeat", backgroundPosition: "center" }
//         : {};

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* Main Container */}
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                     {/* Left Column - Main Content */}
//                     <div className="lg:col-span-2 space-y-6">
//                         {/* Profile Header Card */}
//                         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                             {/* Banner Section */}
//                             <div className="relative bg-gray-900">
//                                 <div className="relative h-36 sm:h-48 bg-gray-900 overflow-hidden">
//                                 {profile.banner_image_url && (
//                                     <img
//                                     src={`${profile.banner_image_url}`}
//                                     alt="Banner"
//                                     className="w-full h-full"
//                                     />
//                                 )}
//                                 </div>
//                                 <button
//                                     onClick={() => setShowEditMenu(!showEditMenu)}
//                                     className="absolute top-4 right-4 bg-white hover:bg-gray-100 p-2.5 rounded-full shadow-lg transition-all duration-200"
//                                 >
//                                     <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
//                                     </svg>
//                                 </button>
                                
//                                 {showEditMenu && (
//                                     <div className="absolute top-16 right-4 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-10">
//                                         <label className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors">
//                                             <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                             </svg>
//                                             <span className="text-sm text-gray-700 font-medium">Change profile photo</span>
//                                             <input type="file" accept="image/*" className="hidden" 
//                                                 onChange={(e) => handleImageUpload(e.target.files?.[0], 'profile')} />
//                                         </label>
//                                         <label className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors">
//                                             <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                                             </svg>
//                                             <span className="text-sm text-gray-700 font-medium">Change banner</span>
//                                             <input type="file" accept="image/*" className="hidden"
//                                                 onChange={(e) => handleImageUpload(e.target.files?.[0], 'banner')} />
//                                         </label>
//                                         {(profile.profile_image_url || profile.banner_image_url) && (
//                                             <button onClick={clearImages} className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 w-full text-left transition-colors">
//                                                 <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                 </svg>
//                                                 <span className="text-sm text-red-600 font-medium">Remove images</span>
//                                             </button>
//                                         )}
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Profile Info Section */}
//                             <div className="px-4 sm:px-6 pb-6 relative">
//                                 {/* Profile Picture */}
//                                 <div className="absolute -top-20">
//                                     <div className="relative">
//                                         <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden">
//                                             {profile.profile_image_url ? (
//                                                 <img src={`${profile.profile_image_url}`} alt="Profile" className="w-full h-full object-cover" />
//                                             ) : (
//                                                 <div className="w-full h-full bg-gray-800 flex items-center justify-center">
//                                                     <span className="text-5xl font-bold text-white">{displayName.charAt(0).toUpperCase()}</span>
//                                                 </div>
//                                             )}
//                                         </div>
//                                         <label className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 p-2.5 rounded-full shadow-lg cursor-pointer transition-colors">
//                                             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
//                                             </svg>
//                                             <input type="file" accept="image/*" className="hidden" 
//                                                 onChange={(e) => handleImageUpload(e.target.files?.[0], 'profile')} />
//                                         </label>
//                                     </div>
//                                 </div>

//                                 {/* Edit Intro Button */}
//                                 <div className="flex justify-end pt-4 mb-12 sm:mb-20">
//                                     <button
//                                         onClick={() => setEditingIntro(true)}
//                                         className="flex item-center gap-2 p-3 text-sm font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-full transition-colors duration-200"
//                                     >
//                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
//                                         </svg>
//                                     </button>
//                                 </div>

//                                 {/* Name and Details */}
//                                 <div>
//                                     <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
//                                     <p className="text-base text-gray-600 mt-2">{profile.headline || "Add a headline to describe yourself"}</p>
//                                     <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
//                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                                         </svg>
//                                         <span>{profile.city && profile.state ? `${profile.city}, ${profile.state}` : "Add your location"}</span>
//                                     </div>
//                                 </div>

//                                 {/* Edit Intro Form */}
//                                 {editingIntro && (
//                                     <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
//                                         <h3 className="font-semibold text-lg mb-4 text-gray-900">Edit Intro</h3>
//                                         <div className="space-y-4">
//                                             <div>
//                                                 <Label className="text-sm font-medium text-gray-700">Headline</Label>
//                                                 <Input
//                                                     value={profile.headline}
//                                                     onChange={(e) => setProfile({...profile, headline: e.target.value})}
//                                                     placeholder="e.g., Student at University | Aspiring Developer"
//                                                     className="mt-1.5"
//                                                 />
//                                             </div>
//                                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                                 <div>
//                                                     <Label className="text-sm font-medium text-gray-700">State</Label>
//                                                     <select
//                                                         value={profile.state} 
//                                                         onChange={(e) => setProfile({...profile, state: e.target.value, city: ""})}
//                                                         className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                                     >
//                                                         <option value="">Select state</option>
//                                                         {Object.keys(STATES_AND_CITIES).map((state) => (
//                                                             <option key={state} value={state}>{state}</option>
//                                                         ))}
//                                                     </select>
//                                                 </div>
//                                                 <div>
//                                                     <Label className="text-sm font-medium text-gray-700">City</Label>
//                                                     <select
//                                                         value={profile.city} 
//                                                         onChange={(e) => setProfile({...profile, city: e.target.value})}
//                                                         disabled={!profile.state}
//                                                         className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5 disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                                     >
//                                                         <option value="">Select city</option>
//                                                         {profile.state && STATES_AND_CITIES[profile.state]?.map((city) => (
//                                                             <option key={city} value={city}>{city}</option>
//                                                         ))}
//                                                     </select>
//                                                 </div>
//                                             </div>
//                                             <div className="flex gap-3 justify-end pt-2">
//                                                 <button
//                                                     onClick={() => setEditingIntro(false)}
//                                                     className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
//                                                 >
//                                                     Cancel
//                                                 </button>
//                                                 <button
//                                                     onClick={updateProfile}
//                                                     className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
//                                                 >
//                                                     Save
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* About Section */}
//                         <SectionCard
//                             title="About"
//                             onAdd={() => setEditingAbout(!editingAbout)}
//                             addLabel="Edit"
//                         >
//                             {editingAbout ? (
//                                 <div className="space-y-4">
//                                     <textarea
//                                         className="w-full border border-gray-300 rounded-lg p-3 min-h-[150px] focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                                         value={profile.bio}
//                                         onChange={(e) => setProfile({...profile, bio: e.target.value})}
//                                         placeholder="Write about yourself, your interests, and your goals..."
//                                     />
//                                     <div className="flex gap-3 justify-end">
//                                         <button
//                                             onClick={() => setEditingAbout(false)}
//                                             className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
//                                         >
//                                             Cancel
//                                         </button>
//                                         <button
//                                             onClick={updateProfile}
//                                             className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
//                                         >
//                                             Save
//                                         </button>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
//                                     {profile.bio || "Add information about yourself to help others understand your background and interests."}
//                                 </p>
//                             )}
//                         </SectionCard>

//                         {/* Experience Section */}
//                         <SectionCard
//                             title="Experience"
//                             onAdd={() => setShowExperienceForm(!showExperienceForm)}
//                             addLabel="Add"
//                         >
//                             {showExperienceForm && (
//                                 <FormContainer onSubmit={addExperience}>
//                                     <div>
//                                         <Label className="text-sm font-medium text-gray-700">Title *</Label>
//                                         <Input
//                                             required
//                                             value={experienceForm.title}
//                                             onChange={(e) => setExperienceForm({...experienceForm, title: e.target.value})}
//                                             placeholder="Ex: Software Engineer Intern"
//                                             className="mt-1.5"
//                                         />
//                                     </div>
//                                     <div>
//                                         <Label className="text-sm font-medium text-gray-700">Company *</Label>
//                                         <Input
//                                             required
//                                             value={experienceForm.company}
//                                             onChange={(e) => setExperienceForm({...experienceForm, company: e.target.value})}
//                                             placeholder="Ex: Google"
//                                             className="mt-1.5"
//                                         />
//                                     </div>
//                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                         <div>
//                                             <Label className="text-sm font-medium text-gray-700">Start Date</Label>
//                                             <Input
//                                                 type="date"
//                                                 value={experienceForm.start_date}
//                                                 onChange={(e) => setExperienceForm({...experienceForm, start_date: e.target.value})}
//                                                 className="mt-1.5"
//                                             />
//                                         </div>
//                                         <div>
//                                             <Label className="text-sm font-medium text-gray-700">End Date</Label>
//                                             <Input
//                                                 type="date"
//                                                 value={experienceForm.end_date}
//                                                 onChange={(e) => setExperienceForm({...experienceForm, end_date: e.target.value})}
//                                                 disabled={experienceForm.is_current}
//                                                 className="mt-1.5"
//                                             />
//                                         </div>
//                                     </div>
//                                     <label className="flex items-center gap-2 text-sm text-gray-700">
//                                         <input
//                                             type="checkbox"
//                                             checked={experienceForm.is_current}
//                                             onChange={(e) => setExperienceForm({...experienceForm, is_current: e.target.checked})}
//                                             className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                         />
//                                         I currently work here
//                                     </label>
//                                     <div>
//                                         <Label className="text-sm font-medium text-gray-700">Description</Label>
//                                         <textarea
//                                             className="w-full border border-gray-300 rounded-lg p-3 mt-1.5 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                                             value={experienceForm.description}
//                                             onChange={(e) => setExperienceForm({...experienceForm, description: e.target.value})}
//                                             placeholder="Describe your responsibilities and achievements"
//                                         />
//                                     </div>
//                                     <div className="flex gap-3 justify-end pt-2">
//                                         <button
//                                             type="button"
//                                             onClick={() => setShowExperienceForm(false)}
//                                             className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
//                                         >
//                                             Cancel
//                                         </button>
//                                         <button
//                                             type="submit"
//                                             className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
//                                         >
//                                             Save
//                                         </button>
//                                     </div>
//                                 </FormContainer>
//                             )}

//                             {experience.length === 0 && !showExperienceForm ? (
//                                 <EmptyState message="No experience added yet" />
//                             ) : (
//                                 <div className="space-y-2">
//                                     {experience.map((exp) => (
//                                         <ItemCard
//                                             key={exp.id}
//                                             colorScheme="blue"
//                                             icon={
//                                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                                                 </svg>
//                                             }
//                                             title={exp.title}
//                                             subtitle={exp.company}
//                                             period={`${exp.start_date} - ${exp.is_current ? "Present" : exp.end_date}`}
//                                             description={exp.description}
//                                             onDelete={() => deleteExperience(exp.id)}
//                                         />
//                                     ))}
//                                 </div>
//                             )}
//                         </SectionCard>

//                         {/* Education Section */}
//                         <SectionCard
//                             title="Education"
//                             onAdd={() => setShowEducationForm(!showEducationForm)}
//                             addLabel="Add"
//                         >
//                             {showEducationForm && (
//                                 <FormContainer onSubmit={addEducation}>
//                                     <div>
//                                         <Label className="text-sm font-medium text-gray-700">Degree *</Label>
//                                         <select
//                                             required
//                                             value={educationForm.degree}
//                                             onChange={(e) => setEducationForm({...educationForm, degree: e.target.value})}
//                                             className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                         >
//                                             <option value="">Select degree</option>
//                                             {DEGREE_OPTIONS.map((degree) => (
//                                                 <option key={degree} value={degree}>{degree}</option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <Label className="text-sm font-medium text-gray-700">Field of Study</Label>
//                                         <Input
//                                             value={educationForm.field_of_study}
//                                             onChange={(e) => setEducationForm({...educationForm, field_of_study: e.target.value})}
//                                             placeholder="Ex: Computer Science"
//                                             className="mt-1.5"
//                                         />
//                                     </div>
//                                     <div>
//                                         <Label className="text-sm font-medium text-gray-700">School *</Label>
//                                         <Input
//                                             required
//                                             value={educationForm.institution}
//                                             onChange={(e) => setEducationForm({...educationForm, institution: e.target.value})}
//                                             placeholder="Ex: Harvard University"
//                                             className="mt-1.5"
//                                         />
//                                     </div>
//                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                         <div>
//                                             <Label className="text-sm font-medium text-gray-700">Start Year</Label>
//                                             <Input
//                                                 type="number"
//                                                 value={educationForm.start_year}
//                                                 onChange={(e) => setEducationForm({...educationForm, start_year: e.target.value})}
//                                                 placeholder="2020"
//                                                 className="mt-1.5"
//                                             />
//                                         </div>
//                                         <div>
//                                             <Label className="text-sm font-medium text-gray-700">End Year</Label>
//                                             <Input
//                                                 type="number"
//                                                 value={educationForm.end_year}
//                                                 onChange={(e) => setEducationForm({...educationForm, end_year: e.target.value})}
//                                                 placeholder="2024"
//                                                 disabled={educationForm.is_current}
//                                                 className="mt-1.5"
//                                             />
//                                         </div>
//                                     </div>
//                                     <label className="flex items-center gap-2 text-sm text-gray-700">
//                                         <input
//                                             type="checkbox"
//                                             checked={educationForm.is_current}
//                                             onChange={(e) => setEducationForm({...educationForm, is_current: e.target.checked})}
//                                             className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                         />
//                                         I currently study here
//                                     </label>
//                                     <div className="flex gap-3 justify-end pt-2">
//                                         <button
//                                             type="button"
//                                             onClick={() => setShowEducationForm(false)}
//                                             className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
//                                         >
//                                             Cancel
//                                         </button>
//                                         <button
//                                             type="submit"
//                                             className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
//                                         >
//                                             Save
//                                         </button>
//                                     </div>
//                                 </FormContainer>
//                             )}

//                             {education.length === 0 && !showEducationForm ? (
//                                 <EmptyState message="No education added yet" />
//                             ) : (
//                                 <div className="space-y-2">
//                                     {education.map((edu) => (
//                                         <ItemCard
//                                             key={edu.id}
//                                             colorScheme="purple"
//                                             icon={
//                                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
//                                                 </svg>
//                                             }
//                                             title={edu.institution}
//                                             subtitle={`${edu.degree}${edu.field_of_study ? `, ${edu.field_of_study}` : ''}`}
//                                             period={`${edu.start_year} - ${edu.is_current ? "Present" : edu.end_year}`}
//                                             onDelete={() => deleteEducation(edu.id)}
//                                         />
//                                     ))}
//                                 </div>
//                             )}
//                         </SectionCard>

//                         {/* Skills Section */}
//                         <SectionCard
//                             title="Skills"
//                             onAdd={() => setShowSkillForm(!showSkillForm)}
//                             addLabel="Add"
//                         >
//                             {showSkillForm && (
//                                 <FormContainer onSubmit={addSkill}>
//                                     <div className="flex flex-col sm:flex-row gap-3">
//                                         <select
//                                             value={customSkillMode ? "Other" : skillForm.skill_name}
//                                             onChange={(e) => handleSkillSelect(e.target.value)}
//                                             className="flex-1 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                             required={!customSkillMode}
//                                         >
//                                             <option value="">Select skill</option>
//                                             {SKILL_OPTIONS.map((skill) => (
//                                                 <option key={skill} value={skill}>{skill}</option>
//                                             ))}
//                                         </select>
//                                         {customSkillMode && (
//                                             <Input
//                                                 required
//                                                 value={skillForm.skill_name}
//                                                 onChange={(e) => setSkillForm({skill_name: e.target.value})}
//                                                 placeholder="Enter skill name"
//                                                 className="flex-1"
//                                             />
//                                         )}
//                                     </div>
//                                     <div className="flex gap-3 justify-end pt-2">
//                                         <button
//                                             type="button"
//                                             onClick={() => {
//                                                 setShowSkillForm(false);
//                                                 setCustomSkillMode(false);
//                                             }}
//                                             className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
//                                         >
//                                             Cancel
//                                         </button>
//                                         <button
//                                             type="submit"
//                                             className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
//                                         >
//                                             Add skill
//                                         </button>
//                                     </div>
//                                 </FormContainer>
//                             )}

//                             {skills.length === 0 && !showSkillForm ? (
//                                 <EmptyState message="No skills added yet" />
//                             ) : (
//                                 <div className="flex flex-wrap gap-2">
//                                     {skills.map((skill) => (
//                                         <div
//                                             key={skill.id}
//                                             className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-blue-100 transition-colors group"
//                                         >
//                                             <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
//                                             </svg>
//                                             <span className="text-sm font-medium text-blue-900">{skill.skill_name}</span>
//                                             <button
//                                                 onClick={() => deleteSkill(skill.id)}
//                                                 className="text-blue-700 hover:text-blue-900 opacity-70 group-hover:opacity-100 transition-opacity"
//                                             >
//                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                                 </svg>
//                                             </button>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </SectionCard>

//                         {/* Certifications Section */}
//                         <SectionCard
//                             title="Licenses & Certifications"
//                             onAdd={() => setShowCertificationForm(!showCertificationForm)}
//                             addLabel="Add"
//                         >
//                             {showCertificationForm && (
//                                 <FormContainer onSubmit={addCertification}>
//                                     <div>
//                                         <Label className="text-sm font-medium text-gray-700">Name *</Label>
//                                         <select
//                                             required
//                                             value={certificationForm.name}
//                                             onChange={(e) => setCertificationForm({...certificationForm, name: e.target.value})}
//                                             className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                         >
//                                             <option value="">Select certification</option>
//                                             {CERTIFICATIONS.map((cert) => (
//                                                 <option key={cert} value={cert}>{cert}</option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <Label className="text-sm font-medium text-gray-700">Issuing Organization</Label>
//                                         <Input
//                                             value={certificationForm.issuing_organization}
//                                             onChange={(e) => setCertificationForm({...certificationForm, issuing_organization: e.target.value})}
//                                             placeholder="Ex: Amazon Web Services"
//                                             className="mt-1.5"
//                                         />
//                                     </div>
//                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                         <div>
//                                             <Label className="text-sm font-medium text-gray-700">Issue Date</Label>
//                                             <Input
//                                                 type="date"
//                                                 value={certificationForm.issue_date}
//                                                 onChange={(e) => setCertificationForm({...certificationForm, issue_date: e.target.value})}
//                                                 className="mt-1.5"
//                                             />
//                                         </div>
//                                         <div>
//                                             <Label className="text-sm font-medium text-gray-700">Expiry Date</Label>
//                                             <Input
//                                                 type="date"
//                                                 value={certificationForm.expiry_date}
//                                                 onChange={(e) => setCertificationForm({...certificationForm, expiry_date: e.target.value})}
//                                                 className="mt-1.5"
//                                             />
//                                         </div>
//                                     </div>
//                                     <div>
//                                         <Label className="text-sm font-medium text-gray-700">Credential ID</Label>
//                                         <Input
//                                             value={certificationForm.credential_id}
//                                             onChange={(e) => setCertificationForm({...certificationForm, credential_id: e.target.value})}
//                                             placeholder="Optional"
//                                             className="mt-1.5"
//                                         />
//                                     </div>
//                                     <div>
//                                         <Label className="text-sm font-medium text-gray-700">Credential URL</Label>
//                                         <Input
//                                             value={certificationForm.credential_url}
//                                             onChange={(e) => setCertificationForm({...certificationForm, credential_url: e.target.value})}
//                                             placeholder="Optional"
//                                             className="mt-1.5"
//                                         />
//                                     </div>
//                                     <div className="flex gap-3 justify-end pt-2">
//                                         <button
//                                             type="button"
//                                             onClick={() => setShowCertificationForm(false)}
//                                             className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
//                                         >
//                                             Cancel
//                                         </button>
//                                         <button
//                                             type="submit"
//                                             className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
//                                         >
//                                             Save
//                                         </button>
//                                     </div>
//                                 </FormContainer>
//                             )}

//                             {certifications.length === 0 && !showCertificationForm ? (
//                                 <EmptyState message="No certifications added yet" />
//                             ) : (
//                                 <div className="space-y-2">
//                                     {certifications.map((cert) => (
//                                         <ItemCard
//                                             key={cert.id}
//                                             colorScheme="green"
//                                             icon={
//                                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
//                                                 </svg>
//                                             }
//                                             title={cert.name}
//                                             subtitle={cert.issuing_organization}
//                                             period={`Issued ${cert.issue_date}${cert.expiry_date ? ` · Expires ${cert.expiry_date}` : ''}`}
//                                             description={cert.credential_id ? `Credential ID: ${cert.credential_id}` : null}
//                                             link={cert.credential_url ? { url: cert.credential_url, text: "Show credential" } : null}
//                                             onDelete={() => deleteCertification(cert.id)}
//                                         />
//                                     ))}
//                                 </div>
//                             )}
//                         </SectionCard>
//                     </div>

//                     {/* Right Column - Sidebar */}
//                     <div className="space-y-6">
//                         {/* Profile Language Card */}
//                         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                             <div className="flex items-center justify-between mb-4">
//                                 <h3 className="font-semibold text-gray-900">Profile language</h3>
//                                 <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//                                     <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
//                                     </svg>
//                                 </button>
//                             </div>
//                             <p className="text-sm text-gray-700">English</p>
//                         </div>

//                         {/* Public Profile URL Card */}
//                         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                             <div className="flex items-center justify-between mb-4">
//                                 <h3 className="font-semibold text-gray-900">Public profile & URL</h3>
//                                 <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//                                     <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
//                                     </svg>
//                                 </button>
//                             </div>
//                             <p className="text-sm text-gray-600 break-all">
//                                 www.ccs.com/in/{displayName.toLowerCase().replace(/\s+/g, '-')}
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }