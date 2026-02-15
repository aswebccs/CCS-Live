import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    MapPin,
    Briefcase,
    Calendar,
    Users,
    Clock,
    ArrowLeft,
    Mail,
    CheckCircle,
    XCircle,
    ChevronDown,
    X,
} from "lucide-react";

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

// ✅ Confirmation Modal for Job Status
const ConfirmationModal = ({ isOpen, onClose, onConfirm, status }) => {
    if (!isOpen) return null;

    const statusInfo = {
        paused: {
            title: "Pause Job?",
            message: "This job will not be visible to students. You can publish it later.",
            icon: "",
            confirmText: "Pause Job",
            confirmClass: "bg-gray-600 hover:bg-gray-700"
        },
        published: {
            title: "Publish Job?",
            message: "This job will be visible to all students and they can start applying.",
            icon: "",
            confirmText: "Publish Job",
            confirmClass: "bg-green-600 hover:bg-green-700"
        },
        closed: {
            title: "Close Job?",
            message: "No new applications will be accepted. Existing applications will remain accessible.",
            icon: "XX",
            confirmText: "Close Job",
            confirmClass: "bg-red-600 hover:bg-red-700"
        },
        reopen: {
            title: "Reopen Job?",
            message: "This job will be visible to students again and applications will reopen.",
            icon: "",
            confirmText: "Reopen Job",
            confirmClass: "bg-blue-600 hover:bg-blue-700"
        }
    };

    const info = statusInfo[status] || statusInfo.paused;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                <div className="text-center mb-4">
                    <div className="text-5xl mb-3">{info.icon}</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {info.title}
                    </h2>
                    <p className="text-gray-600">
                        {info.message}
                    </p>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors ${info.confirmClass}`}
                    >
                        {info.confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ✅ Close Job Feedback Modal (UI-only)
const CloseFeedbackModal = ({ isOpen, onClose, onComplete, jobTitle }) => {
    const [step, setStep] = useState(1);
    const [reason, setReason] = useState("");
    const [subReason, setSubReason] = useState("");
    const [hireMethod, setHireMethod] = useState("");
    const [hireCount, setHireCount] = useState(1);

    if (!isOpen) return null;

    const resetAndClose = () => {
        setStep(1);
        setReason("");
        setSubReason("");
        setHireMethod("");
        setHireCount(1);
        onClose();
    };

    const reasonOptions = [
        "I hired someone!",
        "I didn't hire anyone",
        "I have a technical issue",
    ];

    const noHireOptions = [
        "I didn't find any good candidates",
        "I got too many unqualified applicants",
        "Hiring is on hold/canceled",
        "I filled this position outside",
        "I am evaluating current applicants",
        "Other",
    ];

    const techIssueOptions = [
        "I didn't mean to post this job",
        "I'm having technical problems with my job post",
        "I'm spending more than expected",
        "Other problem",
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                <div className="flex items-start justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">Close job: {jobTitle || "Job"}</h2>
                    <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">Step {step} of 2</p>

                {step === 1 && (
                    <>
                        <p className="text-sm text-gray-600 mb-3">
                            Closing a job removes it from search results and your list of active jobs. You can still communicate with applicants.
                        </p>
                        <p className="text-sm font-medium text-gray-900 mb-2">Why are you closing this job?</p>
                        <div className="space-y-2">
                            {reasonOptions.map((opt) => (
                                <label
                                    key={opt}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer ${reason === opt
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="close-reason"
                                        value={opt}
                                        checked={reason === opt}
                                        onChange={() => setReason(opt)}
                                        className="text-blue-600"
                                    />
                                    <span className="text-sm text-gray-800">{opt}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={resetAndClose}
                                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!reason}
                                className={`px-4 py-2.5 text-white rounded-lg font-medium transition-colors ${reason ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                                    }`}
                            >
                                Continue
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        {reason === "I hired someone!" && (
                            <>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                                        🎉
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Congratulations on hiring!</p>
                                        <p className="text-sm text-gray-600">Tell us more to help improve analytics and matching.</p>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-900 mb-2">How did you hire?</p>
                                <div className="space-y-2 mb-4">
                                    {["I hired with Indeed", "I hired from outside Indeed"].map((opt) => (
                                        <label
                                            key={opt}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer ${hireMethod === opt
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:bg-gray-50"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="hire-method"
                                                value={opt}
                                                checked={hireMethod === opt}
                                                onChange={() => setHireMethod(opt)}
                                                className="text-blue-600"
                                            />
                                            <span className="text-sm text-gray-800">{opt}</span>
                                        </label>
                                    ))}
                                </div>

                                <p className="text-sm font-medium text-gray-900 mb-2">How many people did you hire?</p>
                                <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setHireCount((c) => Math.max(1, c - 1))}
                                        className="px-3 py-2 text-gray-700 hover:bg-gray-50"
                                    >
                                        –
                                    </button>
                                    <div className="px-4 py-2 text-sm font-medium text-gray-900 min-w-[48px] text-center">
                                        {hireCount}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setHireCount((c) => c + 1)}
                                        className="px-3 py-2 text-gray-700 hover:bg-gray-50"
                                    >
                                        +
                                    </button>
                                </div>
                            </>
                        )}

                        {reason === "I didn't hire anyone" && (
                            <>
                                <p className="text-sm text-gray-600 mb-3">
                                    Closing a job removes it from search results and your list of active jobs. You can still communicate with applicants.
                                </p>
                                <p className="text-sm font-medium text-gray-900 mb-2">Why didn't you hire?</p>
                                <div className="space-y-2">
                                    {noHireOptions.map((opt) => (
                                        <label
                                            key={opt}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer ${subReason === opt
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:bg-gray-50"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="no-hire-reason"
                                                value={opt}
                                                checked={subReason === opt}
                                                onChange={() => setSubReason(opt)}
                                                className="text-blue-600"
                                            />
                                            <span className="text-sm text-gray-800">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </>
                        )}

                        {reason === "I have a technical issue" && (
                            <>
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                                    <p className="text-sm font-semibold text-blue-900">We're here to help!</p>
                                    <p className="text-xs text-blue-900/80 mt-1">Contact support for technical questions.</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900 mb-2">Which best describes your issue?</p>
                                <div className="space-y-2">
                                    {techIssueOptions.map((opt) => (
                                        <label
                                            key={opt}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer ${subReason === opt
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:bg-gray-50"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="tech-issue-reason"
                                                value={opt}
                                                checked={subReason === opt}
                                                onChange={() => setSubReason(opt)}
                                                className="text-blue-600"
                                            />
                                            <span className="text-sm text-gray-800">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setStep(1)}
                                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Go back
                            </button>
                            <button
                                onClick={() => {
                                    onComplete();
                                    resetAndClose();
                                }}
                                disabled={
                                    (reason === "I hired someone!" && !hireMethod) ||
                                    (reason !== "I hired someone!" && !subReason)
                                }
                                className={`px-4 py-2.5 text-white rounded-lg font-medium transition-colors ${((reason === "I hired someone!" && hireMethod) ||
                                    (reason !== "I hired someone!" && subReason))
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-blue-300 cursor-not-allowed"
                                    }`}
                            >
                                Close this job
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// ✅ Reopen Reason Modal (UI-only)
const ReopenReasonModal = ({ isOpen, onClose, onContinue }) => {
    const [reason, setReason] = useState("");

    if (!isOpen) return null;

    const options = [
        "I'm hiring for a new opening and want to reuse this post",
        "I'm still hiring for the same position, and I need more candidates",
        "Other",
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-2">
                            Reopen job
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Reopen job</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-gray-600 mb-4 text-sm">
                    We will reopen your job so new job seekers can see it in search results.
                    This won't affect your existing applicants and candidates.
                </p>

                <p className="text-gray-900 font-medium mb-2 text-sm">
                    Why would you like to reopen this job?
                </p>

                <div className="space-y-2">
                    {options.map((opt) => (
                        <label
                            key={opt}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer ${reason === opt
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            <input
                                type="radio"
                                name="reopen-reason"
                                value={opt}
                                checked={reason === opt}
                                onChange={() => setReason(opt)}
                                className="text-blue-600"
                            />
                            <span className="text-sm text-gray-800">{opt}</span>
                        </label>
                    ))}
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onContinue(reason)}
                        disabled={!reason}
                        className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors ${reason ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                            }`}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function CompanyJobDetail() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const statusDropdownRef = useRef(null);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("details");
    const [applicants, setApplicants] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [jobStatus, setJobStatus] = useState("paused");
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [toast, setToast] = useState(null);
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);

    // ✅ STATES FOR CONFIRMATION MODAL
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [showReopenModal, setShowReopenModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);

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
                    const normalizedStatus = data.job.status === "reopen" ? "published" : (data.job.status || "paused");
                    setJobStatus(normalizedStatus);
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
        if (!statusMenuOpen) return;
        const handleClickOutside = (event) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setStatusMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [statusMenuOpen]);

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
                    };
                });

                setApplicants(mappedApplicants);
            } catch (err) {
                console.error("Error fetching applicants:", err);
            }
        };

        fetchApplicants();
    }, [postId, token]);

    // ✅ Show confirmation modal first
    const handleJobStatusChange = (newStatus) => {
        if (newStatus === "reopen") {
            setPendingStatus(newStatus);
            setShowReopenModal(true);
            return;
        }
        if (newStatus === "closed") {
            setPendingStatus(newStatus);
            setShowCloseModal(true);
            return;
        }
        setPendingStatus(newStatus);
        setShowConfirmModal(true);
    };

    // ✅ Actual status change after confirmation
    const confirmStatusChange = async () => {
        setShowConfirmModal(false);
        setUpdatingStatus(true);

        try {
            const res = await fetch(`${API_URL}/company/publish/${postId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...job, status: pendingStatus }),
            });

            if (res.ok) {
                const normalizedStatus = pendingStatus === "reopen" ? "published" : pendingStatus;
                setJobStatus(normalizedStatus);
                setJob(prev => ({ ...prev, status: normalizedStatus }));

                const statusMessages = {
                    paused: "Job paused",
                    published: "Job published successfully!",
                    closed: "Job closed for applications",
                    reopen: "Job reopened"
                };
                showToast(statusMessages[pendingStatus] || "Job status updated");
            } else {
                const data = await res.json();
                showToast(data.message || "Failed to update job status", "error");
            }
        } catch (err) {
            console.error("Error updating job status:", err);
            showToast("An error occurred while updating the job status", "error");
        } finally {
            setUpdatingStatus(false);
            setPendingStatus(null);
        }
    };

    const filteredApplicants = applicants.filter(app =>
        filterStatus === "all" || app.status === filterStatus
    );

    const statusOptions = [
        { value: "paused", label: "Paused", dotClass: "bg-gray-500" },
        { value: "published", label: "Published", dotClass: "bg-emerald-500" },
        { value: "closed", label: "Closed", dotClass: "bg-red-500" },
        { value: "reopen", label: "Reopen", dotClass: "bg-blue-500" },
    ];
    const currentStatus = statusOptions.find((opt) => opt.value === jobStatus) || statusOptions[0];
    const allowedTransitions = {
        paused: ["published", "closed"],
        published: ["paused", "closed"],
        closed: ["reopen"],
        reopen: ["published", "closed", "paused"],
    };
    const visibleOptions = statusOptions.filter((opt) => {
        if (jobStatus !== "closed" && opt.value === "reopen") return false;
        return opt.value === jobStatus || (allowedTransitions[jobStatus] || []).includes(opt.value);
    });

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
                        onClick={() => navigate("/dashboard")}
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

            {/* ✅ CONFIRMATION MODAL */}
            {showConfirmModal && (
                <ConfirmationModal
                    isOpen={showConfirmModal}
                    onClose={() => {
                        setShowConfirmModal(false);
                        setPendingStatus(null);
                    }}
                    onConfirm={confirmStatusChange}
                    status={pendingStatus}
                />
            )}

            {showReopenModal && (
                <ReopenReasonModal
                    isOpen={showReopenModal}
                    onClose={() => {
                        setShowReopenModal(false);
                        setPendingStatus(null);
                    }}
                    onContinue={() => {
                        setShowReopenModal(false);
                        setShowConfirmModal(true);
                    }}
                />
            )}

            {showCloseModal && (
                <CloseFeedbackModal
                    isOpen={showCloseModal}
                    onClose={() => {
                        setShowCloseModal(false);
                        setPendingStatus(null);
                    }}
                    onComplete={() => {
                        setShowCloseModal(false);
                        confirmStatusChange();
                    }}
                    jobTitle={job?.title}
                />
            )}

            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate("/dashboard")}
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
                            <div className="relative" ref={statusDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setStatusMenuOpen((prev) => !prev)}
                                    disabled={updatingStatus}
                                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${updatingStatus ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400"}`}
                                    aria-haspopup="listbox"
                                    aria-expanded={statusMenuOpen}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${currentStatus.dotClass}`} />
                                        <span className="text-gray-900">{currentStatus.label}</span>
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                </button>

                                {statusMenuOpen && (
                                    <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                        <div className="py-1" role="listbox" aria-label="Job status">
                                            {visibleOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setStatusMenuOpen(false);
                                                        if (option.value !== jobStatus) {
                                                            handleJobStatusChange(option.value);
                                                        }
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    role="option"
                                                    aria-selected={option.value === jobStatus}
                                                >
                                                    <span className={`w-2 h-2 rounded-full ${option.dotClass}`} />
                                                    <span>{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                            onClick={() => navigate(`/company/posts/${postId}/applicant/${applicant.id}`)}
                                            className="p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="mb-2">
                                                        <h3 className="font-semibold text-gray-900">{applicant.name}</h3>
                                                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Mail className="w-3.5 h-3.5" />
                                                                {applicant.email}
                                                            </span>
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
