// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//     MapPin,
//     Briefcase,
//     Calendar,
//     Users,
//     Clock,
//     Trash2,
//     ArrowLeft,
//     Building2,
//     GraduationCap,
// } from "lucide-react";

// const BACKEND_URL = "http://localhost:5000";

// export default function CompanyJobDetail() {
//     const { postId } = useParams();
//     const navigate = useNavigate();
//     const [job, setJob] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [deleting, setDeleting] = useState(false);
//     const token = localStorage.getItem("token");

//     useEffect(() => {
//         const fetchJob = async () => {
//             try {
//                 const res = await fetch(`${BACKEND_URL}/api/company/publish/${postId}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 const data = await res.json();

//                 if (res.ok) {
//                     setJob(data.job);
//                 } else {
//                     console.error(data.message || "Job not found");
//                 }
//             } catch (err) {
//                 console.error("Error fetching job:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchJob();
//     }, [postId, token]);

//     const handleDelete = async () => {
//         setDeleting(true);
//         try {
//             const res = await fetch(`${BACKEND_URL}/api/company/publish/${postId}`, {
//                 method: "DELETE",
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             if (res.ok) {
//                 navigate("/company/jobs");
//             } else {
//                 const data = await res.json();
//                 alert(data.message || "Failed to delete job");
//             }
//         } catch (err) {
//             console.error("Error deleting job:", err);
//             alert("An error occurred while deleting the job");
//         } finally {
//             setDeleting(false);
//             setShowDeleteModal(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50">
//                 <div className="text-center">
//                     <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-3"></div>
//                     <p className="text-gray-600">Loading...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (!job) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50">
//                 <div className="text-center">
//                     <h2 className="text-xl font-semibold text-gray-900 mb-2">Job not found</h2>
//                     <button
//                         onClick={() => navigate("/company/jobs")}
//                         className="text-blue-600 hover:underline"
//                     >
//                         Back to jobs
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* Header */}
//             <div className="bg-white border-b border-gray-200">
//                 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//                     <button
//                         onClick={() => navigate("/company/jobs")}
//                         className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
//                     >
//                         <ArrowLeft className="w-4 h-4" />
//                         Back to jobs
//                     </button>

//                     <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
//                         <div className="flex-1">
//                             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
//                                 {job.title}
//                             </h1>
//                             <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
//                                 <span className="flex items-center gap-1">
//                                     <MapPin className="w-4 h-4" />
//                                     {job.location}
//                                 </span>
//                                 <span>•</span>
//                                 <span>{job.location_type}</span>
//                                 <span>•</span>
//                                 <span className="flex items-center gap-1">
//                                     <Calendar className="w-4 h-4" />
//                                     Posted {new Date(job.created_at).toLocaleDateString()}
//                                 </span>
//                             </div>
//                         </div>

//                         <div className="flex gap-2">
//                             <button
//                                 onClick={() => setShowDeleteModal(true)}
//                                 className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 font-medium text-sm transition-colors flex items-center gap-2"
//                             >
//                                 <Trash2 className="w-4 h-4" />
//                                 Delete
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Content */}
//             <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                     {/* Main Content */}
//                     <div className="lg:col-span-2 space-y-6">
//                         {/* Job Details Card */}
//                         <div className="bg-white rounded-lg border border-gray-200 p-6">
//                             <h2 className="text-lg font-semibold text-gray-900 mb-4">Job details</h2>

//                             <div className="space-y-4">
//                                 <div className="flex items-start gap-3">
//                                     <div className="w-5 h-5 flex items-center justify-center text-gray-400 mt-0.5 font-bold">
//                                         ₹
//                                     </div>
//                                     <div>
//                                         <p className="font-medium text-gray-900">Salary</p>
//                                         <p className="text-gray-600">
//                                             {job.pay_show_by === "Range" && job.pay_min && job.pay_max
//                                                 ? `₹${job.pay_min} - ₹${job.pay_max}`
//                                                 : job.pay_show_by === "Starting Amount" && job.pay_min
//                                                     ? `Starting at ₹${job.pay_min}`
//                                                     : job.pay_show_by === "Maximum Amount" && job.pay_max
//                                                         ? `Up to ₹${job.pay_max}`
//                                                         : job.pay_show_by === "Exact Amount" && job.pay_min
//                                                             ? `₹${job.pay_min}`
//                                                             : "Competitive"}
//                                             {job.pay_rate && ` ${job.pay_rate}`}
//                                         </p>
//                                     </div>
//                                 </div>

