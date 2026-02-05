import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import axios from "axios";
import {
    Briefcase,
    Building2,
    Calendar,
    Clock,
    Filter,
    Search,
    MapPin,
    TrendingUp,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Heart,
    ArrowRight,
    DollarSign,
    Sparkles,
    X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const statusConfig = {
    pending: {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
        label: "Under Review",
        dotColor: "bg-amber-500"
    },
    accepted: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
        label: "Accepted",
        dotColor: "bg-emerald-500"
    },
    rejected: {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        label: "Not Selected",
        dotColor: "bg-red-500"
    }
};

export default function StudentAppliedJobs() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedJob, setSelectedJob] = useState(null);

    // Right sidebar states
    const [availableJobs, setAvailableJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [savedJobs, setSavedJobs] = useState(new Set());
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const appliedJobIds = new Set(
        jobs.map(job => String(job.jobId)) // OR job.job_id depending on backend
    );


    useEffect(() => {
        const fetchAppliedJobs = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${API_URL}/student/student/applied-jobs`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setJobs(res.data.data || []);
            } catch (err) {
                console.error("Error fetching applied jobs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAppliedJobs();
    }, []);

    // Fetch available jobs for right sidebar
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

    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            job.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.companyName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterStatus === "all" ||
            job.applicationStatus?.toLowerCase() === filterStatus.toLowerCase();

        return matchesSearch && matchesFilter;
    });

    const getStatusConfig = (status) => {
        const normalizedStatus = status?.toLowerCase() || "pending";
        return statusConfig[normalizedStatus] || statusConfig.pending;
    };

    const stats = {
        total: jobs.length,
        pending: jobs.filter(j => j.applicationStatus?.toLowerCase() === "pending").length,
        accepted: jobs.filter(j => j.applicationStatus?.toLowerCase() === "accepted").length,
        rejected: jobs.filter(j => j.applicationStatus?.toLowerCase() === "rejected").length,
    };

    const handleCardClick = (job) => {
        setSelectedJob(job);
        navigate(`/jobs/applied/${job.applicationId}`);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header - Search Bar & Stats */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="px-4 sm:px-6 py-4 sm:py-5">
                    <div className="max-w-7xl mx-auto">
                        {/* Title & Stats */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                    My Applications
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">Track and manage your job applications</p>
                            </div>

                            {/* Mobile: View Available Jobs Button */}
                            <button
                                onClick={() => setShowMobileSidebar(true)}
                                className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
                            >
                                <Sparkles className="w-4 h-4" />
                                Browse Jobs
                            </button>

                        </div>

                        {/* Stats Cards - Responsive Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-blue-700">Total</p>
                                        <p className="text-xl sm:text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
                                    </div>
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 sm:p-4 border border-amber-200 hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-amber-700">Pending</p>
                                        <p className="text-xl sm:text-2xl font-bold text-amber-900 mt-1">{stats.pending}</p>
                                    </div>
                                    <Clock className="w-5 h-5 text-amber-600" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 sm:p-4 border border-emerald-200 hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-emerald-700">Accepted</p>
                                        <p className="text-xl sm:text-2xl font-bold text-emerald-900 mt-1">{stats.accepted}</p>
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 sm:p-4 border border-red-200 hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-red-700">Rejected</p>
                                        <p className="text-xl sm:text-2xl font-bold text-red-900 mt-1">{stats.rejected}</p>
                                    </div>
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by job title or company..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="sm:w-48">
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer transition-all"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - Adjusted Width Distribution (3/4 - 1/4 Split) */}
            <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">
                {/* Left - Applied Jobs List (3/4 width - Wider) */}
                <main className="w-full lg:w-3/4 overflow-y-auto bg-gray-50 border-r border-gray-200">
                    <div className="p-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                                <p className="text-sm text-gray-600">Loading applications...</p>
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <Card className="border border-gray-200 shadow-sm">
                                <CardContent className="py-16">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-2xl mb-4">
                                            <Briefcase className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {searchQuery || filterStatus !== "all"
                                                ? "No matching applications"
                                                : "No applications yet"}
                                        </h3>
                                        <p className="text-sm text-gray-600 max-w-md mb-4">
                                            {searchQuery || filterStatus !== "all"
                                                ? "Try different search terms or filters"
                                                : "Start applying to jobs and track them here"}
                                        </p>
                                        <button
                                            onClick={() => navigate("/jobs")}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            Browse Jobs
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 mb-3">
                                    <span className="font-semibold text-gray-900">{filteredJobs.length}</span> {filteredJobs.length === 1 ? 'application' : 'applications'} found
                                </p>

                                {filteredJobs.map((job, index) => {
                                    const statusInfo = getStatusConfig(job.applicationStatus);
                                    const StatusIcon = statusInfo.icon;

                                    return (
                                        <div
                                            key={job.applicationId}
                                            onClick={() => handleCardClick(job)}
                                            style={{ animationDelay: `${index * 50}ms` }}
                                            className={`animate-fadeIn bg-white p-4 rounded-lg border cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ${selectedJob?.applicationId === job.applicationId
                                                ? "border-blue-500 shadow-lg ring-2 ring-blue-100"
                                                : "border-gray-200 hover:border-blue-300"
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Company Icon with Animation */}
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md hover:shadow-lg transition-shadow">
                                                    <Building2 className="w-6 h-6 text-white" />
                                                </div>

                                                {/* Job Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-1">
                                                        {job.jobTitle}
                                                    </h3>
                                                    <p className="text-sm text-gray-700 font-medium mb-2">
                                                        {job.companyName}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            Applied {new Date(job.appliedAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                        {job.location && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                {job.location}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className={`inline-flex px-3 py-1.5 rounded-full border items-center gap-1.5 ${statusInfo.color} text-xs font-medium`}>
                                                        <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor} animate-pulse`}></span>
                                                        {statusInfo.label}
                                                    </div>

                                                    {/* Accepted Alert */}
                                                    {job.applicationStatus?.toLowerCase() === 'accepted' && (
                                                        <div>


                                                        </div>
                                                    )}

                                                    {/* Rejected Alert */}
                                                    {job.applicationStatus?.toLowerCase() === 'rejected' && (
                                                        <div className="mt-3 flex items-center gap-2 text-xs text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200 animate-slideIn">
                                                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                                            <span className="font-medium">Application not selected. Keep exploring other opportunities!</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>

                {/* Right - Available Jobs Sidebar (1/4 width - Narrower) */}
                <aside className={`w-full lg:w-1/4 bg-white overflow-y-auto ${showMobileSidebar ? 'fixed inset-0 z-40 lg:relative' : 'hidden lg:block'}`}>
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b border-blue-700 px-4 py-4 z-10 shadow-lg">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                <h2 className="text-sm font-bold">Available Jobs</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* <button
                                    onClick={() => navigate("/jobs")}
                                    className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                                >
                                    View All
                                </button> */}
                                {showMobileSidebar && (
                                    <button
                                        onClick={() => setShowMobileSidebar(false)}
                                        className="lg:hidden p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-blue-100">
                            {loadingJobs ? "Loading..." : `${availableJobs.length} opportunities`}
                        </p>
                    </div>

                    <div className="p-3">
                        {loadingJobs ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                                <p className="text-sm text-gray-500">Loading jobs...</p>
                            </div>
                        ) : availableJobs.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-2xl mb-4 inline-block">
                                    <Briefcase className="w-12 h-12 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500">No jobs available at the moment</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {availableJobs.map((job, index) => (
                                    <div
                                        key={job.id}
                                        onClick={() => {
                                            setShowMobileSidebar(false);

                                            if (appliedJobIds.has(String(job.id))) {
                                                navigate("/student/applied-jobs");
                                            } else {
                                                navigate(`/jobs/apply/${job.id}`);
                                            }
                                        }}

                                        style={{ animationDelay: `${index * 30}ms` }}
                                        className="animate-fadeIn group p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-lg bg-white cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-1">
                                                    {job.title}
                                                </h3>
                                                <p className="text-xs text-gray-600 font-medium truncate">
                                                    {job.company}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => toggleSaveJob(job.id, e)}
                                                className="p-1.5 hover:bg-gray-100 rounded-full transition-all flex-shrink-0 hover:scale-110"
                                            >
                                                <Heart
                                                    className={`w-4 h-4 transition-all ${savedJobs.has(job.id)
                                                        ? "fill-red-500 text-red-500 scale-110"
                                                        : "text-gray-400 group-hover:text-red-400"
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate">{job.location}</span>
                                            </span>
                                            <span className="text-gray-400">•</span>
                                            <span className="flex items-center gap-1">
                                                <Building2 className="w-3 h-3" />
                                                {job.workMode}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            {job.employmentType
                                                .split(", ")
                                                .slice(0, 2)
                                                .map((type) => (
                                                    <span
                                                        key={type}
                                                        className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-md border border-green-200 font-medium"
                                                    >
                                                        {type}
                                                    </span>
                                                ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {job.posted}
                                            </span>
                                            {appliedJobIds.has(String(job.id)) ? (
                                                <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full font-semibold">
                                                    Applied
                                                </span>
                                            ) : (
                                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                            )}

                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* Add CSS animations */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                    opacity: 0;
                }
                
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
                
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}