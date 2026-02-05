
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
    Briefcase,
    Building2,
    MapPin,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    TrendingUp,
    ArrowLeft,
    Heart,
    ArrowRight,
    Sparkles,
    X,
    DollarSign,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const statusMap = {
    pending: { label: "Under Review", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    shortlisted: { label: "Shortlisted", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    accepted: { label: "Accepted", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    rejected: { label: "Not Selected", icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
};

export default function AppliedJobDetails() {
    const { applicationId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Available jobs states
    const [availableJobs, setAvailableJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [savedJobs, setSavedJobs] = useState(new Set());
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [appliedJobIds, setAppliedJobIds] = useState(new Set());

    // Fetch applied jobs to get the list of applied job IDs
    useEffect(() => {
        const fetchAppliedJobs = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `${API_URL}/student/student/applied-jobs`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                // Create a Set of applied job IDs - checking multiple possible field names
                const ids = new Set(
                    (res.data.data || res.data).map(app =>
                        String(app.jobId || app.job_id || app.id)
                    )
                );

                setAppliedJobIds(ids);
            } catch (err) {
                console.error("Failed to load applied jobs:", err);
            }
        };

        fetchAppliedJobs();
    }, []);

    // Fetch specific application details
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `${API_URL}/student/student/applied-jobs/${applicationId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setData(res.data);
            } catch (err) {
                console.error("Failed to load applied job details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [applicationId]);

    // Fetch available jobs for sidebar
    useEffect(() => {
        const fetchAvailableJobs = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `${API_URL}/student/companies`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const formattedJobs = res.data.flatMap((company) =>
                    company.jobs.map((job) => ({
                        id: String(job.id),
                        title: job.title,
                        company: company.company_name,
                        location: job.location || "Not specified",
                        workMode: job.work_mode || "On-site",
                        salary: job.salary || "Competitive",
                        employmentType:
                            job.job_types?.length > 0
                                ? job.job_types.join(", ")
                                : "Full-time",
                        posted: job.posted_at
                            ? new Date(job.posted_at).toLocaleDateString()
                            : "Recently",
                        companyType: company.company_type || "Company",
                    }))
                );

                setAvailableJobs(formattedJobs.slice(0, 20));
            } catch (err) {
                console.error("Failed to load available jobs:", err);
            } finally {
                setLoadingJobs(false);
            }
        };

        fetchAvailableJobs();
    }, []);

    const toggleSaveJob = (jobId, e) => {
        e.stopPropagation();
        const newSaved = new Set(savedJobs);
        if (newSaved.has(jobId)) {
            newSaved.delete(jobId);
        } else {
            newSaved.add(jobId);
        }
        setSavedJobs(newSaved);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 text-lg font-semibold">Job details not found.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const { job, application } = data;

    const company = {
        name: job.company_name,
        industry: job.industry,
        website: job.website
    };

    const statusInfo = statusMap[application.status] || statusMap.pending;
    const StatusIcon = statusInfo.icon;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Main Content Area - 75% width */}
            <div className="flex-1 w-full lg:w-3/4 overflow-y-auto">
                <div className="px-4 py-6 lg:px-8 lg:py-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {/* Back Button & Mobile Sidebar Toggle */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Back to Applied Jobs
                            </button>

                            {/* Mobile: View Available Jobs Button */}
                            <button
                                onClick={() => setShowMobileSidebar(true)}
                                className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <Sparkles className="w-4 h-4" />
                                Browse Jobs
                            </button>
                        </div>

                        {/* Header Card */}
                        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="bg-white">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                                        <Briefcase className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                                            {job.title}
                                        </CardTitle>
                                        <p className="text-base text-gray-600 flex items-center gap-2 font-medium">
                                            <Building2 className="w-4 h-4 text-gray-500" />
                                            {company.name}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-3 bg-gray-50">
                                <div className="flex flex-wrap gap-3">
                                    {job.location && (
                                        <span className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg text-sm text-gray-700 border border-gray-200 font-medium">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            {job.location}
                                        </span>
                                    )}

                                    <span className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg text-sm text-gray-700 border border-gray-200 font-medium">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        Applied {new Date(application.appliedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>

                                    <span className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                                        <StatusIcon className="w-4 h-4" />
                                        {statusInfo.label}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Job Description */}
                        <Card className="border border-gray-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Job Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <p className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed text-sm">
                                    {job.description}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Job Details */}
                        <Card className="border border-gray-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Job Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Job Type</p>
                                        <p className="text-sm text-gray-900 font-medium">{job.jobType?.join(", ") || "Not specified"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Location Type</p>
                                        <p className="text-sm text-gray-900 font-medium">{job.locationType || "Not specified"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Experience Required</p>
                                        <p className="text-sm text-gray-900 font-medium">
                                            {job.experienceYears} years ({job.experienceType})
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Salary Range</p>
                                        <p className="text-sm text-gray-900 font-medium">
                                            {job.payMin} – {job.payMax} ({job.payRate})
                                        </p>
                                    </div>
                                    {job.skills && (
                                        <div className="sm:col-span-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Required Skills</p>
                                            <p className="text-sm text-gray-900 font-medium">{job.skills}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Available Jobs (25% width) */}
            <aside className={`w-full lg:w-1/4 bg-gray-50 border-l border-gray-200 overflow-y-auto ${showMobileSidebar ? 'fixed inset-0 z-50 lg:relative' : 'hidden lg:block'}`}>
                <div className="px-4 lg:px-4 py-6 lg:py-8">
                    {/* Spacer to align with back button + gap */}
                    <div className="h-[44px] lg:block hidden"></div>

                    {/* Main Card Container for Available Jobs Section */}
                    <Card className="border border-gray-200 shadow-sm bg-white">
                        {/* Card Header */}
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-blue-600" />
                                    <CardTitle className="text-base font-bold text-gray-900">Available Jobs</CardTitle>
                                </div>
                                {showMobileSidebar && (
                                    <button
                                        onClick={() => setShowMobileSidebar(false)}
                                        className="lg:hidden p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-600" />
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-600 font-medium">
                                {loadingJobs ? "Loading..." : `${availableJobs.length} opportunities available`}
                            </p>
                        </CardHeader>

                        {/* Card Content - Job Cards Inside */}
                        <CardContent className="pt-0">
                            {loadingJobs ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                                    <p className="text-sm text-gray-500">Loading opportunities...</p>
                                </div>
                            ) : availableJobs.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="bg-gray-100 p-5 rounded-xl mb-4 inline-block">
                                        <Briefcase className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">No jobs available</p>
                                    <p className="text-xs text-gray-500 mt-1">Check back later for new opportunities</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {availableJobs.map((job, index) => {
                                        const isApplied = appliedJobIds.has(String(job.id));

                                        return (
                                            <div
                                                key={job.id}
                                                onClick={() => {
                                                    if (isApplied) return; // Don't do anything if already applied

                                                    setShowMobileSidebar(false);
                                                    navigate(`/jobs/apply/${job.id}`);
                                                }}
                                                style={{ animationDelay: `${index * 50}ms` }}
                                                className={`animate-fadeIn group border rounded-lg p-4 transition-all duration-300 ${isApplied
                                                        ? "bg-gray-100 border-gray-300 opacity-70 cursor-not-allowed"
                                                        : "bg-gray-50 border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer"
                                                    }`}
                                            >
                                                {/* Job Header with Icon */}
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm flex-shrink-0">
                                                        <Briefcase className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                                            {job.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-600 font-medium flex items-center gap-1.5 mt-1">
                                                            <Building2 className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                                            <span className="truncate">{job.company}</span>
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={(e) => toggleSaveJob(job.id, e)}
                                                        className="p-1.5 hover:bg-gray-100 rounded-md transition-all flex-shrink-0"
                                                    >
                                                        <Heart
                                                            className={`w-4 h-4 transition-all ${savedJobs.has(job.id)
                                                                    ? "fill-red-500 text-red-500"
                                                                    : "text-gray-400 group-hover:text-red-400"
                                                                }`}
                                                        />
                                                    </button>
                                                </div>

                                                {/* Job Details */}
                                                <div className="space-y-3">
                                                    {/* Location */}
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                                                        <span className="truncate font-medium">{job.location}</span>
                                                    </div>

                                                    {/* Salary */}
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <DollarSign className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                                                        <span className="truncate font-medium">{job.salary}</span>
                                                    </div>

                                                    {/* Job Tags */}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {job.employmentType
                                                            .split(", ")
                                                            .slice(0, 2)
                                                            .map((type) => (
                                                                <span
                                                                    key={type}
                                                                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200 font-semibold"
                                                                >
                                                                    {type}
                                                                </span>
                                                            ))}
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200 font-medium">
                                                            {job.workMode}
                                                        </span>
                                                    </div>

                                                    {/* Footer with Date and Status/Arrow */}
                                                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                                        <span className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {job.posted}
                                                        </span>

                                                        {isApplied ? (
                                                            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full font-semibold">
                                                                Applied
                                                            </span>
                                                        ) : (
                                                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </aside>

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                    opacity: 0;
                }
                
                /* Custom Scrollbar */
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                ::-webkit-scrollbar-track {
                    background: #f9fafb;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 4px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            `}</style>
        </div>
    );
}