//                                 {job.job_types?.length > 0 && (
//                                     <div className="flex items-start gap-3">
//                                         <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
//                                         <div>
//                                             <p className="font-medium text-gray-900">Job type</p>
//                                             <p className="text-gray-600">{job.job_types.join(", ")}</p>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {job.shift?.length > 0 && (
//                                     <div className="flex items-start gap-3">
//                                         <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
//                                         <div>
//                                             <p className="font-medium text-gray-900">Shift</p>
//                                             <p className="text-gray-600">{job.shift.join(", ")}</p>
//                                         </div>
//                                     </div>
//                                 )}

//                                 <div className="flex items-start gap-3">
//                                     <Users className="w-5 h-5 text-gray-400 mt-0.5" />
//                                     <div>
//                                         <p className="font-medium text-gray-900">Number of openings</p>
//                                         <p className="text-gray-600">{job.hiring_count} positions</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Full Description */}
//                         <div className="bg-white rounded-lg border border-gray-200 p-6">
//                             <h2 className="text-lg font-semibold text-gray-900 mb-4">Full job description</h2>
//                             <div className="text-gray-700 leading-relaxed break-words whitespace-pre-line overflow-wrap-anywhere">
//                                 {job.description || "No description provided."}
//                             </div>
//                         </div>

//                         {/* Benefits */}
//                         {job.selected_benefits?.length > 0 && (
//                             <div className="bg-white rounded-lg border border-gray-200 p-6">
//                                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h2>
//                                 <ul className="space-y-2">
//                                     {job.selected_benefits.map((benefit, i) => (
//                                         <li key={i} className="flex items-start gap-2 text-gray-700">
//                                             <span className="text-blue-600 mt-1">•</span>
//                                             {benefit}
//                                         </li>
//                                     ))}
//                                 </ul>
//                                 {job.custom_benefits && (
//                                     <p className="mt-4 text-sm text-gray-600 border-t pt-4">
//                                         Additional: {job.custom_benefits}
//                                     </p>
//                                 )}
//                             </div>
//                         )}

//                         {/* Screening Questions */}
//                         {job.custom_questions?.length > 0 && (
//                             <div className="bg-white rounded-lg border border-gray-200 p-6">
//                                 <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                                     Screening questions
//                                 </h2>
//                                 <div className="space-y-4">
//                                     {job.custom_questions.map((q, i) => (
//                                         <div key={i} className="border-l-2 border-gray-200 pl-4">
//                                             <p className="text-gray-900 font-medium">{q.question}</p>
//                                             <p className="text-xs text-gray-500 mt-1">
//                                                 {q.is_required ? "Required" : "Optional"}
//                                             </p>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* Sidebar */}
//                     <div className="space-y-6">
//                         {/* Qualifications */}
//                         <div className="bg-white rounded-lg border border-gray-200 p-6">
//                             <h2 className="text-lg font-semibold text-gray-900 mb-4">Qualifications</h2>

//                             <div className="space-y-4 text-sm">
//                                 <div>
//                                     <p className="font-medium text-gray-900 mb-1">Education</p>
//                                     <p className="text-gray-600">{job.education || "Not specified"}</p>
//                                 </div>

//                                 <div>
//                                     <p className="font-medium text-gray-900 mb-1">Experience</p>
//                                     <p className="text-gray-600">
//                                         {job.experience_years ? `${job.experience_years} years` : "Any"}
//                                         {job.experience_type && ` - ${job.experience_type}`}
//                                     </p>
//                                 </div>

//                                 {job.certifications && (
//                                     <div>
//                                         <p className="font-medium text-gray-900 mb-1">Certifications</p>
//                                         <p className="text-gray-600">{job.certifications}</p>
//                                     </div>
//                                 )}

