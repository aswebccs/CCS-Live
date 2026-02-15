import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    GraduationCap,
    User,
    Phone,
    Briefcase,
    Code,
    Award,
    CheckCircle,
    Check,
    RotateCcw,
    X,
    MapPin,
    Download,
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

export default function ApplicantDetail() {
    const { postId, applicationId } = useParams();
    const navigate = useNavigate();
    const [applicant, setApplicant] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [showPhone, setShowPhone] = useState(false);
    const token = localStorage.getItem("token");

    const showToast = (message, type = "success") => {
        setToast({ message, type });
    };

    const escapeHtml = (value) => {
        if (value === null || value === undefined) return "";
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };

    const formatDate = (value, options = { year: "numeric", month: "long", day: "numeric" }) => {
        if (!value) return "";
        try {
            return new Date(value).toLocaleDateString("en-US", options);
        } catch {
            return "";
        }
    };

    const handleDownloadProfile = () => {
        if (!applicant) {
            showToast("Applicant data not available", "error");
            return;
        }

        const profile = profileData?.profile || {};
        const education = profileData?.education || [];
        const experience = profileData?.experience || [];
        const skills = profileData?.skills || [];
        const certifications = profileData?.certifications || [];

        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(applicant.name)} - Profile</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; padding: 24px; }
    h1 { margin: 0 0 6px; font-size: 24px; }
    h2 { margin: 20px 0 8px; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
    .meta { color: #4b5563; font-size: 12px; margin-bottom: 12px; }
    .section { margin-bottom: 14px; }
    .item { margin-bottom: 10px; }
    .label { color: #6b7280; font-size: 12px; }
    .value { font-size: 13px; }
    .pill { display: inline-block; padding: 4px 8px; background: #eef2ff; color: #3730a3; border-radius: 999px; font-size: 11px; margin: 2px 4px 2px 0; }
  </style>
</head>
<body>
  <h1>${escapeHtml(applicant.name)}</h1>
  <div class="meta">
    ${escapeHtml(applicant.email || "")}
    ${applicant.appliedDate ? ` • Applied: ${escapeHtml(formatDate(applicant.appliedDate))}` : ""}
    ${applicant.status ? ` • Status: ${escapeHtml(applicant.status)}` : ""}
  </div>

  <div class="section">
    <h2>Profile</h2>
    ${profile.phone ? `<div class="item"><div class="label">Phone</div><div class="value">${escapeHtml(profile.phone)}</div></div>` : ""}
    ${(profile.city || profile.state) ? `<div class="item"><div class="label">Location</div><div class="value">${escapeHtml(profile.city || "")}${profile.state ? `, ${escapeHtml(profile.state)}` : ""}</div></div>` : ""}
    ${profile.dob ? `<div class="item"><div class="label">Date of Birth</div><div class="value">${escapeHtml(formatDate(profile.dob))}</div></div>` : ""}
    ${profile.bio ? `<div class="item"><div class="label">Bio</div><div class="value">${escapeHtml(profile.bio)}</div></div>` : ""}
  </div>

  ${education.length ? `
  <div class="section">
    <h2>Education</h2>
    ${education.map((edu) => `
      <div class="item">
        <div class="value"><strong>${escapeHtml(edu.degree || "")}</strong>${edu.field_of_study ? ` - ${escapeHtml(edu.field_of_study)}` : ""}</div>
        <div class="label">${escapeHtml(edu.institution || "")}</div>
        <div class="label">${escapeHtml(edu.start_year || "")} - ${edu.is_current ? "Present" : escapeHtml(edu.end_year || "")}</div>
      </div>
    `).join("")}
  </div>` : ""}

  ${experience.length ? `
  <div class="section">
    <h2>Experience</h2>
    ${experience.map((exp) => `
      <div class="item">
        <div class="value"><strong>${escapeHtml(exp.title || "")}</strong>${exp.company ? ` - ${escapeHtml(exp.company)}` : ""}</div>
        <div class="label">${escapeHtml(formatDate(exp.start_date, { month: "short", year: "numeric" }))}${exp.start_date ? " - " : ""}${exp.is_current ? "Present" : escapeHtml(formatDate(exp.end_date, { month: "short", year: "numeric" }))}</div>
        ${exp.description ? `<div class="value">${escapeHtml(exp.description)}</div>` : ""}
      </div>
    `).join("")}
  </div>` : ""}

  ${skills.length ? `
  <div class="section">
    <h2>Skills</h2>
    ${skills.map((s) => `<span class="pill">${escapeHtml(s.skill_name || "")}</span>`).join("")}
  </div>` : ""}

  ${certifications.length ? `
  <div class="section">
    <h2>Certifications</h2>
    ${certifications.map((c) => `
      <div class="item">
        <div class="value"><strong>${escapeHtml(c.name || "")}</strong></div>
        <div class="label">${escapeHtml(c.issuing_organization || "")}</div>
        <div class="label">${c.issue_date ? `Issued: ${escapeHtml(formatDate(c.issue_date))}` : ""}${c.expiry_date ? ` • Expires: ${escapeHtml(formatDate(c.expiry_date))}` : ""}</div>
        ${c.credential_id ? `<div class="label">Credential ID: ${escapeHtml(c.credential_id)}</div>` : ""}
      </div>
    `).join("")}
  </div>` : ""}
</body>
</html>`;

        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const margin = 40;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const maxWidth = pageWidth - margin * 2;
        let y = margin;

        const addSectionTitle = (title) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            const lines = doc.splitTextToSize(title, maxWidth);
            lines.forEach((line) => {
                if (y > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin, y);
                y += 18;
            });
        };

        const addBodyText = (text) => {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach((line) => {
                if (y > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin, y);
                y += 14;
            });
        };

        const addSpacer = (size = 8) => {
            y += size;
        };

        addSectionTitle(applicant.name || "Applicant Profile");
        addBodyText(`${applicant.email || ""}`);
        if (applicant.appliedDate) {
            addBodyText(`Applied: ${formatDate(applicant.appliedDate)}`);
        }
        if (applicant.status) {
            addBodyText(`Status: ${applicant.status}`);
        }
        addSpacer(12);

        addSectionTitle("Profile");
        if (profile.phone) addBodyText(`Phone: ${profile.phone}`);
        if (profile.city || profile.state) {
            addBodyText(`Location: ${profile.city || ""}${profile.state ? `, ${profile.state}` : ""}`);
        }
        if (profile.dob) addBodyText(`Date of Birth: ${formatDate(profile.dob)}`);
        if (profile.bio) addBodyText(`Bio: ${profile.bio}`);
        addSpacer(10);

        if (education.length) {
            addSectionTitle("Education");
            education.forEach((edu) => {
                const line1 = `${edu.degree || ""}${edu.field_of_study ? ` - ${edu.field_of_study}` : ""}`;
                const line2 = `${edu.institution || ""}`;
                const line3 = `${edu.start_year || ""} - ${edu.is_current ? "Present" : (edu.end_year || "")}`;
                addBodyText(line1.trim());
                if (line2.trim()) addBodyText(line2.trim());
                if (line3.trim()) addBodyText(line3.trim());
                addSpacer(6);
            });
            addSpacer(6);
        }

        if (experience.length) {
            addSectionTitle("Experience");
            experience.forEach((exp) => {
                const line1 = `${exp.title || ""}${exp.company ? ` - ${exp.company}` : ""}`;
                const line2 = `${exp.start_date ? formatDate(exp.start_date, { month: "short", year: "numeric" }) : ""}${exp.start_date ? " - " : ""}${exp.is_current ? "Present" : (exp.end_date ? formatDate(exp.end_date, { month: "short", year: "numeric" }) : "")}`;
                addBodyText(line1.trim());
                if (line2.trim()) addBodyText(line2.trim());
                if (exp.description) addBodyText(exp.description);
                addSpacer(6);
            });
            addSpacer(6);
        }

        if (skills.length) {
            addSectionTitle("Skills");
            addBodyText(skills.map((s) => s.skill_name).filter(Boolean).join(", "));
            addSpacer(6);
        }

        if (certifications.length) {
            addSectionTitle("Certifications");
            certifications.forEach((c) => {
                const line1 = `${c.name || ""}`;
                const line2 = `${c.issuing_organization || ""}`;
                const line3 = `${c.issue_date ? `Issued: ${formatDate(c.issue_date)}` : ""}${c.expiry_date ? ` • Expires: ${formatDate(c.expiry_date)}` : ""}`;
                addBodyText(line1.trim());
                if (line2.trim()) addBodyText(line2.trim());
                if (line3.trim()) addBodyText(line3.trim());
                if (c.credential_id) addBodyText(`Credential ID: ${c.credential_id}`);
                addSpacer(6);
            });
        }

        const fileName = `${(applicant.name || "applicant").replace(/\s+/g, "_")}_profile.pdf`;
        doc.save(fileName);
    };

    // Fetch applicant basic info and profile
    useEffect(() => {
        const fetchApplicantData = async () => {
            try {
                // First, get the application details
                const appRes = await fetch(`${API_URL}/company/job/${postId}/applicants`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const appData = await appRes.json();

                if (appRes.ok && appData.applicants) {
                    // ✅ FIXED: Compare as strings (UUID comparison)
                    const currentApp = appData.applicants.find(
                        (app) => String(app.application_id) === String(applicationId)
                    );

                    if (currentApp) {
                        let uiStatus = "pending";
                        if (["pending", "accepted", "rejected"].includes(currentApp.status)) {
                            uiStatus = currentApp.status;
                        }

                        const applicantData = {
                            id: currentApp.application_id,
                            student_id: currentApp.student_id,
                            name: currentApp.student_name,
                            email: currentApp.student_email,
                            appliedDate: currentApp.applied_at,
                            status: uiStatus,
                        };

                        setApplicant(applicantData);

                        // Then fetch full profile
                        const profileRes = await fetch(
                            `${API_URL}/company/applicant/${currentApp.student_id}/profile`,
                            {
                                headers: { Authorization: `Bearer ${token}` },
                            }
                        );

                        if (profileRes.ok) {
                            const profileData = await profileRes.json();
                            setProfileData(profileData);
                        }
                    } else {
                        showToast("Applicant not found", "error");
                    }
                } else {
                    showToast("Failed to load applicants", "error");
                }
            } catch (err) {
                console.error("Error fetching applicant data:", err);
                showToast("Failed to load applicant details", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchApplicantData();
    }, [postId, applicationId, token]);

    const handleStatusChange = async (newStatus) => {
        if (!applicant) return;
        const previousStatus = applicant.status;
        setApplicant((prev) => (prev ? { ...prev, status: newStatus } : prev));
        try {
            const res = await fetch(
                `${API_URL}/company/applications/${applicant.id}/status`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            let data = {};
            try {
                data = await res.json();
            } catch {
                data = {};
            }

            if (res.ok) {
                const statusMessages = {
                    accepted: "Application accepted",
                    rejected: "Application rejected",
                    pending: "Application marked as pending",
                };
                showToast(statusMessages[newStatus] || "Application status updated");
            } else {
                setApplicant((prev) => (prev ? { ...prev, status: previousStatus } : prev));
                showToast(data.message || "Failed to update application status", "error");
            }
        } catch (error) {
            console.error("Error updating application status:", error);
            setApplicant((prev) => (prev ? { ...prev, status: previousStatus } : prev));
            showToast("An error occurred while updating the application status", "error");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                    <p className="text-gray-600">Loading applicant profile...</p>
                </div>
            </div>
        );
    }

    if (!applicant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Applicant not found</h2>
                    <button
                        onClick={() => navigate(`/company/posts/${postId}`)}
                        className="text-blue-600 hover:underline"
                    >
                        Back to job details
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

            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate(`/company/posts/${postId}`)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to job details
                    </button>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {applicant.name}
                            </h1>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDownloadProfile}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                            >
                                <Download className="w-4 h-4" />
                                <span className="text-sm font-medium">Download</span>
                            </button>
                            {(() => {
                                const statusInfo = statusConfig[applicant.status] || statusConfig.pending;
                                return (
                                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                                        {statusInfo.label}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Actions */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-300/70 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all sticky top-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleStatusChange("accepted")}
                                        disabled={applicant.status === "accepted"}
                                        className={`p-2 rounded-md border border-emerald-200 transition-all ${applicant.status === "accepted"
                                                ? "bg-emerald-100 text-emerald-600 cursor-not-allowed"
                                                : "text-emerald-600 hover:bg-emerald-50"
                                            }`}
                                        aria-label="Accept application"
                                        title="Accept"
                                    >
                                        <Check className="w-6 h-6" />
                                    </button>

                                    {applicant.status !== "pending" && (
                                        <button
                                            onClick={() => handleStatusChange("pending")}
                                            className="p-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                                            aria-label="Reset to pending"
                                            title="Reset to Pending"
                                        >
                                            <RotateCcw className="w-6 h-6" />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleStatusChange("rejected")}
                                        disabled={applicant.status === "rejected"}
                                        className={`p-2 rounded-md border border-red-200 transition-all ${applicant.status === "rejected"
                                                ? "bg-red-100 text-red-600 cursor-not-allowed"
                                                : "text-red-600 hover:bg-red-50"
                                            }`}
                                        aria-label="Reject application"
                                        title="Reject"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-200/70">
                                <p className="text-sm text-gray-600 mb-1">Applied on</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(applicant.appliedDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Profile Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Information */}
                        {profileData?.profile && (
                            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-300/70 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col items-start gap-3">
                                        {profileData.profile.phone && (
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPhone((prev) => !prev)}
                                                    className="inline-flex items-center justify-center px-3 py-2 rounded-md border border-blue-200 text-blue-600 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                                    aria-label="Show phone number"
                                                    title={showPhone ? "Hide phone number" : "Show phone number"}
                                                >
                                                    <span className="text-sm font-semibold">Call</span>
                                                    <Phone className="w-4 h-4 ml-2" />
                                                </button>
                                                {showPhone && (
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {profileData.profile.phone}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {profileData.profile.city && (
                                            <p className="font-medium text-gray-900 flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                {profileData.profile.city}, {profileData.profile.state}
                                            </p>
                                        )}
                                    </div>
                                    {profileData.profile.dob && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(profileData.profile.dob).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {profileData.profile.bio && (
                                    <div className="mt-4">
                                        
                                        <p className="text-gray-900 leading-relaxed">{profileData.profile.bio}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Education */}
                        {profileData?.education && profileData.education.length > 0 && (
                            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-300/70 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                    <GraduationCap className="w-5 h-5" />
                                    Education
                                </h3>
                                <div className="space-y-4">
                                    {profileData.education.map((edu) => (
                                        <div key={edu.id} className="bg-gradient-to-br from-white/80 via-slate-50/80 to-slate-100/60 backdrop-blur-sm rounded-xl p-4 border border-slate-300/70 shadow-sm hover:shadow-md hover:border-slate-300 transition">
                                            <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                                            {edu.field_of_study && (
                                                <p className="text-gray-700 mt-1">{edu.field_of_study}</p>
                                            )}
                                            <p className="text-gray-600 mt-1">{edu.institution}</p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {edu.start_year} - {edu.is_current ? "Present" : edu.end_year}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Experience */}
                        {profileData?.experience && profileData.experience.length > 0 && (
                            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-300/70 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                    <Briefcase className="w-5 h-5" />
                                    Experience
                                </h3>
                                <div className="space-y-4">
                                    {profileData.experience.map((exp) => (
                                        <div key={exp.id} className="bg-gradient-to-br from-white/80 via-slate-50/80 to-slate-100/60 backdrop-blur-sm rounded-xl p-4 border border-slate-300/70 shadow-sm hover:shadow-md hover:border-slate-300 transition">
                                            <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                                            <p className="text-gray-700 mt-1">{exp.company}</p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {exp.start_date && new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                                                {exp.is_current ? "Present" : exp.end_date && new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </p>
                                            {exp.description && (
                                                <p className="text-gray-600 mt-3 leading-relaxed">{exp.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {profileData?.skills && profileData.skills.length > 0 && (
                            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-300/70 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                    <Code className="w-5 h-5" />
                                    Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {profileData.skills.map((skill) => (
                                        <span
                                            key={skill.id}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                                        >
                                            {skill.skill_name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {profileData?.certifications && profileData.certifications.length > 0 && (
                            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-300/70 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                    <Award className="w-5 h-5" />
                                    Certifications
                                </h3>
                                <div className="space-y-4">
                                    {profileData.certifications.map((cert) => (
                                        <div key={cert.id} className="bg-gradient-to-br from-white/80 via-slate-50/80 to-slate-100/60 backdrop-blur-sm rounded-xl p-4 border border-slate-300/70 shadow-sm hover:shadow-md hover:border-slate-300 transition">
                                            <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                                            <p className="text-gray-700 mt-1">{cert.issuing_organization}</p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Issued: {cert.issue_date && new Date(cert.issue_date).toLocaleDateString()}
                                                {cert.expiry_date && ` • Expires: ${new Date(cert.expiry_date).toLocaleDateString()}`}
                                            </p>
                                            {cert.credential_id && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    Credential ID: {cert.credential_id}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!profileData && (
                            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-300/70 p-12 text-center shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                                <p className="text-gray-500">No profile information available</p>
                            </div>
                        )}
                    </div>
                </div>
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
