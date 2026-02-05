import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { STATES_AND_CITIES } from "../data/statesAndCities";
import { 
    ProfileHeader, 
    SectionCard, 
    ItemCard,
    FormContainer, 
    EmptyState, 
    LoadingSpinner
} from "../customreuse";

const API_URL = import.meta.env.VITE_API_URL;

const COLLEGE_TYPES = [
    "University",
    "Autonomous",
    "Affiliated College",
    "Technical Institute",
    "Management Institute",
];

const DEGREE_LEVELS = [
    "B.Tech", "M.Tech", "B.E.", "M.E.", "BSc", "MSc", "BCA", "MCA",
    "BA", "MA", "BBA", "MBA", "B.Com", "M.Com", "LLB", "LLM",
    "MBBS", "MD", "BDS", "MDS", "B.Pharm", "M.Pharm", "PhD",
    "Diploma", "Other"
];

export default function CollegeProfile() {
    const token = localStorage.getItem("token");

    const [college, setCollege] = useState({
        name: "",
        established_year: "",
        accreditation: "",
        state: "",
        city: "",
        zipcode: "",
        address: "",
        phone: "",
        email: "",
        website_url: "",
        logo_url: "",
        banner_url: "",
        hod_name: "",
        hod_email: "",
        hod_phone: "",
        hod_designation: "",
    });

    const [degrees, setDegrees] = useState([]);
    const [placements, setPlacements] = useState([]);
    const [rankings, setRankings] = useState([]);

    const [showDegreeForm, setShowDegreeForm] = useState(false);
    const [degreeForm, setDegreeForm] = useState({ degree_name: "" });
    const [customDegreeMode, setCustomDegreeMode] = useState(false);
    
    const [showPlacementForm, setShowPlacementForm] = useState(false);
    const [placementForm, setPlacementForm] = useState({
        academic_year: "",
        placement_percent: "",
        average_package: "",
        highest_package: "",
        companies_visited: "",
        top_recruiters: "",
    });
    
    const [showRankingForm, setShowRankingForm] = useState(false);
    const [rankingForm, setRankingForm] = useState({
        ranking_body: "",
        rank_value: "",
        year: "",
        category: "",
        certificate_url: "",
    });

    const [loading, setLoading] = useState(true);
    const [editingIntro, setEditingIntro] = useState(false);
    const [editingHOD, setEditingHOD] = useState(false);
    const [showEditMenu, setShowEditMenu] = useState(false);
    const [mediaUploading, setMediaUploading] = useState(false);
    
    const [qrCode, setQrCode] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);

    const displayName = college.name || "College Name";

    useEffect(() => {
        fetchCollege();
        fetchQRCode();
    }, []);

    const apiCall = async (url, method, body, isFormData = false) => {
        try {
            const res = await fetch(url, {
                method,
                headers: isFormData
                    ? { Authorization: `Bearer ${token}` }
                    : { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
            });
            const data = await res.json();
            return { ok: res.ok, data };
        } catch (err) {
            return { ok: false, data: null };
        }
    };

    const fetchCollege = async () => {
        try {
            const { ok, data } = await apiCall(`${API_URL}/college`, "GET");
            if (ok) {
                const c = data.college || {};
                setCollege({
                    name: c.name || "",
                    established_year: c.established_year || "",
                    accreditation: c.accreditation || "",
                    state: c.state || "",
                    city: c.city || "",
                    zipcode: c.zipcode || "",
                    address: c.address || "",
                    phone: c.phone || "",
                    email: c.email || "",
                    website_url: c.website_url || "",
                    logo_url: c.logo_url || "",
                    banner_url: c.banner_url || "",
                    hod_name: c.hod_name || "",
                    hod_email: c.hod_email || "",
                    hod_phone: c.hod_phone || "",
                    hod_designation: c.hod_designation || "",
                });
                setDegrees(data.degrees || []);
                setPlacements(data.placements || []);
                setRankings(data.rankings || []);
            } else {
                toast.error("Failed to load college profile");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchQRCode = async () => {
        setQrLoading(true);
        try {
            const { ok, data } = await apiCall(`${API_URL}/college/qrcode`, "GET");
            if (ok) {
                setQrCode(data);
            }
        } catch (err) {
            console.error("Failed to fetch QR code:", err);
        } finally {
            setQrLoading(false);
        }
    };

    const downloadQRCode = () => {
        if (!qrCode?.qrCode) return;
        const link = document.createElement('a');
        link.href = qrCode.qrCode;
        link.download = `${qrCode.collegeName || 'college'}_referral_qr.png`;
        link.click();
        toast.success("QR Code downloaded!");
    };

    const updateCollege = async () => {
        const { ok } = await apiCall(`${API_URL}/college`, "PUT", college);
        if (ok) {
            toast.success("College profile updated successfully!");
            setEditingIntro(false);
            setEditingHOD(false);
            fetchCollege();
        } else {
            toast.error("Failed to update");
        }
    };

    const handleImageUpload = async (file, type) => {
        if (!file) return;
        setMediaUploading(true);
        try {
            const formData = new FormData();
            formData.append(type === 'profile' ? 'logoImage' : 'bannerImage', file);
            const res = await fetch(`${API_URL}/college/media`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`${type === 'profile' ? 'Logo' : 'Banner'} updated successfully`);
                setCollege((prev) => ({
                    ...prev,
                    logo_url: data.logo_url || prev.logo_url,
                    banner_url: data.banner_url || prev.banner_url
                }));
                setShowEditMenu(false);
            } else {
                toast.error(data.message || 'Upload failed');
            }
        } catch (err) {
            toast.error("Failed to upload image");
        } finally {
            setMediaUploading(false);
        }
    };

    const clearImages = async () => {
        const { ok } = await apiCall(`${API_URL}/college/media/clear`, "DELETE");
        if (ok) {
            toast.success("Images cleared");
            setCollege((prev) => ({ ...prev, logo_url: "", banner_url: "" }));
            setShowEditMenu(false);
        }
    };

    const handleDegreeSelect = (value) => {
        if (value === "Other") {
            setCustomDegreeMode(true);
            setDegreeForm({ degree_name: "" });
        } else {
            setCustomDegreeMode(false);
            setDegreeForm({ degree_name: value });
        }
    };

    const addDegree = async (e) => {
        e.preventDefault();
        const { ok } = await apiCall(`${API_URL}/college/degrees`, "POST", degreeForm);
        if (ok) {
            toast.success("Degree added");
            setShowDegreeForm(false);
            setDegreeForm({ degree_name: "" });
            setCustomDegreeMode(false);
            fetchCollege();
        } else toast.error("Failed to add degree");
    };

    const deleteDegree = async (degree_id) => {
        const { ok } = await apiCall(`${API_URL}/college/degrees/${degree_id}`, "DELETE");
        if (ok) { 
            toast.success("Deleted"); 
            fetchCollege(); 
        }
    };

    const addPlacement = async (e) => {
        e.preventDefault();
        const { ok } = await apiCall(`${API_URL}/college/placements`, "POST", placementForm);
        if (ok) {
            toast.success("Placement added");
            setShowPlacementForm(false);
            setPlacementForm({ 
                academic_year: "", 
                placement_percent: "", 
                average_package: "", 
                highest_package: "", 
                companies_visited: "", 
                top_recruiters: "" 
            });
            fetchCollege();
        } else toast.error("Failed to add placement");
    };

    const deletePlacement = async (id) => {
        const { ok } = await apiCall(`${API_URL}/college/placements/${id}`, "DELETE");
        if (ok) { 
            toast.success("Deleted"); 
            fetchCollege(); 
        }
    };

    const addRanking = async (e) => {
        e.preventDefault();
        const { ok } = await apiCall(`${API_URL}/college/rankings`, "POST", rankingForm);
        if (ok) {
            toast.success("Ranking added");
            setShowRankingForm(false);
            setRankingForm({ 
                ranking_body: "", 
                rank_value: "", 
                year: "", 
                category: "", 
                certificate_url: "" 
            });
            fetchCollege();
        } else toast.error("Failed to add ranking");
    };

    const deleteRanking = async (id) => {
        const { ok } = await apiCall(`${API_URL}/college/rankings/${id}`, "DELETE");
        if (ok) { 
            toast.success("Deleted"); 
            fetchCollege(); 
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading college profile..." />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Header */}
                        <ProfileHeader
                            profile={college}
                            displayName={displayName}
                            API_URL={API_URL}
                            showEditMenu={showEditMenu}
                            setShowEditMenu={setShowEditMenu}
                            handleImageUpload={handleImageUpload}
                            clearImages={clearImages}
                            setEditingIntro={setEditingIntro}
                        >
                            <p className="text-gray-600 text-base">
                                {college.city && college.state ? `${college.city}, ${college.state}` : "Add location"}
                            </p>
                            {college.established_year && (
                                <p className="text-gray-500 text-sm">Established {college.established_year}</p>
                            )}
                        </ProfileHeader>

                        {/* Basic Info Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-5">
                                    <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                                    <button
                                        onClick={() => setEditingIntro(!editingIntro)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>

                                {editingIntro ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">College Name *</Label>
                                                <Input
                                                    required
                                                    value={college.name}
                                                    onChange={(e) => setCollege({...college, name: e.target.value})}
                                                    placeholder="Enter college name"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Established Year</Label>
                                                <Input
                                                    type="number"
                                                    value={college.established_year}
                                                    onChange={(e) => setCollege({...college, established_year: e.target.value})}
                                                    placeholder="Ex: 1995"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Accreditation</Label>
                                                <Input
                                                    value={college.accreditation}
                                                    onChange={(e) => setCollege({...college, accreditation: e.target.value})}
                                                    placeholder="Ex: NAAC A++"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">State *</Label>
                                                <select
                                                    value={college.state}
                                                    onChange={(e) => setCollege({...college, state: e.target.value, city: ""})}
                                                    className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Select State</option>
                                                    {Object.keys(STATES_AND_CITIES).map((state) => (
                                                        <option key={state} value={state}>{state}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">City *</Label>
                                                <select
                                                    value={college.city}
                                                    onChange={(e) => setCollege({...college, city: e.target.value})}
                                                    disabled={!college.state}
                                                    className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5 disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Select City</option>
                                                    {college.state && STATES_AND_CITIES[college.state]?.map((city) => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Zipcode</Label>
                                                <Input
                                                    value={college.zipcode}
                                                    onChange={(e) => setCollege({...college, zipcode: e.target.value})}
                                                    placeholder="Ex: 560001"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <Label className="text-sm font-medium text-gray-700">Address</Label>
                                                <Input
                                                    value={college.address}
                                                    onChange={(e) => setCollege({...college, address: e.target.value})}
                                                    placeholder="Enter full address"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Phone</Label>
                                                <Input
                                                    value={college.phone}
                                                    onChange={(e) => setCollege({...college, phone: e.target.value})}
                                                    placeholder="+91 XXXXX XXXXX"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Official Email</Label>
                                                <Input
                                                    type="email"
                                                    value={college.email}
                                                    onChange={(e) => setCollege({...college, email: e.target.value})}
                                                    placeholder="info@college.edu"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <Label className="text-sm font-medium text-gray-700">Website URL</Label>
                                                <Input
                                                    value={college.website_url}
                                                    onChange={(e) => setCollege({...college, website_url: e.target.value})}
                                                    placeholder="https://www.college.edu"
                                                    className="mt-1.5"
                                                />
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
                                                onClick={updateCollege}
                                                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 text-gray-700">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Established</p>
                                                <p className="font-medium">{college.established_year || "Not specified"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Accreditation</p>
                                                <p className="font-medium">{college.accreditation || "Not specified"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Location</p>
                                                <p className="font-medium">{college.city && college.state ? `${college.city}, ${college.state}` : "Not specified"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Zipcode</p>
                                                <p className="font-medium">{college.zipcode || "Not specified"}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs text-gray-500">Address</p>
                                                <p className="font-medium">{college.address || "Not specified"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Phone</p>
                                                <p className="font-medium">{college.phone || "Not specified"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Email</p>
                                                <p className="font-medium break-all">{college.email || "Not specified"}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs text-gray-500">Website</p>
                                                <p className="font-medium break-all">{college.website_url || "Not specified"}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Degrees Offered Section */}
                        <SectionCard
                            title="Degrees Offered"
                            onAdd={() => setShowDegreeForm(!showDegreeForm)}
                            addLabel="Add"
                        >
                            {showDegreeForm && (
                                <FormContainer onSubmit={addDegree}>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <select
                                            value={customDegreeMode ? "Other" : degreeForm.degree_name}
                                            onChange={(e) => handleDegreeSelect(e.target.value)}
                                            className="flex-1 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required={!customDegreeMode}
                                        >
                                            <option value="">Select degree</option>
                                            {DEGREE_LEVELS.map((degree) => (
                                                <option key={degree} value={degree}>{degree}</option>
                                            ))}
                                        </select>
                                        {customDegreeMode && (
                                            <Input
                                                required
                                                value={degreeForm.degree_name}
                                                onChange={(e) => setDegreeForm({ degree_name: e.target.value })}
                                                placeholder="Enter custom degree name"
                                                className="flex-1"
                                            />
                                        )}
                                    </div>
                                    <div className="flex gap-3 justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowDegreeForm(false);
                                                setDegreeForm({ degree_name: "" });
                                                setCustomDegreeMode(false);
                                            }}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </FormContainer>
                            )}

                            {degrees.length === 0 && !showDegreeForm ? (
                                <EmptyState message="No degrees added yet" />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {degrees.map((degree) => (
                                        <div
                                            key={degree.id}
                                            className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100 hover:bg-blue-100 transition-colors group"
                                        >
                                            <span>{degree.degree_name}</span>
                                            <button
                                                onClick={() => deleteDegree(degree.id)}
                                                className="p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                                                aria-label="Delete degree"
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

                        {/* Placement Snapshot Section */}
                        <SectionCard
                            title="Placement Snapshot"
                            onAdd={() => setShowPlacementForm(!showPlacementForm)}
                            addLabel="Add"
                        >
                            {showPlacementForm && (
                                <FormContainer onSubmit={addPlacement}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Academic Year *</Label>
                                            <Input
                                                required
                                                value={placementForm.academic_year}
                                                onChange={(e) => setPlacementForm({...placementForm, academic_year: e.target.value})}
                                                placeholder="2024-25"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Placement %</Label>
                                            <Input
                                                type="number"
                                                value={placementForm.placement_percent}
                                                onChange={(e) => setPlacementForm({...placementForm, placement_percent: e.target.value})}
                                                placeholder="85"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Companies Visited</Label>
                                            <Input
                                                type="number"
                                                value={placementForm.companies_visited}
                                                onChange={(e) => setPlacementForm({...placementForm, companies_visited: e.target.value})}
                                                placeholder="50"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Average Package (LPA)</Label>
                                            <Input
                                                type="number"
                                                value={placementForm.average_package}
                                                onChange={(e) => setPlacementForm({...placementForm, average_package: e.target.value})}
                                                placeholder="6.5"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Highest Package (LPA)</Label>
                                            <Input
                                                type="number"
                                                value={placementForm.highest_package}
                                                onChange={(e) => setPlacementForm({...placementForm, highest_package: e.target.value})}
                                                placeholder="25"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Top Recruiters</Label>
                                            <Input
                                                value={placementForm.top_recruiters}
                                                onChange={(e) => setPlacementForm({...placementForm, top_recruiters: e.target.value})}
                                                placeholder="Google, Microsoft, Amazon"
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowPlacementForm(false);
                                                setPlacementForm({ academic_year: "", placement_percent: "", average_package: "", highest_package: "", companies_visited: "", top_recruiters: "" });
                                            }}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </FormContainer>
                            )}

                            {placements.length === 0 && !showPlacementForm ? (
                                <EmptyState message="No placement records added yet" />
                            ) : (
                                <div className="space-y-2">
                                    {placements.map((p) => (
                                        <ItemCard
                                            key={p.id}
                                            colorScheme="green"
                                            icon={
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            }
                                            title={`Academic Year ${p.academic_year}`}
                                            subtitle={`Placement: ${p.placement_percent || "N/A"}% | Companies: ${p.companies_visited || "N/A"}`}
                                            description={`Avg Package: ${p.average_package || "N/A"} LPA | Highest: ${p.highest_package || "N/A"} LPA${p.top_recruiters ? ` | Top Recruiters: ${p.top_recruiters}` : ''}`}
                                            onDelete={() => deletePlacement(p.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* Rankings & Certifications Section */}
                        <SectionCard
                            title="Rankings & Certifications"
                            onAdd={() => setShowRankingForm(!showRankingForm)}
                            addLabel="Add"
                        >
                            {showRankingForm && (
                                <FormContainer onSubmit={addRanking}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Ranking Body *</Label>
                                            <Input
                                                required
                                                value={rankingForm.ranking_body}
                                                onChange={(e) => setRankingForm({...rankingForm, ranking_body: e.target.value})}
                                                placeholder="Ex: NIRF"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Rank / Grade</Label>
                                            <Input
                                                value={rankingForm.rank_value}
                                                onChange={(e) => setRankingForm({...rankingForm, rank_value: e.target.value})}
                                                placeholder="Ex: 25 or A++"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Year</Label>
                                            <Input
                                                type="number"
                                                value={rankingForm.year}
                                                onChange={(e) => setRankingForm({...rankingForm, year: e.target.value})}
                                                placeholder="2024"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Category</Label>
                                            <Input
                                                value={rankingForm.category}
                                                onChange={(e) => setRankingForm({...rankingForm, category: e.target.value})}
                                                placeholder="Ex: Engineering, Overall"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <Label className="text-sm font-medium text-gray-700">Certificate URL (Optional)</Label>
                                            <Input
                                                value={rankingForm.certificate_url}
                                                onChange={(e) => setRankingForm({...rankingForm, certificate_url: e.target.value})}
                                                placeholder="https://..."
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowRankingForm(false);
                                                setRankingForm({ ranking_body: "", rank_value: "", year: "", category: "", certificate_url: "" });
                                            }}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            Save
                                        </button>
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
                                            icon={
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                </svg>
                                            }
                                            title={r.ranking_body}
                                            subtitle={`Rank: ${r.rank_value || "N/A"} ${r.year ? `(${r.year})` : ""}`}
                                            description={r.category || null}
                                            link={r.certificate_url ? { url: r.certificate_url, text: "View Certificate" } : null}
                                            onDelete={() => deleteRanking(r.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* HOD Contact Section */}
                        <SectionCard
                            title="HOD Contact"
                            onAdd={() => setEditingHOD(!editingHOD)}
                            addLabel="Edit"
                        >
                            {editingHOD ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Name</Label>
                                            <Input
                                                value={college.hod_name}
                                                onChange={(e) => setCollege({...college, hod_name: e.target.value})}
                                                placeholder="HOD Name"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Designation</Label>
                                            <Input
                                                value={college.hod_designation}
                                                onChange={(e) => setCollege({...college, hod_designation: e.target.value})}
                                                placeholder="Head of Department"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Email</Label>
                                            <Input
                                                type="email"
                                                value={college.hod_email}
                                                onChange={(e) => setCollege({...college, hod_email: e.target.value})}
                                                placeholder="hod@college.edu"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Phone</Label>
                                            <Input
                                                value={college.hod_phone}
                                                onChange={(e) => setCollege({...college, hod_phone: e.target.value})}
                                                placeholder="+91 XXXXX XXXXX"
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 justify-end pt-2">
                                        <button
                                            onClick={() => setEditingHOD(false)}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={updateCollege}
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 text-gray-700">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Name</p>
                                            <p className="font-medium">{college.hod_name || "Not specified"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Designation</p>
                                            <p className="font-medium">{college.hod_designation || "Not specified"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-medium break-all">{college.hod_email || "Not specified"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="font-medium">{college.hod_phone || "Not specified"}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* QR Code Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Student Referral QR</h3>
                            {qrLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : qrCode ? (
                                <div className="space-y-3">
                                    <div className="bg-white p-3 rounded-lg border-2 border-gray-200 flex justify-center">
                                        <img 
                                            src={qrCode.qrCode} 
                                            alt="Registration QR Code" 
                                            className="w-full max-w-[200px]"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-600 text-center">
                                        Scan to register with your referral code
                                    </p>
                                    <Button 
                                        onClick={downloadQRCode} 
                                        className="w-full" 
                                        size="sm"
                                    >
                                        📥 Download QR Code
                                    </Button>
                                    <div className="bg-gray-50 p-2 rounded text-xs">
                                        <p className="text-gray-500 mb-1">Referral Code:</p>
                                        <p className="font-mono text-gray-800 break-all">{qrCode.referralCode}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    Complete your profile to generate QR code
                                </p>
                            )}
                        </div>

                        {/* Profile Language Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900">Profile language</h3>
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-sm text-gray-700">English</p>
                        </div>

                        {/* Public Profile URL Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900">Public profile & URL</h3>
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 break-all">
                                www.ccs.com/college/{displayName.toLowerCase().replace(/\s+/g, '-')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


