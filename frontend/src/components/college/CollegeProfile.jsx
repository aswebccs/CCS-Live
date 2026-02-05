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

export default function CollegeProfile() {
    const token = localStorage.getItem("token");
    const [loading, setLoading] = useState(true);
    const [displayName, setDisplayName] = useState("Your College");
    const [userId, setUserId] = useState(null);
    const [showEditMenu, setShowEditMenu] = useState(false);

    // Loading states
    const [savingCollege, setSavingCollege] = useState(false);
    const [uploadingImage, setUploadingImage] = useState({ profile: false, banner: false });
    const [addingDegree, setAddingDegree] = useState(false);
    const [addingPlacement, setAddingPlacement] = useState(false);
    const [addingRanking, setAddingRanking] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);

    // Edit modes
    const [editingCollege, setEditingCollege] = useState(false);
    const [originalCollege, setOriginalCollege] = useState({});
    const [editingHOD, setEditingHOD] = useState(false);

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
    
    const [qrCode, setQrCode] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);

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
                setUserId(data.id);
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
                setOriginalCollege(c);
                setDisplayName(c.name || "Your College");
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

    const startEditingCollege = () => {
        setOriginalCollege({ ...college });
        setEditingCollege(true);
    };

    const cancelEditCollege = () => {
        setCollege(originalCollege);
        setEditingCollege(false);
        setEditingHOD(false);
    };

    const updateCollege = async () => {
        if (savingCollege) return;
        
        setSavingCollege(true);
        const { ok } = await apiCall(`${API_URL}/college`, "PUT", college);
        if (ok) {
            toast.success("College profile updated successfully!");
            setEditingCollege(false);
            setEditingHOD(false);
            fetchCollege();
        } else {
            toast.error("Failed to update");
        }
        setSavingCollege(false);
    };

    const handleImageUpload = async (file, type) => {
        if (!file) return;
        
        setUploadingImage(prev => ({ ...prev, [type]: true }));
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
            setUploadingImage(prev => ({ ...prev, [type]: false }));
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
        if (addingDegree) return;
        
        setAddingDegree(true);
        const { ok } = await apiCall(`${API_URL}/college/degrees`, "POST", degreeForm);
        if (ok) {
            toast.success("Degree added");
            setShowDegreeForm(false);
            setDegreeForm({ degree_name: "" });
            setCustomDegreeMode(false);
            fetchCollege();
        } else {
            toast.error("Failed to add degree");
        }
        setAddingDegree(false);
    };

    const deleteDegree = async (degree_id) => {
        if (deletingItem) return;
        
        setDeletingItem(degree_id);
        const { ok } = await apiCall(`${API_URL}/college/degrees/${degree_id}`, "DELETE");
        if (ok) { 
            toast.success("Deleted"); 
            fetchCollege(); 
        }
        setDeletingItem(null);
    };

    const addPlacement = async (e) => {
        e.preventDefault();
        if (addingPlacement) return;
        
        setAddingPlacement(true);
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
        } else {
            toast.error("Failed to add placement");
        }
        setAddingPlacement(false);
    };

    const deletePlacement = async (id) => {
        if (deletingItem) return;
        
        setDeletingItem(id);
        const { ok } = await apiCall(`${API_URL}/college/placements/${id}`, "DELETE");
        if (ok) { 
            toast.success("Deleted"); 
            fetchCollege(); 
        }
        setDeletingItem(null);
    };

    const addRanking = async (e) => {
        e.preventDefault();
        if (addingRanking) return;
        
        setAddingRanking(true);
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
        } else {
            toast.error("Failed to add ranking");
        }
        setAddingRanking(false);
    };

    const deleteRanking = async (id) => {
        if (deletingItem) return;
        
        setDeletingItem(id);
        const { ok } = await apiCall(`${API_URL}/college/rankings/${id}`, "DELETE");
        if (ok) { 
            toast.success("Deleted"); 
            fetchCollege(); 
        }
        setDeletingItem(null);
    };

    if (loading) return <LoadingSpinner message="Loading college profile..." />;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN - MAIN CONTENT */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* HEADER with ProfileHeader component */}
                        <ProfileHeader
                            profile={college}
                            displayName={displayName}
                            API_URL={API_URL}
                            showEditMenu={showEditMenu}
                            setShowEditMenu={setShowEditMenu}
                            handleImageUpload={handleImageUpload}
                            clearImages={clearImages}
                            setEditingIntro={startEditingCollege}
                            uploadingImage={uploadingImage}
                        >
                            <p className="text-base text-gray-600 mt-2">
                                {college.accreditation || "Educational Institution"}
                            </p>
                            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{college.city && college.state ? `${college.city}, ${college.state}` : "Add location"}</span>
                            </div>
                        </ProfileHeader>

                        {/* COLLEGE INFORMATION SECTION */}
                        <SectionCard 
                            title="College Information" 
                            onAdd={editingCollege ? null : startEditingCollege}
                            addLabel="Edit"
                        >
                            {editingCollege ? (
                                <FormContainer>
                                    <div className="space-y-4">
                                        <div>
                                            <Label>College Name *</Label>
                                            <Input
                                                value={college.name}
                                                onChange={(e) => setCollege({ ...college, name: e.target.value })}
                                                placeholder="Enter college name"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Established Year</Label>
                                                <Input
                                                    type="number"
                                                    value={college.established_year}
                                                    onChange={(e) => setCollege({ ...college, established_year: e.target.value })}
                                                    placeholder="e.g., 1985"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label>Accreditation</Label>
                                                <Input
                                                    value={college.accreditation}
                                                    onChange={(e) => setCollege({ ...college, accreditation: e.target.value })}
                                                    placeholder="e.g., NAAC A+"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label>State</Label>
                                                <select
                                                    value={college.state}
                                                    onChange={(e) => setCollege({ ...college, state: e.target.value, city: "" })}
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
                                                    value={college.city}
                                                    onChange={(e) => setCollege({ ...college, city: e.target.value })}
                                                    disabled={!college.state}
                                                    className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5 disabled:bg-gray-100"
                                                >
                                                    <option value="">Select city</option>
                                                    {college.state && STATES_AND_CITIES[college.state]?.map((city) => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Zipcode</Label>
                                                <Input
                                                    value={college.zipcode}
                                                    onChange={(e) => setCollege({ ...college, zipcode: e.target.value })}
                                                    placeholder="Postal code"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label>Phone</Label>
                                                <Input
                                                    value={college.phone}
                                                    onChange={(e) => setCollege({ ...college, phone: e.target.value })}
                                                    placeholder="College phone"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Address</Label>
                                            <Input
                                                value={college.address}
                                                onChange={(e) => setCollege({ ...college, address: e.target.value })}
                                                placeholder="Full address"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Email</Label>
                                                <Input
                                                    type="email"
                                                    value={college.email}
                                                    onChange={(e) => setCollege({ ...college, email: e.target.value })}
                                                    placeholder="College email"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label>Website URL</Label>
                                                <Input
                                                    value={college.website_url}
                                                    onChange={(e) => setCollege({ ...college, website_url: e.target.value })}
                                                    placeholder="https://www.college.edu"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 justify-end pt-2">
                                            <button
                                                onClick={cancelEditCollege}
                                                disabled={savingCollege}
                                                className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={updateCollege}
                                                disabled={savingCollege}
                                                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {savingCollege && (
                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                )}
                                                {savingCollege ? "Saving..." : "Save Changes"}
                                            </button>
                                        </div>
                                    </div>
                                </FormContainer>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                    <InfoItem label="College Name" value={college.name} />
                                    <InfoItem label="Established" value={college.established_year} />
                                    <InfoItem label="Accreditation" value={college.accreditation} />
                                    <InfoItem label="Location" value={college.city && college.state ? `${college.city}, ${college.state}` : null} />
                                    <InfoItem label="Address" value={college.address} />
                                    <InfoItem label="Zipcode" value={college.zipcode} />
                                    <InfoItem label="Phone" value={college.phone} icon="phone" />
                                    <InfoItem label="Email" value={college.email} icon="email" />
                                    <InfoItem label="Website" value={college.website_url} icon="link" />
                                </div>
                            )}
                        </SectionCard>

                        {/* HOD SECTION */}
                        <SectionCard
                            title="HOD Contact"
                            onAdd={() => setEditingHOD(!editingHOD)}
                            addLabel="Edit"
                        >
                            {editingHOD ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Name</Label>
                                            <Input
                                                value={college.hod_name}
                                                onChange={(e) => setCollege({...college, hod_name: e.target.value})}
                                                placeholder="HOD Name"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Designation</Label>
                                            <Input
                                                value={college.hod_designation}
                                                onChange={(e) => setCollege({...college, hod_designation: e.target.value})}
                                                placeholder="Head of Department"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                value={college.hod_email}
                                                onChange={(e) => setCollege({...college, hod_email: e.target.value})}
                                                placeholder="hod@college.edu"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Phone</Label>
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
                                            disabled={savingCollege}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={updateCollege}
                                            disabled={savingCollege}
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {savingCollege && (
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {savingCollege ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                    <InfoItem label="Name" value={college.hod_name} />
                                    <InfoItem label="Designation" value={college.hod_designation} />
                                    <InfoItem label="Email" value={college.hod_email} icon="email" />
                                    <InfoItem label="Phone" value={college.hod_phone} icon="phone" />
                                </div>
                            )}
                        </SectionCard>

                        {/* DEGREES SECTION */}
                        <SectionCard title="Degrees Offered" onAdd={() => setShowDegreeForm(!showDegreeForm)}>
                            {showDegreeForm && (
                                <FormContainer onSubmit={addDegree}>
                                    <div>
                                        <Label>Degree *</Label>
                                        {!customDegreeMode ? (
                                            <select
                                                required
                                                value={degreeForm.degree_name}
                                                onChange={(e) => handleDegreeSelect(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 mt-1.5"
                                            >
                                                <option value="">Select degree</option>
                                                {DEGREE_LEVELS.map((deg) => (
                                                    <option key={deg} value={deg}>{deg}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Input
                                                    required
                                                    value={degreeForm.degree_name}
                                                    onChange={(e) => setDegreeForm({ degree_name: e.target.value })}
                                                    placeholder="Enter custom degree"
                                                    className="mt-1.5 flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCustomDegreeMode(false);
                                                        setDegreeForm({ degree_name: "" });
                                                    }}
                                                    className="mt-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setShowDegreeForm(false);
                                                setCustomDegreeMode(false);
                                                setDegreeForm({ degree_name: "" });
                                            }}
                                            disabled={addingDegree}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={addingDegree}
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {addingDegree && (
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {addingDegree ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                </FormContainer>
                            )}
                            {degrees.length === 0 && !showDegreeForm ? (
                                <EmptyState message="No degrees added yet" />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {degrees.map((deg) => (
                                        <div
                                            key={deg.degree_id}
                                            className="bg-purple-50 border border-purple-200 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-purple-100 transition-colors group"
                                        >
                                            <span className="text-sm font-medium text-purple-900">{deg.degree_name}</span>
                                            <button
                                                onClick={() => deleteDegree(deg.degree_id)}
                                                disabled={deletingItem === deg.degree_id}
                                                className="text-purple-700 hover:text-purple-900 opacity-70 group-hover:opacity-100 disabled:opacity-50"
                                            >
                                                {deletingItem === deg.degree_id ? (
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

                        {/* PLACEMENTS SECTION */}
                        <SectionCard title="Placement Records" onAdd={() => setShowPlacementForm(!showPlacementForm)}>
                            {showPlacementForm && (
                                <FormContainer onSubmit={addPlacement}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Academic Year *</Label>
                                            <Input
                                                required
                                                value={placementForm.academic_year}
                                                onChange={(e) => setPlacementForm({...placementForm, academic_year: e.target.value})}
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
                                                onChange={(e) => setPlacementForm({...placementForm, placement_percent: e.target.value})}
                                                placeholder="e.g., 85.5"
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Average Package (LPA)</Label>
                                            <Input
                                                value={placementForm.average_package}
                                                onChange={(e) => setPlacementForm({...placementForm, average_package: e.target.value})}
                                                placeholder="e.g., 7.5"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Highest Package (LPA)</Label>
                                            <Input
                                                value={placementForm.highest_package}
                                                onChange={(e) => setPlacementForm({...placementForm, highest_package: e.target.value})}
                                                placeholder="e.g., 45"
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Companies Visited</Label>
                                            <Input
                                                type="number"
                                                value={placementForm.companies_visited}
                                                onChange={(e) => setPlacementForm({...placementForm, companies_visited: e.target.value})}
                                                placeholder="e.g., 150"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Top Recruiters</Label>
                                            <Input
                                                value={placementForm.top_recruiters}
                                                onChange={(e) => setPlacementForm({...placementForm, top_recruiters: e.target.value})}
                                                placeholder="e.g., TCS, Infosys, Wipro"
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPlacementForm(false)}
                                            disabled={addingPlacement}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={addingPlacement}
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {addingPlacement && (
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {addingPlacement ? "Saving..." : "Save"}
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
                                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
                                            title={`Placements ${p.academic_year}`}
                                            description={`Placement: ${p.placement_percent}% • Avg: ₹${p.average_package}L • Highest: ₹${p.highest_package}L • Companies: ${p.companies_visited || 'N/A'}`}
                                            onDelete={() => deletePlacement(p.id)}
                                            isDeleting={deletingItem === p.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* RANKINGS SECTION */}
                        <SectionCard title="Rankings & Certifications" onAdd={() => setShowRankingForm(!showRankingForm)}>
                            {showRankingForm && (
                                <FormContainer onSubmit={addRanking}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Ranking Body *</Label>
                                            <Input
                                                required
                                                value={rankingForm.ranking_body}
                                                onChange={(e) => setRankingForm({...rankingForm, ranking_body: e.target.value})}
                                                placeholder="Ex: NIRF"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Rank / Grade</Label>
                                            <Input
                                                value={rankingForm.rank_value}
                                                onChange={(e) => setRankingForm({...rankingForm, rank_value: e.target.value})}
                                                placeholder="Ex: 25 or A++"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Year</Label>
                                            <Input
                                                type="number"
                                                value={rankingForm.year}
                                                onChange={(e) => setRankingForm({...rankingForm, year: e.target.value})}
                                                placeholder="2024"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Category</Label>
                                            <Input
                                                value={rankingForm.category}
                                                onChange={(e) => setRankingForm({...rankingForm, category: e.target.value})}
                                                placeholder="Ex: Engineering, Overall"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <Label>Certificate URL (Optional)</Label>
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
                                            onClick={() => setShowRankingForm(false)}
                                            disabled={addingRanking}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={addingRanking}
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {addingRanking && (
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {addingRanking ? "Saving..." : "Save"}
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
                                            isDeleting={deletingItem === r.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    {/* RIGHT COLUMN - SIDEBAR */}
                    <div className="space-y-6">
                        {/* QR Code Card */}
                        <SectionCard title="Student Referral QR">
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
                                            className="w-full max-w-50"
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
                        </SectionCard>

                        {/* Quick Info Card */}
                        <SectionCard title="Public profile & URL">
                            {userId ? (
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600 break-all">
                                        {window.location.origin}/college/{userId}
                                    </p>
                                    <button
                                        onClick={() => window.open(`/college/${userId}`, '_blank')}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        View Public Profile →
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">Loading...</p>
                            )}
                        </SectionCard>

                        <SectionCard title="Quick Info">
                            <div className="space-y-3 text-sm">
                                {college.established_year && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Established</span>
                                        <span className="font-medium text-gray-900">{college.established_year}</span>
                                    </div>
                                )}
                                {college.accreditation && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Accreditation</span>
                                        <span className="font-medium text-gray-900">{college.accreditation}</span>
                                    </div>
                                )}
                                {college.website_url && (
                                    <div className="pt-2 border-t">
                                        <a
                                            href={college.website_url}
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
                        </SectionCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
