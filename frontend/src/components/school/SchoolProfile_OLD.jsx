import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { STATES_AND_CITIES } from "../data/statesAndCities";
import { SectionCard } from "../customreuse/SectionCard";
import { ItemCard } from "../customreuse/ItemCard";
import { FormContainer } from "../customreuse/FormContainer";
import { EmptyState } from "../customreuse/EmptyState";
import { LoadingSpinner } from "../customreuse/LoadingSpinner";
import { ProfileHeader } from "../customreuse/ProfileHeader";

const API_URL = import.meta.env.VITE_API_URL;

const BOARD_OPTIONS = ["CBSE", "ICSE", "State Board", "IB (International Baccalaureate)", "IGCSE", "Other"];
const SCHOOL_TYPES = ["Public", "Private", "Charter", "International", "Montessori", "Other"];
const GRADE_LEVELS_OPTIONS = ["Pre-K to 5", "Pre-K to 8", "Pre-K to 12", "6 to 8", "6 to 10", "6 to 12", "9 to 12", "11 to 12", "Other"];
const FACILITY_OPTIONS = [
    "Library", "Computer Lab", "Science Lab", "Sports Ground", "Auditorium", "Cafeteria",
    "Swimming Pool", "Art Room", "Music Room", "Dance Studio", "Medical Room", "Transport"
];
const ACHIEVEMENT_TYPES = ["Academic", "Sports", "Cultural", "Science & Technology", "Social Service", "Other"];
const GRADE_LEVEL_RESULTS = ["10th Grade", "12th Grade", "8th Grade"];

