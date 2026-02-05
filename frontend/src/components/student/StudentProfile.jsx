import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { STATES_AND_CITIES, SKILL_OPTIONS, CERTIFICATIONS } from "../data/statesAndCities";

import { 
    ProfileHeader, 
    SectionCard, 
    FormContainer, 
    ItemCard,
    EmptyState, 
    LoadingSpinner,
    QuickInfoCard 
} from "../customreuse";

const API_URL = import.meta.env.VITE_API_URL;

const DEGREE_OPTIONS = [
    "B.Tech", "M.Tech", "B.E.", "M.E.", "BSc", "MSc", "BCA", "MCA",
    "BA", "MA", "BBA", "MBA", "B.Com", "M.Com", "LLB", "LLM",
    "MBBS", "MD", "BDS", "MDS", "B.Pharm", "M.Pharm", "PhD",
    "Diploma", "High School", "Other"
];

// Helper function to format dates
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
};

export default function StudentProfile() {
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState("Your profile");
    const [userId, setUserId] = useState(null);
    const [profile, setProfile] = useState({ 
        state: "", city: "", dob: "", phone: "", bio: "", profile_image_url: "", banner_image_url: "", headline: ""
    });
    const [education, setEducation] = useState([]);
    const [experience, setExperience] = useState([]);
    const [skills, setSkills] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEducationForm, setShowEducationForm] = useState(false);
    const [showExperienceForm, setShowExperienceForm] = useState(false);
    const [showSkillForm, setShowSkillForm] = useState(false);
    const [showCertificationForm, setShowCertificationForm] = useState(false);
    const [customSkillMode, setCustomSkillMode] = useState(false);
    const [selectedProfileImage, setSelectedProfileImage] = useState(null);
    const [selectedBannerImage, setSelectedBannerImage] = useState(null);
    const [mediaUploading, setMediaUploading] = useState(false);
    const [showEditMenu, setShowEditMenu] = useState(false);
    const [editingIntro, setEditingIntro] = useState(false);
    const [editingAbout, setEditingAbout] = useState(false);
    
    // Loading states for preventing duplicate submissions
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingEducation, setSavingEducation] = useState(false);
    const [savingExperience, setSavingExperience] = useState(false);
    const [savingSkill, setSavingSkill] = useState(false);
    const [savingCertification, setSavingCertification] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);
    const [uploadingImage, setUploadingImage] = useState({ profile: false, banner: false });

    const [educationForm, setEducationForm] = useState({
        degree: "", field_of_study: "", institution: "", start_year: "", end_year: "", is_current: false
    });
    const [experienceForm, setExperienceForm] = useState({
        title: "", company: "", start_date: "", end_date: "", is_current: false, description: ""
    });
    const [skillForm, setSkillForm] = useState({ skill_name: "" });
    const [certificationForm, setCertificationForm] = useState({
        name: "", issuing_organization: "", issue_date: "", expiry_date: "", credential_id: "", credential_url: ""
    });

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/student`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                const p = data.profile || {};
                setUserId(data.id);
                setProfile({
                    state: p.state || "", city: p.city || "", dob: p.dob ? p.dob.substring(0, 10) : "",
                    phone: p.phone || "", bio: p.bio || "", profile_image_url: p.profile_image_url || "",
                    banner_image_url: p.banner_image_url || "", headline: p.headline || ""
                });
                setDisplayName(data.full_name || "Your profile");
                setEducation(data.education || []);
                setExperience(data.experience || []);
                setSkills(data.skills || []);
                setCertifications(data.certifications || []);
            }
        } catch (err) {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const apiCall = async (url, method, body) => {
        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: body ? JSON.stringify(body) : undefined,
            });
            return { ok: res.ok, data: await res.json() };
        } catch (err) {
            return { ok: false };
        }
    };

    const updateProfile = async () => {
        if (savingProfile) return; // Prevent duplicate submissions
        setSavingProfile(true);
        try {
            const { ok } = await apiCall(`${API_URL}/student`, "PUT", profile);
            if (ok) {
                toast.success("Profile updated successfully!");
                setEditingIntro(false);
                setEditingAbout(false);
                fetchProfile();
            } else {
                toast.error("Failed to update");
            }
        } finally {
            setSavingProfile(false);
        }
    };

    const addEducation = async (e) => {
        e.preventDefault();
        if (savingEducation) return; // Prevent duplicate submissions
        setSavingEducation(true);
        try {
            const { ok } = await apiCall(`${API_URL}/student/education`, "POST", educationForm);
            if (ok) {
                toast.success("Education added");
                setShowEducationForm(false);
                setEducationForm({ degree: "", field_of_study: "", institution: "", start_year: "", end_year: "", is_current: false });
                fetchProfile();
            } else toast.error("Failed to add education");
        } finally {
            setSavingEducation(false);
        }
    };

    const deleteEducation = async (id) => {
        if (deletingItem === `edu-${id}`) return; // Prevent duplicate deletions
        setDeletingItem(`edu-${id}`);
        try {
            const { ok } = await apiCall(`${API_URL}/student/education/${id}`, "DELETE");
            if (ok) { toast.success("Deleted"); fetchProfile(); }
        } finally {
            setDeletingItem(null);
        }
    };

    const addExperience = async (e) => {
        e.preventDefault();
        if (savingExperience) return; // Prevent duplicate submissions
        setSavingExperience(true);
        try {
            const { ok } = await apiCall(`${API_URL}/student/experience`, "POST", experienceForm);
            if (ok) {
                toast.success("Experience added");
                setShowExperienceForm(false);
                setExperienceForm({ title: "", company: "", start_date: "", end_date: "", is_current: false, description: "" });
                fetchProfile();
            } else toast.error("Failed to add experience");
        } finally {
            setSavingExperience(false);
        }
    };

    const deleteExperience = async (id) => {
        if (deletingItem === `exp-${id}`) return; // Prevent duplicate deletions
        setDeletingItem(`exp-${id}`);
        try {
            const { ok } = await apiCall(`${API_URL}/student/experience/${id}`, "DELETE");
            if (ok) { toast.success("Deleted"); fetchProfile(); }
        } finally {
            setDeletingItem(null);
        }
    };

    const handleSkillSelect = (value) => {
        if (value === "Other") {
            setCustomSkillMode(true);
            setSkillForm({ skill_name: "" });
        } else {
            setCustomSkillMode(false);
            setSkillForm({ skill_name: value });
        }
    };

    const addSkill = async (e) => {
        e.preventDefault();
        if (savingSkill) return; // Prevent duplicate submissions
        setSavingSkill(true);
        try {
            const { ok } = await apiCall(`${API_URL}/student/skills`, "POST", skillForm);
            if (ok) {
                toast.success("Skill added");
                setShowSkillForm(false);
                setSkillForm({ skill_name: "" });
                setCustomSkillMode(false);
                fetchProfile();
            } else toast.error("Failed to add skill");
        } finally {
            setSavingSkill(false);
        }
    };

    const deleteSkill = async (skill_id) => {
        if (deletingItem === `skill-${skill_id}`) return; // Prevent duplicate deletions
        setDeletingItem(`skill-${skill_id}`);
        try {
            const { ok } = await apiCall(`${API_URL}/student/skills/${skill_id}`, "DELETE");
            if (ok) { toast.success("Deleted"); fetchProfile(); }
        } finally {
            setDeletingItem(null);
        }
    };

    const addCertification = async (e) => {
        e.preventDefault();
        if (savingCertification) return; // Prevent duplicate submissions
        setSavingCertification(true);
        try {
            const { ok } = await apiCall(`${API_URL}/student/certifications`, "POST", certificationForm);
            if (ok) {
                toast.success("Certification added");
                setShowCertificationForm(false);
                setCertificationForm({ name: "", issuing_organization: "", issue_date: "", expiry_date: "", credential_id: "", credential_url: "" });
                fetchProfile();
            } else toast.error("Failed to add certification");
        } finally {
            setSavingCertification(false);
        }
    };

    const deleteCertification = async (id) => {
        if (deletingItem === `cert-${id}`) return; // Prevent duplicate deletions
        setDeletingItem(`cert-${id}`);
        try {
            const { ok } = await apiCall(`${API_URL}/student/certifications/${id}`, "DELETE");
            if (ok) { toast.success("Deleted"); fetchProfile(); }
        } finally {
            setDeletingItem(null);
        }
    };

    const handleImageUpload = async (file, type) => {
        if (!file) return;
        const imageType = type === 'profile' ? 'profile' : 'banner';
        if (uploadingImage[imageType]) return; // Prevent duplicate uploads
        
        setUploadingImage(prev => ({ ...prev, [imageType]: true }));
        try {
            const formData = new FormData();
            formData.append(type === 'profile' ? 'profileImage' : 'bannerImage', file);
            const res = await fetch(`${API_URL}/student/media`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`${type === 'profile' ? 'Profile picture' : 'Banner'} updated`);
                setProfile(prev => ({
                    ...prev,
                    [type === 'profile' ? 'profile_image_url' : 'banner_image_url']: 
                        data[type === 'profile' ? 'profile_image_url' : 'banner_image_url'] + '?t=' + Date.now()
                }));
                setShowEditMenu(false);
            } else {
                toast.error(data.message || "Failed to upload");
            }
        } catch (err) {
            toast.error("Failed to upload");
        } finally {
            setUploadingImage(prev => ({ ...prev, [imageType]: false }));
        }
    };

    const clearImages = async () => {
        try {
            const res = await fetch(`${API_URL}/student/media/clear`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setProfile(prev => ({ ...prev, profile_image_url: "", banner_image_url: "" }));
                toast.success("Images cleared");
                setShowEditMenu(false);
            } else {
                toast.error("Failed to clear images");
            }
        } catch (err) {
            toast.error("Failed to clear images");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
            </div>
        </div>
    );

    const bannerStyle = profile.banner_image_url
        ? { backgroundImage: `url(${API_URL}${profile.banner_image_url})`, backgroundSize: "contain",backgroundRepeat: "no-repeat", backgroundPosition: "center" }
        : {};

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Top Section - Header and Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Left Column - Profile Header */}
                    <div className="lg:col-span-2">
                        {/* HEADER with ProfileHeader component */}
                        <ProfileHeader
                            profile={profile}
                            displayName={displayName}
                            API_URL={API_URL}
                            showEditMenu={showEditMenu}
                            setShowEditMenu={setShowEditMenu}
                            handleImageUpload={handleImageUpload}
                            clearImages={clearImages}
                            setEditingIntro={setEditingIntro}
                            uploadingImage={uploadingImage}
                        >
                            <p className="text-base text-gray-600 mt-2">{profile.headline || "Add a headline to describe yourself"}</p>
                            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{profile.city && profile.state ? `${profile.city}, ${profile.state}` : "Add your location"}</span>
                            </div>
                        </ProfileHeader>
                    </div>

                    {/* Right Column - Info Cards */}
                    <div className="space-y-6">
                        {/* Profile Language Card */}
                        <SectionCard title="Profile language">
                            <p className="text-sm text-gray-700">English</p>
                        </SectionCard>

                        {/* Public Profile URL Card */}
                        <SectionCard title="Public profile & URL">
                            {userId ? (
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600 break-all">
                                        {window.location.origin}/student/{userId}
                                    </p>
                                    <button
                                        onClick={() => window.open(`/student/${userId}`, '_blank')}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        View Public Profile →
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">Loading...</p>
                            )}
                        </SectionCard>
                    </div>
                </div>

                {/* Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
                {/* Edit Intro Form */}
                {editingIntro && (
                    <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-lg mb-4 text-gray-900">Edit Intro</h3>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Headline</Label>
                                <Input
                                    value={profile.headline}
                                    onChange={(e) => setProfile({...profile, headline: e.target.value})}
                                    placeholder="e.g., Student at University | Aspiring Developer"
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                                <Input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                    placeholder="e.g., +91 9876543210"
                                    className="mt-1.5"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">State</Label>
                                    <select
                                        value={profile.state} 
                                        onChange={(e) => setProfile({...profile, state: e.target.value, city: ""})}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select state</option>
                                        {Object.keys(STATES_AND_CITIES).map((state) => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">City</Label>
                                    <select
                                        value={profile.city} 
                                        onChange={(e) => setProfile({...profile, city: e.target.value})}
                                        disabled={!profile.state}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5 disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select city</option>
                                        {profile.state && STATES_AND_CITIES[profile.state]?.map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    onClick={() => setEditingIntro(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={updateProfile}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                        {/* About Section */}
                        <SectionCard
                            title="About"
                            onAdd={() => setEditingAbout(!editingAbout)}
                            addLabel="Edit"
                        >
                            {editingAbout ? (
                                <div className="space-y-4">
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-3 min-h-[150px] focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        value={profile.bio}
                                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                        placeholder="Write about yourself, your interests, and your goals..."
                                    />
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            onClick={() => setEditingAbout(false)}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                                            disabled={savingProfile}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={updateProfile}
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            disabled={savingProfile}
                                        >
                                            {savingProfile && (
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {savingProfile ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {profile.bio || "Add information about yourself to help others understand your background and interests."}
                                </p>
                            )}
                        </SectionCard>

                        {/* Experience Section */}
                        <SectionCard
                            title="Experience"
                            onAdd={() => setShowExperienceForm(!showExperienceForm)}
                            addLabel="Add"
                        >
                            {showExperienceForm && (
                                <FormContainer onSubmit={addExperience}>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Title *</Label>
                                        <Input
                                            required
                                            value={experienceForm.title}
                                            onChange={(e) => setExperienceForm({...experienceForm, title: e.target.value})}
                                            placeholder="Ex: Software Engineer Intern"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Company *</Label>
                                        <Input
                                            required
                                            value={experienceForm.company}
                                            onChange={(e) => setExperienceForm({...experienceForm, company: e.target.value})}
                                            placeholder="Ex: Google"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                                            <Input
                                                type="date"
                                                value={experienceForm.start_date}
                                                onChange={(e) => setExperienceForm({...experienceForm, start_date: e.target.value})}
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">End Date</Label>
                                            <Input
                                                type="date"
                                                value={experienceForm.end_date}
                                                onChange={(e) => setExperienceForm({...experienceForm, end_date: e.target.value})}
                                                disabled={experienceForm.is_current}
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={experienceForm.is_current}
                                            onChange={(e) => setExperienceForm({...experienceForm, is_current: e.target.checked})}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        I currently work here
                                    </label>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                                        <textarea
                                            className="w-full border border-gray-300 rounded-lg p-3 mt-1.5 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            value={experienceForm.description}
                                            onChange={(e) => setExperienceForm({...experienceForm, description: e.target.value})}
                                            placeholder="Describe your responsibilities and achievements"
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowExperienceForm(false)}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                                            disabled={savingExperience}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            disabled={savingExperience}
                                        >
                                            {savingExperience && (
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {savingExperience ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </FormContainer>
                            )}

                            {experience.length === 0 && !showExperienceForm ? (
                                <EmptyState message="No experience added yet" />
                            ) : (
                                <div className="space-y-2">
                                    {experience.map((exp) => (
                                        <ItemCard
                                            key={exp.id}
                                            colorScheme="blue"
                                            icon={
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            }
                                            title={exp.title}
                                            subtitle={exp.company}
                                            period={`${formatDate(exp.start_date)} - ${exp.is_current ? "Present" : formatDate(exp.end_date)}`}
                                            description={exp.description}
                                            onDelete={() => deleteExperience(exp.id)}
                                            isDeleting={deletingItem === `exp-${exp.id}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* Education Section */}
                        <SectionCard
                            title="Education"
                            onAdd={() => setShowEducationForm(!showEducationForm)}
                            addLabel="Add"
                        >
                            {showEducationForm && (
                                <FormContainer onSubmit={addEducation}>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Degree *</Label>
                                        <select
                                            required
                                            value={educationForm.degree}
                                            onChange={(e) => setEducationForm({...educationForm, degree: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select degree</option>
                                            {DEGREE_OPTIONS.map((degree) => (
                                                <option key={degree} value={degree}>{degree}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Field of Study</Label>
                                        <Input
                                            value={educationForm.field_of_study}
                                            onChange={(e) => setEducationForm({...educationForm, field_of_study: e.target.value})}
                                            placeholder="Ex: Computer Science"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">School *</Label>
                                        <Input
                                            required
                                            value={educationForm.institution}
                                            onChange={(e) => setEducationForm({...educationForm, institution: e.target.value})}
                                            placeholder="Ex: Harvard University"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Start Year</Label>
                                            <Input
                                                type="number"
                                                value={educationForm.start_year}
                                                onChange={(e) => setEducationForm({...educationForm, start_year: e.target.value})}
                                                placeholder="2020"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">End Year</Label>
                                            <Input
                                                type="number"
                                                value={educationForm.end_year}
                                                onChange={(e) => setEducationForm({...educationForm, end_year: e.target.value})}
                                                placeholder="2024"
                                                disabled={educationForm.is_current}
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={educationForm.is_current}
                                            onChange={(e) => setEducationForm({...educationForm, is_current: e.target.checked})}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        I currently study here
                                    </label>
                                    <div className="flex gap-3 justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowEducationForm(false)}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                                            disabled={savingEducation}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            disabled={savingEducation}
                                        >
                                            {savingEducation && (
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {savingEducation ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </FormContainer>
                            )}

                            {education.length === 0 && !showEducationForm ? (
                                <EmptyState message="No education added yet" />
                            ) : (
                                <div className="space-y-2">
                                    {education.map((edu) => (
                                        <ItemCard
                                            key={edu.id}
                                            colorScheme="purple"
                                            icon={
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                                </svg>
                                            }
                                            title={edu.institution}
                                            subtitle={`${edu.degree}${edu.field_of_study ? `, ${edu.field_of_study}` : ''}`}
                                            period={`${edu.start_year} - ${edu.is_current ? "Present" : edu.end_year}`}
                                            onDelete={() => deleteEducation(edu.id)}
                                            isDeleting={deletingItem === `edu-${edu.id}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* Skills Section */}
                        <SectionCard
                            title="Skills"
                            onAdd={() => setShowSkillForm(!showSkillForm)}
                            addLabel="Add"
                        >
                            {showSkillForm && (
                                <FormContainer onSubmit={addSkill}>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <select
                                            value={customSkillMode ? "Other" : skillForm.skill_name}
                                            onChange={(e) => handleSkillSelect(e.target.value)}
                                            className="flex-1 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required={!customSkillMode}
                                        >
                                            <option value="">Select skill</option>
                                            {SKILL_OPTIONS.map((skill) => (
                                                <option key={skill} value={skill}>{skill}</option>
                                            ))}
                                        </select>
                                        {customSkillMode && (
                                            <Input
                                                required
                                                value={skillForm.skill_name}
                                                onChange={(e) => setSkillForm({skill_name: e.target.value})}
                                                placeholder="Enter skill name"
                                                className="flex-1"
                                            />
                                        )}
                                    </div>
                                    <div className="flex gap-3 justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowSkillForm(false);
                                                setCustomSkillMode(false);
                                            }}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                                            disabled={savingSkill}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            disabled={savingSkill}
                                        >
                                            {savingSkill && (
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {savingSkill ? 'Adding...' : 'Add skill'}
                                        </button>
                                    </div>
                                </FormContainer>
                            )}

                            {skills.length === 0 && !showSkillForm ? (
                                <EmptyState message="No skills added yet" />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <div
                                            key={skill.id}
                                            className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-blue-100 transition-colors group"
                                        >
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                            <span className="text-sm font-medium text-blue-900">{skill.skill_name}</span>
                                            <button
                                                onClick={() => deleteSkill(skill.id)}
                                                className="text-blue-700 hover:text-blue-900 opacity-70 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                                disabled={deletingItem === `skill-${skill.id}`}
                                            >
                                                {deletingItem === `skill-${skill.id}` ? (
                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* Certifications Section */}
                        <SectionCard
                            title="Licenses & Certifications"
                            onAdd={() => setShowCertificationForm(!showCertificationForm)}
                            addLabel="Add"
                        >
                            {showCertificationForm && (
                                <FormContainer onSubmit={addCertification}>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Name *</Label>
                                        <select
                                            required
                                            value={certificationForm.name}
                                            onChange={(e) => setCertificationForm({...certificationForm, name: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select certification</option>
                                            {CERTIFICATIONS.map((cert) => (
                                                <option key={cert} value={cert}>{cert}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Issuing Organization</Label>
                                        <Input
                                            value={certificationForm.issuing_organization}
                                            onChange={(e) => setCertificationForm({...certificationForm, issuing_organization: e.target.value})}
                                            placeholder="Ex: Amazon Web Services"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Issue Date</Label>
                                            <Input
                                                type="date"
                                                value={certificationForm.issue_date}
                                                onChange={(e) => setCertificationForm({...certificationForm, issue_date: e.target.value})}
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Expiry Date</Label>
                                            <Input
                                                type="date"
                                                value={certificationForm.expiry_date}
                                                onChange={(e) => setCertificationForm({...certificationForm, expiry_date: e.target.value})}
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Credential ID</Label>
                                        <Input
                                            value={certificationForm.credential_id}
                                            onChange={(e) => setCertificationForm({...certificationForm, credential_id: e.target.value})}
                                            placeholder="Optional"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Credential URL</Label>
                                        <Input
                                            value={certificationForm.credential_url}
                                            onChange={(e) => setCertificationForm({...certificationForm, credential_url: e.target.value})}
                                            placeholder="Optional"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowCertificationForm(false)}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                                            disabled={savingCertification}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            disabled={savingCertification}
                                        >
                                            {savingCertification && (
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {savingCertification ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </FormContainer>
                            )}

                            {certifications.length === 0 && !showCertificationForm ? (
                                <EmptyState message="No certifications added yet" />
                            ) : (
                                <div className="space-y-2">
                                    {certifications.map((cert) => (
                                        <ItemCard
                                            key={cert.id}
                                            colorScheme="green"
                                            icon={
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                </svg>
                                            }
                                            title={cert.name}
                                            subtitle={cert.issuing_organization}
                                            period={`Issued ${formatDate(cert.issue_date)}${cert.expiry_date ? ` � Expires ${formatDate(cert.expiry_date)}` : ''}`}
                                            description={cert.credential_id ? `Credential ID: ${cert.credential_id}` : null}
                                            link={cert.credential_url ? { url: cert.credential_url, text: "Show credential" } : null}
                                            onDelete={() => deleteCertification(cert.id)}
                                            isDeleting={deletingItem === `cert-${cert.id}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Additional sections can go here */}
                    </div>
                </div>
            </div>
        </div>
    );
}