//                                 {job.language?.length > 0 && (
//                                     <div>
//                                         <p className="font-medium text-gray-900 mb-1">Languages</p>
//                                         <p className="text-gray-600">{job.language.join(", ")}</p>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Additional Info */}
//                         {(job.travel || job.location_qual || job.must_reside !== null) && (
//                             <div className="bg-white rounded-lg border border-gray-200 p-6">
//                                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional information</h2>

//                                 <div className="space-y-3 text-sm">
//                                     {job.travel && (
//                                         <div>
//                                             <p className="font-medium text-gray-900 mb-1">Travel</p>
//                                             <p className="text-gray-600">{job.travel}</p>
//                                         </div>
//                                     )}

//                                     {job.location_qual && (
//                                         <div>
//                                             <p className="font-medium text-gray-900 mb-1">Location requirements</p>
//                                             <p className="text-gray-600">{job.location_qual}</p>
//                                         </div>
//                                     )}

//                                     {job.must_reside !== null && (
//                                         <div>
//                                             <p className="font-medium text-gray-900 mb-1">Must reside in location</p>
//                                             <p className="text-gray-600">{job.must_reside ? "Yes" : "No"}</p>
//                                         </div>
//                                     )}

//                                     {job.timeline && (
//                                         <div>
//                                             <p className="font-medium text-gray-900 mb-1">Hiring timeline</p>
//                                             <p className="text-gray-600">{job.timeline}</p>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Job Status */}
//                         <div className="bg-white rounded-lg border border-gray-200 p-6">
//                             <h2 className="text-lg font-semibold text-gray-900 mb-4">Job status</h2>
//                             <div className="flex items-center gap-2">
//                                 <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${job.status?.toLowerCase() === "active" || job.status?.toLowerCase() === "published"
//                                     ? "bg-green-100 text-green-800"
//                                     : job.status?.toLowerCase() === "draft"
//                                         ? "bg-yellow-100 text-yellow-800"
//                                         : "bg-gray-100 text-gray-800"
//                                     }`}>
//                                     {job.status || "Unknown"}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Delete Modal */}
//             {showDeleteModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-lg max-w-md w-full p-6">
//                         <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                             Delete this job?
//                         </h3>
//                         <p className="text-gray-600 mb-6">
//                             Are you sure you want to delete "{job.title}"? This action cannot be undone.
//                         </p>
//                         <div className="flex gap-3 justify-end">
//                             <button
//                                 onClick={() => setShowDeleteModal(false)}
//                                 disabled={deleting}
//                                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium disabled:opacity-50"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleDelete}
//                                 disabled={deleting}
//                                 className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium disabled:opacity-50"
//                             >
//                                 {deleting ? "Deleting..." : "Delete"}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }



import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    MapPin,
    Briefcase,
    Calendar,
    Users,
    Clock,
    ArrowLeft,
    GraduationCap,
    Mail,
    CheckCircle,
    XCircle,
    X,
    Award,
    Code,
    User,
} from "lucide-react";

// const BACKEND_URL = "http://localhost:5000";
const API_URL = import.meta.env.VITE_API_URL;

const statusConfig = {
    pending: {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Under Review",
    },
    accepted: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Accepted",
    },
    rejected: {
        color: "bg-red-50 text-red-700 border-red-200",
        label: "Rejected",
    },
};

