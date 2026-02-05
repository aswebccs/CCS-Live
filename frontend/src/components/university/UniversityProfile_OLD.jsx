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

const UNIVERSITY_TYPES = ["Public", "Private", "Deemed", "Central", "State"];
const ACCREDITATIONS = ["NAAC A++", "NAAC A+", "NAAC A", "NAAC B++", "NAAC B+", "UGC Approved", "Other"];
const PROGRAM_LEVELS = ["Undergraduate", "Postgraduate", "Doctoral", "Diploma", "Certificate"];
const RANKING_BODIES = ["NIRF", "QS World Rankings", "THE World Rankings", "Academic Ranking", "Other"];

const FACILITY_OPTIONS = [
    "Central Library", "Hostel", "Sports Complex", "Auditorium", "Laboratory",
    "Computer Center", "Medical Center", "Cafeteria", "Wi-Fi Campus", "Gym"
];

export default function UniversityProfile() {
    const token = localStorage.getItem("token");
    const [loading, setLoading] = useState(true);
    const [displayName, setDisplayName] = useState("Your University");
    const [showEditMenu, setShowEditMenu] = useState(false);
    const [editingIntro, setEditingIntro] = useState(false);
    
    const [university, setUniversity] = useState({
        name: "", established_year: "", university_type: "", accreditation: "",
        state: "", city: "", zipcode: "", address: "", phone: "", email: "",
        website_url: "", vice_chancellor_name: "", vice_chancellor_email: "",
        vice_chancellor_phone: "", total_students: "", total_faculty: "",
        campus_area: "", logo_url: "", banner_url: "", referral_code: ""
    });

    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [placements, setPlacements] = useState([]);
    const [rankings, setRankings] = useState([]);
    const [research, setResearch] = useState([]);

    const [showDepartmentForm, setShowDepartmentForm] = useState(false);
    const [showProgramForm, setShowProgramForm] = useState(false);
    const [showFacilityForm, setShowFacilityForm] = useState(false);
    const [showPlacementForm, setShowPlacementForm] = useState(false);
    const [showRankingForm, setShowRankingForm] = useState(false);
    const [showResearchForm, setShowResearchForm] = useState(false);

    const [departmentForm, setDepartmentForm] = useState({ department_name: "", hod_name: "" });
    const [programForm, setProgramForm] = useState({
        program_level: "", program_name: "", department: "", duration_years: "",
        annual_fees: "", total_seats: "", eligibility: ""
    });
    const [facilityForm, setFacilityForm] = useState({ facility_name: "" });
    const [placementForm, setPlacementForm] = useState({
        academic_year: "", placement_percent: "", average_package: "",
        highest_package: "", companies_visited: "", top_recruiters: ""
    });
    const [rankingForm, setRankingForm] = useState({
        ranking_body: "", rank_value: "", year: "", category: "", certificate_url: ""
    });
    const [researchForm, setResearchForm] = useState({
        research_title: "", area: "", publication_year: "", description: ""
    });

    useEffect(() => {
        fetchUniversityProfile();
    }, []);

    const fetchUniversityProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/university`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                if (data.university) {
                    setUniversity(data.university);
                    setDisplayName(data.university.name || "Your University");
                }
                setDepartments(data.departments || []);
                setPrograms(data.programs || []);
                setFacilities(data.facilities || []);
                setPlacements(data.placements || []);
                setRankings(data.rankings || []);
                setResearch(data.research || []);
            }
        } catch (err) {
            toast.error("Failed to load university profile");
        } finally {
            setLoading(false);
        }
    };

    const updateUniversity = async () => {
        try {
            const res = await fetch(`${API_URL}/university`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(university),
            });
            if (res.ok) {
                toast.success("University information updated!");
                setEditingIntro(false);
                fetchUniversityProfile();
            } else {
                toast.error("Failed to update");
            }
        } catch (err) {
            toast.error("Failed to update");
        }
    };

    const handleImageUpload = async (file, type) => {
        if (!file) return;
        try {
            const formData = new FormData();
            formData.append(type === 'profile' ? 'logoImage' : 'bannerImage', file);
            const res = await fetch(`${API_URL}/university/media`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (res.ok) {
                toast.success(`${type === 'profile' ? 'Logo' : 'Banner'} updated`);
                fetchUniversityProfile();
                setShowEditMenu(false);
            } else {
                toast.error("Failed to upload");
            }
        } catch (err) {
            toast.error("Failed to upload");
        }
    };

    const clearImages = async () => {
        toast.info("Clear images functionality needs to be implemented");
        setShowEditMenu(false);
    };

    // Department CRUD
    const addDepartment = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/university/departments`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(departmentForm),
            });
            if (res.ok) {
                toast.success("Department added");
                setShowDepartmentForm(false);
                setDepartmentForm({ department_name: "", hod_name: "" });
                fetchUniversityProfile();
            }
        } catch (err) {
            toast.error("Failed to add department");
        }
    };

    const deleteDepartment = async (id) => {
        try {
            const res = await fetch(`${API_URL}/university/departments/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success("Department deleted");
                fetchUniversityProfile();
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    // Program CRUD
    const addProgram = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/university/programs`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(programForm),
            });
            if (res.ok) {
                toast.success("Program added");
                setShowProgramForm(false);
                setProgramForm({
                    program_level: "", program_name: "", department: "", duration_years: "",
                    annual_fees: "", total_seats: "", eligibility: ""
                });
                fetchUniversityProfile();
            }
        } catch (err) {
            toast.error("Failed to add program");
        }
    };

    const deleteProgram = async (id) => {
        try {
            const res = await fetch(`${API_URL}/university/programs/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success("Program deleted");
                fetchUniversityProfile();
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    // Facility CRUD
    const addFacility = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/university/facilities`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(facilityForm),
            });
            if (res.ok) {
                toast.success("Facility added");
                setShowFacilityForm(false);
                setFacilityForm({ facility_name: "" });
                fetchUniversityProfile();
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
            const res = await fetch(`${API_URL}/university/facilities/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success("Facility deleted");
                fetchUniversityProfile();
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    // Placement CRUD
    const addPlacement = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/university/placements`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(placementForm),
            });
            if (res.ok) {
                toast.success("Placement added");
                setShowPlacementForm(false);
                setPlacementForm({
                    academic_year: "", placement_percent: "", average_package: "",
                    highest_package: "", companies_visited: "", top_recruiters: ""
                });
                fetchUniversityProfile();
            }
        } catch (err) {
            toast.error("Failed to add placement");
        }
    };

    const deletePlacement = async (id) => {
        try {
            const res = await fetch(`${API_URL}/university/placements/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success("Placement deleted");
                fetchUniversityProfile();
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    // Ranking CRUD
    const addRanking = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/university/rankings`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(rankingForm),
            });
            if (res.ok) {
                toast.success("Ranking added");
                setShowRankingForm(false);
                setRankingForm({ ranking_body: "", rank_value: "", year: "", category: "", certificate_url: "" });
                fetchUniversityProfile();
            }
        } catch (err) {
            toast.error("Failed to add ranking");
        }
    };

    const deleteRanking = async (id) => {
        try {
            const res = await fetch(`${API_URL}/university/rankings/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success("Ranking deleted");
                fetchUniversityProfile();
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    // Research CRUD
    const addResearch = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/university/research`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(researchForm),
            });
            if (res.ok) {
                toast.success("Research added");
                setShowResearchForm(false);
                setResearchForm({ research_title: "", area: "", publication_year: "", description: "" });
                fetchUniversityProfile();
            }
        } catch (err) {
            toast.error("Failed to add research");
        }
    };

    const deleteResearch = async (id) => {
        try {
            const res = await fetch(`${API_URL}/university/research/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success("Research deleted");
                fetchUniversityProfile();
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    if (loading) return <LoadingSpinner message="Loading university profile..." />;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Header */}
                        <ProfileHeader
                            profile={university}
                            displayName={displayName}
                            API_URL={API_URL}
                            showEditMenu={showEditMenu}
                            setShowEditMenu={setShowEditMenu}
                            handleImageUpload={handleImageUpload}
                            clearImages={clearImages}
                            setEditingIntro={setEditingIntro}
                        >
                            <p className="text-base text-gray-600 mt-2">
                                {university.accreditation && `${university.accreditation}`}
                                {university.university_type && ` • ${university.university_type} University`}
                            </p>
                            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{university.city && university.state ? `${university.city}, ${university.state}` : "Add location"}</span>
                            </div>
                        </ProfileHeader>

                        {/* Edit Intro Form */}
                        {editingIntro && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="font-semibold text-lg mb-4 text-gray-900">Edit University Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label>University Name *</Label>
                                        <Input
                                            value={university.name}
                                            onChange={(e) => setUniversity({ ...university, name: e.target.value })}
                                            placeholder="Enter university name"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>University Type</Label>
                                            <select
                                                value={university.university_type}
                                                onChange={(e) => setUniversity({ ...university, university_type: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5"
                                            >
                                                <option value="">Select type</option>
                                                {UNIVERSITY_TYPES.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <Label>Accreditation</Label>
                                            <select
                                                value={university.accreditation}
                                                onChange={(e) => setUniversity({ ...university, accreditation: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5"
                                            >
                                                <option value="">Select accreditation</option>
                                                {ACCREDITATIONS.map((acc) => (
                                                    <option key={acc} value={acc}>{acc}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Established Year</Label>
                                            <Input
                                                type="number"
                                                value={university.established_year}
                                                onChange={(e) => setUniversity({ ...university, established_year: e.target.value })}
                                                placeholder="e.g., 1990"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Campus Area</Label>
                                            <Input
                                                value={university.campus_area}
                                                onChange={(e) => setUniversity({ ...university, campus_area: e.target.value })}
                                                placeholder="e.g., 100 acres"
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>State</Label>
                                            <select
                                                value={university.state}
                                                onChange={(e) => setUniversity({ ...university, state: e.target.value, city: "" })}
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
                                                value={university.city}
                                                onChange={(e) => setUniversity({ ...university, city: e.target.value })}
                                                disabled={!university.state}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5 disabled:bg-gray-100"
                                            >
                                                <option value="">Select city</option>
                                                {university.state && STATES_AND_CITIES[university.state]?.map((city) => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Website URL</Label>
                                        <Input
                                            value={university.website_url}
                                            onChange={(e) => setUniversity({ ...university, website_url: e.target.value })}
                                            placeholder="https://www.youruniversity.edu"
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
                                            onClick={updateUniversity}
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Departments Section */}
                        <SectionCard title="Departments" onAdd={() => setShowDepartmentForm(!showDepartmentForm)}>
                            {showDepartmentForm && (
                                <FormContainer onSubmit={addDepartment}>
                                    <div>
                                        <Label>Department Name *</Label>
                                        <Input
                                            required
                                            value={departmentForm.department_name}
                                            onChange={(e) => setDepartmentForm({ ...departmentForm, department_name: e.target.value })}
                                            placeholder="e.g., Computer Science"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div>
                                        <Label>Head of Department</Label>
                                        <Input
                                            value={departmentForm.hod_name}
                                            onChange={(e) => setDepartmentForm({ ...departmentForm, hod_name: e.target.value })}
                                            placeholder="HOD name"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <button type="button" onClick={() => setShowDepartmentForm(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg">Cancel</button>
                                        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save</button>
                                    </div>
                                </FormContainer>
                            )}
                            {departments.length === 0 && !showDepartmentForm ? (
                                <EmptyState message="No departments added yet" />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {departments.map((dept) => (
                                        <div
                                            key={dept.id}
                                            className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-indigo-100 transition-colors group"
                                        >
                                            <span className="text-sm font-medium text-indigo-900">{dept.department_name}</span>
                                            {dept.hod_name && <span className="text-xs text-indigo-600">({dept.hod_name})</span>}
                                            <button
                                                onClick={() => deleteDepartment(dept.id)}
                                                className="text-indigo-700 hover:text-indigo-900 opacity-70 group-hover:opacity-100"
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

                        {/* Programs Section */}
                        <SectionCard title="Academic Programs" onAdd={() => setShowProgramForm(!showProgramForm)}>
                            {showProgramForm && (
                                <FormContainer onSubmit={addProgram}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Program Level *</Label>
                                            <select
                                                required
                                                value={programForm.program_level}
                                                onChange={(e) => setProgramForm({ ...programForm, program_level: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5"
                                            >
                                                <option value="">Select level</option>
                                                {PROGRAM_LEVELS.map((level) => (
                                                    <option key={level} value={level}>{level}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <Label>Program Name *</Label>
                                            <Input
                                                required
                                                value={programForm.program_name}
                                                onChange={(e) => setProgramForm({ ...programForm, program_name: e.target.value })}
                                                placeholder="e.g., B.Tech in CSE"
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Department</Label>
                                            <Input
                                                value={programForm.department}
                                                onChange={(e) => setProgramForm({ ...programForm, department: e.target.value })}
                                                placeholder="Department name"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Duration (Years)</Label>
                                            <Input
                                                type="number"
                                                value={programForm.duration_years}
                                                onChange={(e) => setProgramForm({ ...programForm, duration_years: e.target.value })}
                                                placeholder="4"
                                                className="mt-1.5"
                                            />
                                        </div>
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
                                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                                            title={prog.program_name}
                                            subtitle={`${prog.program_level}${prog.department ? ` • ${prog.department}` : ''}`}
                                            period={prog.duration_years ? `${prog.duration_years} years` : null}
                                            onDelete={() => deleteProgram(prog.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* Placements Section */}
                        <SectionCard title="Placements" onAdd={() => setShowPlacementForm(!showPlacementForm)}>
                            {showPlacementForm && (
                                <FormContainer onSubmit={addPlacement}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Academic Year *</Label>
                                            <Input
                                                required
                                                value={placementForm.academic_year}
                                                onChange={(e) => setPlacementForm({ ...placementForm, academic_year: e.target.value })}
                                                placeholder="e.g., 2023-24"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Placement %</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={placementForm.placement_percent}
                                                onChange={(e) => setPlacementForm({ ...placementForm, placement_percent: e.target.value })}
                                                placeholder="85.5"
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Average Package (LPA)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={placementForm.average_package}
                                                onChange={(e) => setPlacementForm({ ...placementForm, average_package: e.target.value })}
                                                placeholder="6.5"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Highest Package (LPA)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={placementForm.highest_package}
                                                onChange={(e) => setPlacementForm({ ...placementForm, highest_package: e.target.value })}
                                                placeholder="25"
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <button type="button" onClick={() => setShowPlacementForm(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg">Cancel</button>
                                        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save</button>
                                    </div>
                                </FormContainer>
                            )}
                            {placements.length === 0 && !showPlacementForm ? (
                                <EmptyState message="No placements added yet" />
                            ) : (
                                <div className="space-y-2">
                                    {placements.map((p) => (
                                        <ItemCard
                                            key={p.id}
                                            colorScheme="green"
                                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
                                            title={`Placement ${p.academic_year}`}
                                            description={`Placement Rate: ${p.placement_percent}% • Avg: ₹${p.average_package}L • Highest: ₹${p.highest_package}L`}
                                            onDelete={() => deletePlacement(p.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* Rankings Section */}
                        <SectionCard title="Rankings & Accreditations" onAdd={() => setShowRankingForm(!showRankingForm)}>
                            {showRankingForm && (
                                <FormContainer onSubmit={addRanking}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Ranking Body *</Label>
                                            <select
                                                required
                                                value={rankingForm.ranking_body}
                                                onChange={(e) => setRankingForm({ ...rankingForm, ranking_body: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5"
                                            >
                                                <option value="">Select body</option>
                                                {RANKING_BODIES.map((body) => (
                                                    <option key={body} value={body}>{body}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <Label>Rank</Label>
                                            <Input
                                                value={rankingForm.rank_value}
                                                onChange={(e) => setRankingForm({ ...rankingForm, rank_value: e.target.value })}
                                                placeholder="e.g., #15"
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <button type="button" onClick={() => setShowRankingForm(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg">Cancel</button>
                                        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save</button>
                                    </div>
                                </FormContainer>
                            )}
                            {rankings.length === 0 && !showRankingForm ? (
                                <EmptyState message="No rankings added yet" />
                            ) : (
                                <div className="space-y-2">
                                    {rankings.map((r) => (
                                        <ItemCard
                                            key={r.id}
                                            colorScheme="amber"
                                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                                            title={`${r.ranking_body} Rank ${r.rank_value}`}
                                            period={r.year ? `Year ${r.year}` : null}
                                            subtitle={r.category}
                                            onDelete={() => deleteRanking(r.id)}
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
                                {university.established_year && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Established</span>
                                        <span className="font-medium text-gray-900">{university.established_year}</span>
                                    </div>
                                )}
                                {university.total_students && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Students</span>
                                        <span className="font-medium text-gray-900">{university.total_students}</span>
                                    </div>
                                )}
                                {university.total_faculty && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Faculty</span>
                                        <span className="font-medium text-gray-900">{university.total_faculty}</span>
                                    </div>
                                )}
                                {university.campus_area && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Campus Area</span>
                                        <span className="font-medium text-gray-900">{university.campus_area}</span>
                                    </div>
                                )}
                                {university.website_url && (
                                    <div className="pt-2 border-t">
                                        <a
                                            href={university.website_url}
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

                        {/* Vice Chancellor Info */}
                        {university.vice_chancellor_name && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Vice Chancellor</h3>
                                <p className="text-sm font-medium text-gray-900">{university.vice_chancellor_name}</p>
                                {university.vice_chancellor_email && (
                                    <p className="text-sm text-gray-600 mt-1">{university.vice_chancellor_email}</p>
                                )}
                                {university.vice_chancellor_phone && (
                                    <p className="text-sm text-gray-600 mt-1">{university.vice_chancellor_phone}</p>
                                )}
                            </div>
                        )}

                        {/* Referral Code */}
                        {university.referral_code && (
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
                                <h3 className="font-semibold mb-2">Referral Code</h3>
                                <p className="text-2xl font-bold tracking-wider mb-2">{university.referral_code}</p>
                                <p className="text-sm text-blue-100">Share this code with students</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
