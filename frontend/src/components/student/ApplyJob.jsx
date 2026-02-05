import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import {
    Upload,
    FileText,
    X,
    ChevronRight,
    ChevronLeft,
    Building2,
    Briefcase,
    Check,
} from "lucide-react";

export default function ApplyJob() {
    const { jobId } = useParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [resumeFile, setResumeFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        jobTitle: "",
        company: "",
    });

    /* ✅ NEW: Student info from backend */
    const [studentInfo, setStudentInfo] = useState({
        name: "",
        email: "",
    });

    /* ✅ Fetch student info when reaching review step (step 3) */
    useEffect(() => {
        if (currentStep === 3) {
            fetchStudentInfo();
        }
    }, [currentStep]);

    const fetchStudentInfo = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                "http://localhost:5000/api/student/student/basic-info",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            if (data.success) {
                setStudentInfo({
                    name: data.data.name,
                    email: data.data.email,
                });
            }
        } catch (err) {
            console.error("Error fetching student info:", err);
        }
    };
    /* Optional: Pre-fill job title & company from previous page */
    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`http://localhost:5000/api/student/companies`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();

                const allJobs = data.flatMap((company) => company.jobs);
                const job = allJobs.find((j) => j.id === jobId);
                if (job) {
                    setFormData({
                        jobTitle: job.title ?? "",
                        company: job.company ?? job.company_name ?? "",
                    });
                }
            } catch (err) {
                console.error("Error fetching job details:", err);
            }
        };

        fetchJobDetails();
    }, [jobId]);

    // Drag and Drop Handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (
                file.type === "application/pdf" ||
                file.type === "application/msword" ||
                file.type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ) {
                setResumeFile(file);
            } else {
                alert("Please upload only PDF or DOC/DOCX files");
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (
                file.type === "application/pdf" ||
                file.type === "application/msword" ||
                file.type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ) {
                if (file.size > 5 * 1024 * 1024) {
                    alert("File size cannot exceed 5MB");
                    return;
                }
                setResumeFile(file);
            } else {
                alert("Please upload only PDF or DOC/DOCX files");
            }
        }
    };

    const removeFile = () => {
        setResumeFile(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleContinue = () => {
        if (currentStep === 1 && !resumeFile) {
            alert("Please upload your resume first");
            return;
        }
        setCurrentStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep((prev) => prev - 1);
    };

    /* ✅ SUBMIT TO BACKEND */
    const handleSubmit = async () => {
        if (!resumeFile) {
            alert("Please upload your resume before submitting");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const form = new FormData();
            form.append("resume", resumeFile);
            form.append("jobId", jobId);
            form.append("jobTitle", formData.jobTitle);
            form.append("company", formData.company);

            const res = await fetch(
                "http://localhost:5000/api/student/jobs/apply",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: form,
                }
            );

            const data = await res.json();

            if (data.success) {
                setIsSubmitted(true);
                console.log("Application submitted:", data.data);
            } else {
                alert(data.message || "Failed to submit application");
            }
        } catch (err) {
            console.error("Error submitting application:", err);
            alert("Something went wrong. Please try again later.");
        }
    };


    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {!isSubmitted ? (
                    <>
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Apply for Position
                            </h1>
                            <p className="text-gray-600">
                                Complete the application in a few simple steps
                            </p>
                        </div>

                        {/* Progress Steps */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between max-w-md mx-auto">
                                {/* Step 1 */}
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep >= 1
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-400"
                                            }`}
                                    >
                                        {currentStep > 1 ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            "1"
                                        )}
                                    </div>
                                    <span className="text-xs mt-2 text-gray-600 font-medium">
                                        Resume
                                    </span>
                                </div>

                                {/* Connector */}
                                <div
                                    className={`flex-1 h-1 mx-2 transition-all ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
                                        }`}
                                ></div>

                                {/* Step 2 */}
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep >= 2
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-400"
                                            }`}
                                    >
                                        {currentStep > 2 ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            "2"
                                        )}
                                    </div>
                                    <span className="text-xs mt-2 text-gray-600 font-medium">
                                        Details
                                    </span>
                                </div>

                                {/* Connector */}
                                <div
                                    className={`flex-1 h-1 mx-2 transition-all ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"
                                        }`}
                                ></div>

                                {/* Step 3 */}
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep >= 3
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-400"
                                            }`}
                                    >
                                        3
                                    </div>
                                    <span className="text-xs mt-2 text-gray-600 font-medium">
                                        Review
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Main Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            {/* STEP 1: Resume Upload */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            Upload your resume
                                        </h2>
                                        <p className="text-gray-600">
                                            Upload or drag and drop your resume file
                                            (PDF, DOC, DOCX)
                                        </p>
                                    </div>

                                    {!resumeFile ? (
                                        <div
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${dragActive
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                                                }`}
                                        >
                                            <Upload className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                Drop your resume here
                                            </h3>
                                            <p className="text-gray-600 mb-4">
                                                or click to browse
                                            </p>
                                            <label
                                                htmlFor="resume-upload"
                                                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
                                            >
                                                Choose File
                                            </label>
                                            <input
                                                id="resume-upload"
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <p className="text-xs text-gray-500 mt-4">
                                                Supported formats: PDF, DOC, DOCX (Max 5MB)
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <FileText className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">
                                                            {resumeFile.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {formatFileSize(resumeFile.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={removeFile}
                                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                                >
                                                    <X className="w-5 h-5 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 2: Job Details */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            Enter a job that shows relevant experience
                                        </h2>
                                        <p className="text-gray-600">
                                            We share one job title with the employer to
                                            introduce you as a candidate (Optional)
                                        </p>
                                    </div>

                                    <div className="space-y-5">
                                        {/* Job Title */}
                                        <div>
                                            <label
                                                htmlFor="jobTitle"
                                                className="block text-sm font-semibold text-gray-700 mb-2"
                                            >
                                                Job Title
                                            </label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    id="jobTitle"
                                                    name="jobTitle"
                                                    value={formData.jobTitle}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., Frontend Developer"
                                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Company */}
                                        <div>
                                            <label
                                                htmlFor="company"
                                                className="block text-sm font-semibold text-gray-700 mb-2"
                                            >
                                                Company
                                            </label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    id="company"
                                                    name="company"
                                                    value={formData.company}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., Tech Solutions Inc."
                                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Review */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            Review your application
                                        </h2>
                                        <p className="text-gray-600">
                                            Please review all the information before
                                            submitting
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* ✅ NEW: Student Info Section */}
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Briefcase className="w-5 h-5 text-blue-600" />
                                                Your Information
                                            </h3>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-gray-600">Name: </span>
                                                    <span className="font-medium text-gray-900">
                                                        {studentInfo.name || "Loading..."}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Email: </span>
                                                    <span className="font-medium text-gray-900">
                                                        {studentInfo.email || "Loading..."}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Resume Section */}
                                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                                Resume
                                            </h3>
                                            {resumeFile && (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <FileText className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {resumeFile.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {formatFileSize(resumeFile.size)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={URL.createObjectURL(resumeFile)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline"
                                                    >
                                                        View
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {/* Job Details Section - Only show if filled */}
                                        {(formData.jobTitle || formData.company) && (
                                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                                    Relevant Experience
                                                </h3>
                                                <div className="space-y-3">
                                                    {formData.jobTitle && (
                                                        <div>
                                                            <p className="text-sm text-gray-600">
                                                                Job Title
                                                            </p>
                                                            <p className="font-medium text-gray-900">
                                                                {formData.jobTitle}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {formData.company && (
                                                        <div>
                                                            <p className="text-sm text-gray-600">
                                                                Company
                                                            </p>
                                                            <p className="font-medium text-gray-900">
                                                                {formData.company}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Terms */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <p className="text-sm text-blue-900">
                                            By submitting your application, you agree to our{" "}
                                            <a href="#" className="underline font-semibold">
                                                Terms of Service
                                            </a>{" "}
                                            and{" "}
                                            <a href="#" className="underline font-semibold">
                                                Privacy Policy
                                            </a>
                                            .
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={handleBack}
                                    disabled={currentStep === 1}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${currentStep === 1
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Back
                                </button>

                                {currentStep < 3 ? (
                                    <button
                                        onClick={handleContinue}
                                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                                    >
                                        Continue
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/30"
                                    >
                                        <Check className="w-5 h-5" />
                                        Submit Application
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Helper Text */}
                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-500">
                                Need help?{" "}
                                <a
                                    href="#"
                                    className="text-blue-600 hover:underline font-semibold"
                                >
                                    Contact Support
                                </a>
                            </p>
                        </div>
                    </>
                ) : (
                    /* SUCCESS SCREEN */
                    <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center">
                        <div className="max-w-md mx-auto">
                            {/* Success Icon */}
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-green-600" />
                            </div>

                            {/* Success Message */}
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">
                                Your application has been submitted!
                            </h2>
                            <p className="text-gray-600 mb-8">
                                Thank you for applying! We've received your
                                application and will review it shortly. You'll hear
                                from us soon.
                            </p>

                            {/* Application Summary */}
                            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                                <h3 className="font-semibold text-gray-900 mb-4">
                                    Application Summary
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-gray-600">Name: </span>
                                        <span className="font-medium text-gray-900">
                                            {studentInfo.name}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Email: </span>
                                        <span className="font-medium text-gray-900">
                                            {studentInfo.email}
                                        </span>
                                    </div>
                                    {formData.jobTitle && (
                                        <div>
                                            <span className="text-gray-600">Job Title: </span>
                                            <span className="font-medium text-gray-900">
                                                {formData.jobTitle}
                                            </span>
                                        </div>
                                    )}
                                    {formData.company && (
                                        <div>
                                            <span className="text-gray-600">Company: </span>
                                            <span className="font-medium text-gray-900">
                                                {formData.company}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-600">Resume: </span>
                                        <span className="font-medium text-gray-900">
                                            {resumeFile?.name}
                                        </span>
                                        {resumeFile && (
                                            <>
                                                {" - "}
                                                <a
                                                    href={URL.createObjectURL(resumeFile)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline"
                                                >
                                                    View
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center">
                                <button
                                    onClick={() =>
                                        (window.location.href = "/jobs")
                                    }
                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                                >
                                    Browse More Jobs
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}