export default function SchoolProfile() {
    const token = localStorage.getItem("token");
    const [loading, setLoading] = useState(true);
    const [displayName, setDisplayName] = useState("Your School");
    const [showEditMenu, setShowEditMenu] = useState(false);
    const [editingIntro, setEditingIntro] = useState(false);
    const [mediaUploading, setMediaUploading] = useState(false);

    const [school, setSchool] = useState({
        name: "", established_year: "", board: "", affiliation: "", school_type: "",
        grade_levels: "", state: "", city: "", zipcode: "", address: "", phone: "",
        email: "", website_url: "", principal_name: "", principal_email: "",
        principal_phone: "", student_strength: "", teacher_count: "", logo_url: "", banner_url: ""
    });

    const [facilities, setFacilities] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [results, setResults] = useState([]);

    const [showFacilityForm, setShowFacilityForm] = useState(false);
    const [showProgramForm, setShowProgramForm] = useState(false);
    const [showAchievementForm, setShowAchievementForm] = useState(false);
    const [showResultForm, setShowResultForm] = useState(false);

    const [facilityForm, setFacilityForm] = useState({ facility_name: "" });
    const [programForm, setProgramForm] = useState({ program_name: "", description: "" });
    const [achievementForm, setAchievementForm] = useState({
        title: "", description: "", year: "", achievement_type: ""
    });
    const [resultForm, setResultForm] = useState({
        academic_year: "", grade_level: "", pass_percentage: "",
        distinction_count: "", first_class_count: ""
    });

    useEffect(() => {
        fetchSchoolProfile();
    }, []);

    const fetchSchoolProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/school`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                if (data.school) {
                    setSchool(data.school);
                    setDisplayName(data.school.name || "Your School");
                }
                setFacilities(data.facilities || []);
                setPrograms(data.programs || []);
                setAchievements(data.achievements || []);
                setResults(data.results || []);
            }
        } catch (err) {
            toast.error("Failed to load school profile");
        } finally {
            setLoading(false);
        }
    };

    const updateSchool = async () => {
        try {
            const res = await fetch(`${API_URL}/school`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(school),
            });
            if (res.ok) {
                toast.success("School information updated!");
                setEditingIntro(false);
                fetchSchoolProfile();
            } else {
                toast.error("Failed to update");
            }
        } catch (err) {
            toast.error("Failed to update");
        }
    };

    const handleImageUpload = async (file, type) => {
        if (!file) return;
        setMediaUploading(true);
        try {
            const formData = new FormData();
            formData.append(type === 'profile' ? 'logoImage' : 'bannerImage', file);
            const res = await fetch(`${API_URL}/school/media`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`${type === 'profile' ? 'Logo' : 'Banner'} updated`);
                fetchSchoolProfile();
                setShowEditMenu(false);
            } else {
                toast.error(data.message || "Failed to upload");
            }
        } catch (err) {
            toast.error("Failed to upload");
        } finally {
            setMediaUploading(false);
        }
    };

    const clearImages = async () => {
        toast.info("Clear images functionality needs to be implemented");
        setShowEditMenu(false);
    };

    const addFacility = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/school/facilities`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(facilityForm),
            });
            if (res.ok) {
                toast.success("Facility added");
                setShowFacilityForm(false);
                setFacilityForm({ facility_name: "" });
                fetchSchoolProfile();
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to add facility");
            }
        } catch (err) {
            toast.error("Failed to add facility");
        }
    };

    const deleteFacility = async (id) => {
        try {
            const res = await fetch(`${API_URL}/school/facilities/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success("Facility deleted");
                fetchSchoolProfile();
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const addProgram = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/school/programs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(programForm),
            });
            if (res.ok) {
                toast.success("Program added");
                setShowProgramForm(false);
                setProgramForm({ program_name: "", description: "" });
                fetchSchoolProfile();
            } else {
                toast.error("Failed to add program");
            }
        } catch (err) {
            toast.error("Failed to add program");
        }
    };

    const deleteProgram = async (id) => {
        try {
            const res = await fetch(`${API_URL}/school/programs/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success("Program deleted");
                fetchSchoolProfile();
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const addAchievement = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/school/achievements`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(achievementForm),
            });
            if (res.ok) {
                toast.success("Achievement added");
                setShowAchievementForm(false);
                setAchievementForm({ title: "", description: "", year: "", achievement_type: "" });
                fetchSchoolProfile();
            } else {
                toast.error("Failed to add achievement");
            }
        } catch (err) {
            toast.error("Failed to add achievement");
        }
    };

    const deleteAchievement = async (id) => {
        try {
            const res = await fetch(`${API_URL}/school/achievements/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success("Achievement deleted");
                fetchSchoolProfile();
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const addResult = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/school/results`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(resultForm),
            });
            if (res.ok) {
                toast.success("Result added");
                setShowResultForm(false);
                setResultForm({
                    academic_year: "", grade_level: "", pass_percentage: "",
                    distinction_count: "", first_class_count: ""
                });
                fetchSchoolProfile();
            } else {
                toast.error("Failed to add result");
            }
        } catch (err) {
            toast.error("Failed to add result");
        }
    };

    const deleteResult = async (id) => {
        try {
            const res = await fetch(`${API_URL}/school/results/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success("Result deleted");
                fetchSchoolProfile();
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    if (loading) return <LoadingSpinner message="Loading school profile..." />;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Header */}
                        <ProfileHeader
                            profile={school}
                            displayName={displayName}
                            API_URL={API_URL}
                            showEditMenu={showEditMenu}
                            setShowEditMenu={setShowEditMenu}
                            handleImageUpload={handleImageUpload}
                            clearImages={clearImages}
                            setEditingIntro={setEditingIntro}
                        >
                            <p className="text-base text-gray-600 mt-2">
                                {school.board ? `${school.board} Affiliated` : "Educational Institution"}
                                {school.school_type && ` • ${school.school_type} School`}
                            </p>
                            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{school.city && school.state ? `${school.city}, ${school.state}` : "Add location"}</span>
                            </div>
                        </ProfileHeader>

                        {/* Edit Intro Form */}
                        {editingIntro && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="font-semibold text-lg mb-4 text-gray-900">Edit School Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label>School Name *</Label>
                                        <Input
                                            value={school.name}
                                            onChange={(e) => setSchool({ ...school, name: e.target.value })}
                                            placeholder="Enter school name"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Board</Label>
                                            <select
                                                value={school.board}
                                                onChange={(e) => setSchool({ ...school, board: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5"
                                            >
                                                <option value="">Select board</option>
                                                {BOARD_OPTIONS.map((board) => (
                                                    <option key={board} value={board}>{board}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <Label>School Type</Label>
                                            <select
                                                value={school.school_type}
                                                onChange={(e) => setSchool({ ...school, school_type: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5"
                                            >
                                                <option value="">Select type</option>
                                                {SCHOOL_TYPES.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Established Year</Label>
                                            <Input
                                                type="number"
                                                value={school.established_year}
                                                onChange={(e) => setSchool({ ...school, established_year: e.target.value })}
                                                placeholder="e.g., 2000"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Grade Levels</Label>
                                            <select
                                                value={school.grade_levels}
                                                onChange={(e) => setSchool({ ...school, grade_levels: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5"
                                            >
                                                <option value="">Select grade levels</option>
                                                {GRADE_LEVELS_OPTIONS.map((level) => (
                                                    <option key={level} value={level}>{level}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>State</Label>
                                            <select
                                                value={school.state}
                                                onChange={(e) => setSchool({ ...school, state: e.target.value, city: "" })}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5"
                                            >
                                                <option value="">Select state</option>
                                                {Object.keys(STATES_AND_CITIES).map((state) => (
                                                    <option key={state} value={state}>{state}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <Label>City</Label>
                                            <select
                                                value={school.city}
                                                onChange={(e) => setSchool({ ...school, city: e.target.value })}
                                                disabled={!school.state}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5 disabled:bg-gray-100"
                                            >
                                                <option value="">Select city</option>
                                                {school.state && STATES_AND_CITIES[school.state]?.map((city) => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Phone</Label>
                                            <Input
                                                value={school.phone}
                                                onChange={(e) => setSchool({ ...school, phone: e.target.value })}
                                                placeholder="School phone number"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                value={school.email}
                                                onChange={(e) => setSchool({ ...school, email: e.target.value })}
                                                placeholder="School email"
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Website URL</Label>
                                        <Input
                                            value={school.website_url}
                                            onChange={(e) => setSchool({ ...school, website_url: e.target.value })}
                                            placeholder="https://www.yourschool.edu"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end pt-2">
                                        <button
                                            onClick={() => setEditingIntro(false)}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={updateSchool}
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Programs Section - Continued in next part due to length */}
                        <SectionCard title="Programs & Activities" onAdd={() => setShowProgramForm(!showProgramForm)}>
                            {showProgramForm && (
                                <FormContainer onSubmit={addProgram}>
                                    <div>
                                        <Label>Program Name *</Label>
                                        <Input
                                            required
                                            value={programForm.program_name}
                                            onChange={(e) => setProgramForm({ ...programForm, program_name: e.target.value })}
                                            placeholder="e.g., Sports Program, Arts & Crafts"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div>
                                        <Label>Description</Label>
                                        <textarea
                                            className="w-full border border-gray-300 rounded-lg p-3 mt-1.5 min-h-[100px]"
                                            value={programForm.description}
                                            onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                                            placeholder="Describe the program"
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <button type="button" onClick={() => setShowProgramForm(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg">Cancel</button>
                                        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save</button>
                                    </div>
                                </FormContainer>
                            )}
                            {programs.length === 0 && !showProgramForm ? (
                                <EmptyState message="No programs added yet" />
                            ) : (
                                <div className="space-y-2">
                                    {programs.map((prog) => (
                                        <ItemCard
                                            key={prog.id}
                                            colorScheme="purple"
                                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                                            title={prog.program_name}
                                            description={prog.description}
                                            onDelete={() => deleteProgram(prog.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* Achievements Section */}
                        <SectionCard title="Achievements" onAdd={() => setShowAchievementForm(!showAchievementForm)}>
                            {showAchievementForm && (
                                <FormContainer onSubmit={addAchievement}>
                                    <div>
                                        <Label>Achievement Title *</Label>
                                        <Input
                                            required
                                            value={achievementForm.title}
                                            onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                                            placeholder="e.g., State Level Champions"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Year</Label>
                                            <Input
                                                type="number"
                                                value={achievementForm.year}
                                                onChange={(e) => setAchievementForm({ ...achievementForm, year: e.target.value })}
                                                placeholder="2024"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Type</Label>
                                            <select
                                                value={achievementForm.achievement_type}
                                                onChange={(e) => setAchievementForm({ ...achievementForm, achievement_type: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5"
                                            >
                                                <option value="">Select type</option>
                                                {ACHIEVEMENT_TYPES.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Description</Label>
                                        <textarea
                                            className="w-full border border-gray-300 rounded-lg p-3 mt-1.5 min-h-[100px]"
                                            value={achievementForm.description}
                                            onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                                            placeholder="Describe the achievement"
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <button type="button" onClick={() => setShowAchievementForm(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg">Cancel</button>
                                        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save</button>
                                    </div>
                                </FormContainer>
                            )}
                            {achievements.length === 0 && !showAchievementForm ? (
                                <EmptyState message="No achievements added yet" />
                            ) : (
                                <div className="space-y-2">
                                    {achievements.map((ach) => (
                                        <ItemCard
                                            key={ach.id}
                                            colorScheme="amber"
                                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                                            title={ach.title}
                                            subtitle={ach.achievement_type}
                                            period={ach.year ? `Year ${ach.year}` : null}
                                            description={ach.description}
                                            onDelete={() => deleteAchievement(ach.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* Results Section */}
                        <SectionCard title="Academic Results" onAdd={() => setShowResultForm(!showResultForm)}>
                            {showResultForm && (
                                <FormContainer onSubmit={addResult}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Academic Year *</Label>
                                            <Input
                                                required
                                                value={resultForm.academic_year}
                                                onChange={(e) => setResultForm({ ...resultForm, academic_year: e.target.value })}
                                                placeholder="e.g., 2023-24"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Grade Level *</Label>
                                            <select
                                                required
                                                value={resultForm.grade_level}
                                                onChange={(e) => setResultForm({ ...resultForm, grade_level: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5"
                                            >
                                                <option value="">Select grade</option>
                                                {GRADE_LEVEL_RESULTS.map((grade) => (
                                                    <option key={grade} value={grade}>{grade}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <Label>Pass %</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={resultForm.pass_percentage}
                                                onChange={(e) => setResultForm({ ...resultForm, pass_percentage: e.target.value })}
                                                placeholder="95.5"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Distinctions</Label>
                                            <Input
                                                type="number"
                                                value={resultForm.distinction_count}
                                                onChange={(e) => setResultForm({ ...resultForm, distinction_count: e.target.value })}
                                                placeholder="50"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>First Class</Label>
                                            <Input
                                                type="number"
                                                value={resultForm.first_class_count}
                                                onChange={(e) => setResultForm({ ...resultForm, first_class_count: e.target.value })}
                                                placeholder="80"
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <button type="button" onClick={() => setShowResultForm(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg">Cancel</button>
                                        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save</button>
                                    </div>
                                </FormContainer>
                            )}
                            {results.length === 0 && !showResultForm ? (
                                <EmptyState message="No results added yet" />
                            ) : (
                                <div className="space-y-2">
                                    {results.map((res) => (
                                        <ItemCard
                                            key={res.id}
                                            colorScheme="green"
                                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
                                            title={`${res.grade_level} Results - ${res.academic_year}`}
                                            description={`Pass Rate: ${res.pass_percentage}% • Distinctions: ${res.distinction_count || 0} • First Class: ${res.first_class_count || 0}`}
                                            onDelete={() => deleteResult(res.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* Facilities Section */}
                        <SectionCard title="Facilities" onAdd={() => setShowFacilityForm(!showFacilityForm)}>
                            {showFacilityForm && (
                                <FormContainer onSubmit={addFacility}>
                                    <div>
                                        <Label>Facility Name *</Label>
                                        <select
                                            required
                                            value={facilityForm.facility_name}
                                            onChange={(e) => setFacilityForm({ facility_name: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5"
                                        >
                                            <option value="">Select facility</option>
                                            {FACILITY_OPTIONS.map((fac) => (
                                                <option key={fac} value={fac}>{fac}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <button type="button" onClick={() => setShowFacilityForm(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg">Cancel</button>
                                        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Add</button>
                                    </div>
                                </FormContainer>
                            )}
                            {facilities.length === 0 && !showFacilityForm ? (
                                <EmptyState message="No facilities added yet" />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {facilities.map((fac) => (
                                        <div
                                            key={fac.id}
                                            className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-blue-100 transition-colors group"
                                        >
                                            <span className="text-sm font-medium text-blue-900">{fac.facility_name}</span>
                                            <button
                                                onClick={() => deleteFacility(fac.id)}
                                                className="text-blue-700 hover:text-blue-900 opacity-70 group-hover:opacity-100"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
                            <div className="space-y-3 text-sm">
                                {school.established_year && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Established</span>
                                        <span className="font-medium text-gray-900">{school.established_year}</span>
                                    </div>
                                )}
                                {school.student_strength && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Students</span>
                                        <span className="font-medium text-gray-900">{school.student_strength}</span>
                                    </div>
                                )}
                                {school.teacher_count && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Teachers</span>
                                        <span className="font-medium text-gray-900">{school.teacher_count}</span>
                                    </div>
                                )}
                                {school.website_url && (
                                    <div className="pt-2 border-t">
                                        <a
                                            href={school.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        >
                                            Visit Website
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Principal Info */}
                        {school.principal_name && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Principal</h3>
                                <p className="text-sm font-medium text-gray-900">{school.principal_name}</p>
                                {school.principal_email && (
                                    <p className="text-sm text-gray-600 mt-1">{school.principal_email}</p>
                                )}
                                {school.principal_phone && (
                                    <p className="text-sm text-gray-600 mt-1">{school.principal_phone}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
