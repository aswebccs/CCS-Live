import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { STATES_AND_CITIES } from "../data/statesAndCities";
import { 
    ProfileHeader, 
    SectionCard, 
    FormContainer, 
    EmptyState, 
    LoadingSpinner 
} from "../customreuse";
import { ItemCard } from "../customreuse/ItemCard";

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

// Helper component for displaying information
function InfoItem({ label, value, icon }) {
    const renderValue = () => {
        if (!value) return <span className="text-gray-400">Not specified</span>;
        
        if (icon === 'email') {
            return (
                <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    {value}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            );
        }
        
        if (icon === 'phone') {
            return (
                <a href={`tel:${value}`} className="text-blue-600 hover:text-blue-700">
                    {value}
                </a>
            );
        }
        
        if (icon === 'link') {
            return (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    {value}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            );
        }
        
        return <span className="text-gray-900 font-medium">{value}</span>;
    };

    return (
        <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</span>
            {renderValue()}
        </div>
    );
}

// Helper component for sidebar info display
function InfoDisplay({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm text-gray-900 font-medium break-words">{value}</p>
            </div>
        </div>
    );
}

export default function SchoolProfile() {
    const token = localStorage.getItem("token");
    const [loading, setLoading] = useState(true);
    const [displayName, setDisplayName] = useState("Your School");
    const [showEditMenu, setShowEditMenu] = useState(false);

    // Loading states
    const [savingSchool, setSavingSchool] = useState(false);
    const [uploadingImage, setUploadingImage] = useState({ profile: false, banner: false });
    const [addingFacility, setAddingFacility] = useState(false);
    const [addingProgram, setAddingProgram] = useState(false);
    const [addingAchievement, setAddingAchievement] = useState(false);
    const [addingResult, setAddingResult] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);

    // Edit modes
    const [editingSchool, setEditingSchool] = useState(false);
    const [originalSchool, setOriginalSchool] = useState({});

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
                    setOriginalSchool(data.school);
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

    const startEditingSchool = () => {
        setOriginalSchool({ ...school });
        setEditingSchool(true);
    };

    const cancelEditSchool = () => {
        setSchool(originalSchool);
        setEditingSchool(false);
    };

    const updateSchool = async () => {
        if (savingSchool) return;
        
        setSavingSchool(true);
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
                const data = await res.json();
                toast.success("School information updated!");
                setSchool(data.school || school);
                setOriginalSchool(data.school || school);
                setDisplayName(data.school?.name || school.name || "Your School");
                setEditingSchool(false);
            } else {
                toast.error("Failed to update");
            }
        } catch (err) {
            toast.error("Failed to update");
        } finally {
            setSavingSchool(false);
        }
    };

    const handleImageUpload = async (file, type) => {
        if (!file) return;
        
        setUploadingImage(prev => ({ ...prev, [type]: true }));
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
            setUploadingImage(prev => ({ ...prev, [type]: false }));
        }
    };

    const clearImages = async () => {
        toast.info("Clear images functionality needs to be implemented");
        setShowEditMenu(false);
    };

    const addFacility = async (e) => {
        e.preventDefault();
        if (addingFacility) return;
        
        setAddingFacility(true);
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
        } finally {
            setAddingFacility(false);
        }
    };

    const deleteFacility = async (id) => {
        if (deletingItem) return;
        
        setDeletingItem(id);
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
        } finally {
            setDeletingItem(null);
        }
    };

    const addProgram = async (e) => {
        e.preventDefault();
        if (addingProgram) return;
        
        setAddingProgram(true);
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
        } finally {
            setAddingProgram(false);
        }
    };

    const deleteProgram = async (id) => {
        if (deletingItem) return;
        
        setDeletingItem(id);
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
        } finally {
            setDeletingItem(null);
        }
    };

    const addAchievement = async (e) => {
        e.preventDefault();
        if (addingAchievement) return;
        
        setAddingAchievement(true);
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
        } finally {
            setAddingAchievement(false);
        }
    };

    const deleteAchievement = async (id) => {
        if (deletingItem) return;
        
        setDeletingItem(id);
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
        } finally {
            setDeletingItem(null);
        }
    };

    const addResult = async (e) => {
        e.preventDefault();
        if (addingResult) return;
        
        setAddingResult(true);
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
        } finally {
            setAddingResult(false);
        }
    };

    const deleteResult = async (id) => {
        if (deletingItem) return;
        
        setDeletingItem(id);
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
        } finally {
            setDeletingItem(null);
        }
    };

    if (loading) return <LoadingSpinner message="Loading school profile..." />;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN - MAIN CONTENT */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* HEADER with ProfileHeader component */}
                        <ProfileHeader
                            profile={school}
                            displayName={displayName}
                            API_URL={API_URL}
                            showEditMenu={showEditMenu}
                            setShowEditMenu={setShowEditMenu}
                            handleImageUpload={handleImageUpload}
                            clearImages={clearImages}
                            setEditingIntro={startEditingSchool}
                            uploadingImage={uploadingImage}
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

                        {/* SCHOOL INFORMATION SECTION */}
                        <SectionCard 
                            title="School Information" 
                            onAdd={editingSchool ? null : startEditingSchool}
                            addLabel="Edit"
                        >
                            {editingSchool ? (
                                <FormContainer>
                                    <div className="space-y-4">
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Student Strength</Label>
                                                <Input
                                                    type="number"
                                                    value={school.student_strength}
                                                    onChange={(e) => setSchool({ ...school, student_strength: e.target.value })}
                                                    placeholder="Total students"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label>Teacher Count</Label>
                                                <Input
                                                    type="number"
                                                    value={school.teacher_count}
                                                    onChange={(e) => setSchool({ ...school, teacher_count: e.target.value })}
                                                    placeholder="Total teachers"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Principal Name</Label>
                                            <Input
                                                value={school.principal_name}
                                                onChange={(e) => setSchool({ ...school, principal_name: e.target.value })}
                                                placeholder="Principal's name"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Principal Email</Label>
                                                <Input
                                                    type="email"
                                                    value={school.principal_email}
                                                    onChange={(e) => setSchool({ ...school, principal_email: e.target.value })}
                                                    placeholder="Principal's email"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label>Principal Phone</Label>
                                                <Input
                                                    value={school.principal_phone}
                                                    onChange={(e) => setSchool({ ...school, principal_phone: e.target.value })}
                                                    placeholder="Principal's phone"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 justify-end pt-2">
                                            <button
                                                onClick={cancelEditSchool}
                                                disabled={savingSchool}
                                                className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={updateSchool}
                                                disabled={savingSchool}
                                                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {savingSchool && (
                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                )}
                                                {savingSchool ? "Saving..." : "Save Changes"}
                                            </button>
                                        </div>
                                    </div>
                                </FormContainer>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                    <InfoItem label="Board" value={school.board} />
                                    <InfoItem label="School Type" value={school.school_type} />
                                    <InfoItem label="Established" value={school.established_year} />
                                    <InfoItem label="Grade Levels" value={school.grade_levels} />
                                    <InfoItem label="Location" value={school.city && school.state ? `${school.city}, ${school.state}` : null} />
                                    <InfoItem label="Phone" value={school.phone} icon="phone" />
                                    <InfoItem label="Email" value={school.email} icon="email" />
                                    <InfoItem label="Website" value={school.website_url} icon="link" />
                                    <InfoItem label="Student Strength" value={school.student_strength} />
                                    <InfoItem label="Teacher Count" value={school.teacher_count} />
                                    <InfoItem label="Principal" value={school.principal_name} />
                                    <InfoItem label="Principal Email" value={school.principal_email} icon="email" />
                                    <InfoItem label="Principal Phone" value={school.principal_phone} icon="phone" />
                                </div>
                            )}
                        </SectionCard>

                        {/* PROGRAMS SECTION */}
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
                                        <button 
                                            type="button" 
                                            onClick={() => setShowProgramForm(false)} 
                                            disabled={addingProgram}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={addingProgram}
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {addingProgram && (
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {addingProgram ? "Saving..." : "Save"}
                                        </button>
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
                                            isDeleting={deletingItem === prog.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* ACHIEVEMENTS SECTION */}
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
                                        <button 
                                            type="button" 
                                            onClick={() => setShowAchievementForm(false)} 
                                            disabled={addingAchievement}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={addingAchievement}
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {addingAchievement && (
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {addingAchievement ? "Saving..." : "Save"}
                                        </button>
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
                                            isDeleting={deletingItem === ach.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* RESULTS SECTION */}
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
                                        <button 
                                            type="button" 
                                            onClick={() => setShowResultForm(false)} 
                                            disabled={addingResult}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={addingResult}
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {addingResult && (
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {addingResult ? "Saving..." : "Save"}
                                        </button>
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
                                            isDeleting={deletingItem === res.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* FACILITIES SECTION */}
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
                                        <button 
                                            type="button" 
                                            onClick={() => setShowFacilityForm(false)} 
                                            disabled={addingFacility}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={addingFacility}
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {addingFacility && (
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {addingFacility ? "Adding..." : "Add"}
                                        </button>
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
                                                disabled={deletingItem === fac.id}
                                                className="text-blue-700 hover:text-blue-900 opacity-70 group-hover:opacity-100 disabled:opacity-50"
                                            >
                                                {deletingItem === fac.id ? (
                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
                    </div>

                    {/* RIGHT COLUMN - SIDEBAR */}
                    <div className="space-y-6">
                        <SectionCard title="Quick Info">
                            <div className="space-y-4">
                                <InfoDisplay 
                                    icon={
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    }
                                    label="Established"
                                    value={school.established_year || "Not specified"}
                                />
                                <InfoDisplay 
                                    icon={
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    }
                                    label="Students"
                                    value={school.student_strength || "Not specified"}
                                />
                                <InfoDisplay 
                                    icon={
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    }
                                    label="Teachers"
                                    value={school.teacher_count || "Not specified"}
                                />
                                {school.website_url && (
                                    <div className="pt-2 border-t">
                                        <a
                                            href={school.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                                        >
                                            Visit Website
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {school.principal_name && (
                            <SectionCard title="Principal">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-gray-900">{school.principal_name}</p>
                                    {school.principal_email && (
                                        <a href={`mailto:${school.principal_email}`} className="text-sm text-blue-600 hover:text-blue-700 block">
                                            {school.principal_email}
                                        </a>
                                    )}
                                    {school.principal_phone && (
                                        <a href={`tel:${school.principal_phone}`} className="text-sm text-blue-600 hover:text-blue-700 block">
                                            {school.principal_phone}
                                        </a>
                                    )}
                                </div>
                            </SectionCard>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