// Toast Component
const Toast = ({ message, type = "success", onClose }) => {
    const bgColor = type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-blue-600";

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in`}>
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded p-1">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// Applicant Profile Modal
const ApplicantProfileModal = ({ applicant, onClose, onStatusChange }) => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");


    useEffect(() => {
        const fetchApplicantProfile = async () => {
            try {
                // Fetch student profile using the student_id
                const res = await fetch(`${API_URL}/company/applicant/${applicant.student_id}/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    setProfileData(data);
                }
            } catch (err) {
                console.error("Error fetching applicant profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplicantProfile();
    }, [applicant.student_id, token]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {profileData?.profile?.profile_image_url ? (
                            <img
                                src={`${API_URL}${profileData.profile.profile_image_url}`}
                                alt={applicant.name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-semibold">
                                {applicant.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{applicant.name}</h2>
                            <p className="text-gray-600 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {applicant.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Application Status & Actions */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Application Status</p>
                                {(() => {
                                    const statusInfo = statusConfig[applicant.status] || statusConfig.pending;
                                    return (
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                                            {statusInfo.label}
                                        </span>
                                    );
                                })()}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        onStatusChange(applicant.id, "accepted");
                                        onClose();
                                    }}
                                    disabled={applicant.status === "accepted"}
                                    title="Accept application"
                                    className={`p-2 rounded-full transition-all ${applicant.status === "accepted"
                                        ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                                        : "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-110"
                                        }`}
                                >
                                    <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => {
                                        onStatusChange(applicant.id, "rejected");
                                        onClose();
                                    }}
                                    disabled={applicant.status === "rejected"}
                                    title="Reject application"
                                    className={`p-2 rounded-full transition-all ${applicant.status === "rejected"
                                        ? "bg-red-100 text-red-700 cursor-not-allowed"
                                        : "bg-red-600 text-white hover:bg-red-700 hover:scale-110"
                                        }`}
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Applied on {new Date(applicant.appliedDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    {/* Profile Information */}
                    {profileData?.profile && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Profile Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                                {profileData.profile.city && (
                                    <div>
                                        <p className="text-sm text-gray-600">Location</p>
                                        <p className="font-medium text-gray-900">
                                            {profileData.profile.city}, {profileData.profile.state}
                                        </p>
                                    </div>
                                )}
                                {profileData.profile.dob && (
                                    <div>
                                        <p className="text-sm text-gray-600">Date of Birth</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(profileData.profile.dob).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {profileData.profile.bio && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Bio</p>
                                    <p className="text-gray-900">{profileData.profile.bio}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Education */}
                    {profileData?.education && profileData.education.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5" />
                                Education
                            </h3>
                            <div className="space-y-3">
                                {profileData.education.map((edu) => (
                                    <div key={edu.id} className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                                        {edu.field_of_study && (
                                            <p className="text-gray-700">{edu.field_of_study}</p>
                                        )}
                                        <p className="text-gray-600">{edu.institution}</p>
                                        <p className="text-sm text-gray-500">
                                            {edu.start_year} - {edu.is_current ? "Present" : edu.end_year}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {profileData?.experience && profileData.experience.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Briefcase className="w-5 h-5" />
                                Experience
                            </h3>
                            <div className="space-y-3">
                                {profileData.experience.map((exp) => (
                                    <div key={exp.id} className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                                        <p className="text-gray-700">{exp.company}</p>
                                        <p className="text-sm text-gray-500">
                                            {exp.start_date && new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {' '}
                                            {exp.is_current ? "Present" : exp.end_date && new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                        {exp.description && (
                                            <p className="text-gray-600 mt-2">{exp.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {profileData?.skills && profileData.skills.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Code className="w-5 h-5" />
                                Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {profileData.skills.map((skill) => (
                                    <span
                                        key={skill.id}
                                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                                    >
                                        {skill.skill_name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {profileData?.certifications && profileData.certifications.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Certifications
                            </h3>
                            <div className="space-y-3">
                                {profileData.certifications.map((cert) => (
                                    <div key={cert.id} className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                                        <p className="text-gray-700">{cert.issuing_organization}</p>
                                        <p className="text-sm text-gray-500">
                                            Issued: {cert.issue_date && new Date(cert.issue_date).toLocaleDateString()}
                                            {cert.expiry_date && ` • Expires: ${new Date(cert.expiry_date).toLocaleDateString()}`}
                                        </p>
                                        {cert.credential_id && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                Credential ID: {cert.credential_id}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!profileData && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No profile information available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function CompanyJobDetail() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("details");
    const [applicants, setApplicants] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [jobStatus, setJobStatus] = useState("draft");
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [toast, setToast] = useState(null);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const token = localStorage.getItem("token");

    const showToast = (message, type = "success") => {
        setToast({ message, type });
    };

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await fetch(`${API_URL}/company/publish/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (res.ok) {
                    setJob(data.job);
                    setJobStatus(data.job.status || "draft");
                } else {
                    console.error(data.message || "Job not found");
                }
            } catch (err) {
                console.error("Error fetching job:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [postId, token]);

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const res = await fetch(
                    `${API_URL}/company/job/${postId}/applicants`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    console.error(data.message || "Failed to fetch applicants");
                    return;
                }

                const mappedApplicants = data.applicants.map(app => {
                    let uiStatus = "pending";
                    if (["pending", "accepted", "rejected"].includes(app.status)) {
                        uiStatus = app.status;
                    }
                    return {
                        id: app.application_id,
                        student_id: app.student_id,
                        name: app.student_name,
                        email: app.student_email,
                        appliedDate: app.applied_at,
                        status: uiStatus,
                        profile_image_url: null, // Will be fetched separately
                    };
                });

                setApplicants(mappedApplicants);

                // Fetch profile images for each applicant
                mappedApplicants.forEach(async (applicant) => {
                    try {
                        const profileRes = await fetch(
                            `${API_URL}/company/applicant/${applicant.student_id}/profile`,
                            {
                                headers: { Authorization: `Bearer ${token}` },
                            }
                        );

                        if (profileRes.ok) {
                            const profileData = await profileRes.json();
                            if (profileData?.profile?.profile_image_url) {
                                setApplicants(prev =>
                                    prev.map(app =>
                                        app.student_id === applicant.student_id
                                            ? { ...app, profile_image_url: profileData.profile.profile_image_url }
                                            : app
                                    )
                                );
                            }
                        }
                    } catch (err) {
                        console.error(`Error fetching profile for ${applicant.student_id}:`, err);
                    }
                });
            } catch (err) {
                console.error("Error fetching applicants:", err);
            }
        };

        fetchApplicants();
    }, [postId, token]);

    const handleJobStatusChange = async (newStatus) => {
        setUpdatingStatus(true);
        try {
            const res = await fetch(`${API_URL}/company/publish/${postId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...job, status: newStatus }),
            });

            if (res.ok) {
                setJobStatus(newStatus);
                setJob(prev => ({ ...prev, status: newStatus }));

                const statusMessages = {
                    draft: "Job saved as draft",
                    published: "Job published successfully! 🎉",
                    closed: "Job closed for applications"
                };
                showToast(statusMessages[newStatus] || "Job status updated");
            } else {
                const data = await res.json();
                showToast(data.message || "Failed to update job status", "error");
            }
        } catch (err) {
            console.error("Error updating job status:", err);
            showToast("An error occurred while updating the job status", "error");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleStatusChange = async (applicantId, newStatus) => {
        try {
            setApplicants(prev =>
                prev.map(app => (app.id === applicantId ? { ...app, status: newStatus } : app))
            );

            const res = await fetch(
                `${API_URL}/company/applications/${applicantId}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ status: newStatus })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setApplicants(prev =>
                    prev.map(app => {
                        if (app.id === applicantId) {
                            return { ...app, status: data.data?.previousStatus || 'pending' };
                        }
                        return app;
                    })
                );
                showToast(data.message || "Failed to update application status", "error");
                return;
            }

            const statusMessages = {
                accepted: "Application accepted",
                rejected: "Application rejected",
                pending: "Application marked as pending"
            };
            showToast(statusMessages[newStatus] || "Application status updated");
        } catch (error) {
            console.error("Error updating application status:", error);
            showToast("An error occurred while updating the application status", "error");
            setApplicants(prev =>
                prev.map(app => (app.id === applicantId ? { ...app, status: 'pending' } : app))
            );
        }
    };

    const filteredApplicants = applicants.filter(app =>
        filterStatus === "all" || app.status === filterStatus
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-3"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Job not found</h2>
                    <button
                        onClick={() => navigate("/company/jobs")}
                        className="text-blue-600 hover:underline"
                    >
                        Back to jobs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {selectedApplicant && (
                <ApplicantProfileModal
                    applicant={selectedApplicant}
                    onClose={() => setSelectedApplicant(null)}
                    onStatusChange={handleStatusChange}
                />
            )}

            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate("/company/jobs")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to jobs
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                {job.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {job.location}
                                </span>
                                <span>•</span>
                                <span>{job.location_type}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Posted {new Date(job.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Job Status
                            </label>
                            <select
                                value={jobStatus}
                                onChange={(e) => handleJobStatusChange(e.target.value)}
                                disabled={updatingStatus}
                                className={`px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${jobStatus === "published"
                                    ? "bg-green-50 text-green-700 border-green-300"
                                    : jobStatus === "closed"
                                        ? "bg-red-50 text-red-700 border-red-300"
                                        : "bg-gray-50 text-gray-700"
                                    } ${updatingStatus ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400"}`}
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 border-b border-gray-200">
                        <nav className="flex gap-8">
                            <button
                                onClick={() => setActiveTab("details")}
                                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "details"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                Job Details
                            </button>
                            <button
                                onClick={() => setActiveTab("applicants")}
                                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === "applicants"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                Applicants
                                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                                    {applicants.length}
                                </span>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {activeTab === "details" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Job details</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 flex items-center justify-center text-gray-400 mt-0.5 font-bold">
                                            ₹
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Salary</p>
                                            <p className="text-gray-600">
                                                {job.pay_show_by === "Range" && job.pay_min && job.pay_max
                                                    ? `₹${job.pay_min} - ₹${job.pay_max}`
                                                    : job.pay_show_by === "Starting Amount" && job.pay_min
                                                        ? `Starting at ₹${job.pay_min}`
                                                        : job.pay_show_by === "Maximum Amount" && job.pay_max
                                                            ? `Up to ₹${job.pay_max}`
                                                            : job.pay_show_by === "Exact Amount" && job.pay_min
                                                                ? `₹${job.pay_min}`
                                                                : "Competitive"}
                                                {job.pay_rate && ` ${job.pay_rate}`}
                                            </p>
                                        </div>
                                    </div>

                                    {job.job_types?.length > 0 && (
                                        <div className="flex items-start gap-3">
                                            <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-900">Job type</p>
                                                <p className="text-gray-600">{job.job_types.join(", ")}</p>
                                            </div>
                                        </div>
                                    )}

                                    {job.shift?.length > 0 && (
                                        <div className="flex items-start gap-3">
                                            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-900">Shift</p>
                                                <p className="text-gray-600">{job.shift.join(", ")}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-900">Number of openings</p>
                                            <p className="text-gray-600">{job.hiring_count} positions</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Full job description</h2>
                                <div className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere">
                                    {job.description || "No description provided."}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Qualifications</h2>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <p className="font-medium text-gray-900 mb-1">Education</p>
                                        <p className="text-gray-600">{job.education || "Not specified"}</p>
                                    </div>

                                    <div>
                                        <p className="font-medium text-gray-900 mb-1">Experience</p>
                                        <p className="text-gray-600">
                                            {job.experience_years ? `${job.experience_years} years` : "Any"}
                                            {job.experience_type && ` - ${job.experience_type}`}
                                        </p>
                                    </div>

                                    {job.certifications && (
                                        <div>
                                            <p className="font-medium text-gray-900 mb-1">Certifications</p>
                                            <p className="text-gray-600">{job.certifications}</p>
                                        </div>
                                    )}

                                    {job.language?.length > 0 && (
                                        <div>
                                            <p className="font-medium text-gray-900 mb-1">Languages</p>
                                            <p className="text-gray-600">{job.language.join(", ")}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-gray-700">Filter by status:</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Applicants</option>
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {filteredApplicants.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No applicants found</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {filteredApplicants.map((applicant) => (
                                        <div
                                            key={applicant.id}
                                            onClick={() => setSelectedApplicant(applicant)}
                                            className="p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        {applicant.profile_image_url ? (
                                                            <img
                                                                src={`${API_URL}${applicant.profile_image_url}`}
                                                                alt={applicant.name}
                                                                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                                                {applicant.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">{applicant.name}</h3>
                                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                                <span className="flex items-center gap-1">
                                                                    <Mail className="w-3.5 h-3.5" />
                                                                    {applicant.email}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            Applied {new Date(applicant.appliedDate).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {applicant.status === "accepted" && (
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                                                                <CheckCircle className="w-4 h-4" />
                                                                <span className="text-xs font-medium">Accepted</span>
                                                            </div>
                                                        )}
                                                        {applicant.status === "rejected" && (
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-full border border-red-200">
                                                                <XCircle className="w-4 h-4" />
                                                                <span className="text-xs font-medium">Rejected</span>
                                                            </div>
                                                        )}
                                                        {applicant.status === "pending" && (
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                                                                <Clock className="w-4 h-4" />
                                                                <span className="text-xs font-medium">Under Review</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}