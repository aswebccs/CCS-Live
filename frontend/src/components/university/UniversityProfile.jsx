import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
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

const UNIVERSITY_TYPES = ["Public", "Private", "Deemed", "Central", "State"];
const ACCREDITATIONS = ["NAAC A++", "NAAC A+", "NAAC A", "NAAC B++", "NAAC B+", "UGC Approved", "Other"];
const RANKING_BODIES = ["NIRF", "QS World Rankings", "THE World Rankings", "Academic Ranking", "Other"];

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

export default function UniversityProfile() {
    const token = localStorage.getItem("token");
    const [loading, setLoading] = useState(true);
    const [displayName, setDisplayName] = useState("Your University");
    const [showEditMenu, setShowEditMenu] = useState(false);

    // Loading states
    const [savingUniversity, setSavingUniversity] = useState(false);
    const [uploadingImage, setUploadingImage] = useState({ profile: false, banner: false });
    const [addingDegree, setAddingDegree] = useState(false);
    const [addingPlacement, setAddingPlacement] = useState(false);
    const [addingRanking, setAddingRanking] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);

    // Edit modes
    const [editingUniversity, setEditingUniversity] = useState(false);
    const [originalUniversity, setOriginalUniversity] = useState({});

    const [university, setUniversity] = useState({
        name: "", established_year: "", university_type: "", accreditation: "",
        state: "", city: "", zipcode: "", address: "", phone: "", email: "",
        website_url: "", vice_chancellor_name: "", vice_chancellor_email: "",
        vice_chancellor_phone: "", total_students: "", total_faculty: "",
        campus_area: "", logo_url: "", banner_url: "", referral_code: ""
    });

    const [degrees, setDegrees] = useState([]);
    const [placements, setPlacements] = useState([]);
    const [rankings, setRankings] = useState([]);

    const [showDegreeForm, setShowDegreeForm] = useState(false);
    const [showPlacementForm, setShowPlacementForm] = useState(false);
    const [showRankingForm, setShowRankingForm] = useState(false);

    const [degreeForm, setDegreeForm] = useState({ degree_name: "" });
    const [placementForm, setPlacementForm] = useState({
        academic_year: "", placement_percent: "", average_package: "",
        highest_package: "", companies_visited: "", top_recruiters: ""
    });
    const [rankingForm, setRankingForm] = useState({
        ranking_body: "", rank_value: "", year: "", category: "", certificate_url: ""
    });

    const [qrCode, setQrCode] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);

    useEffect(() => {
        fetchUniversityProfile();
        fetchQRCode();
    }, []);

    const fetchQRCode = async () => {
        setQrLoading(true);
        try {
            const res = await fetch(`${API_URL}/university/qrcode`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
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
        link.download = `${qrCode.universityName || 'university'}_referral_qr.png`;
        link.click();
        toast.success("QR Code downloaded!");
    };

    const fetchUniversityProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/university`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                if (data.university) {
                    setUniversity(data.university);
                    setOriginalUniversity(data.university);
                    setDisplayName(data.university.name || "Your University");
                }
                setDegrees(data.degrees || []);
                setPlacements(data.placements || []);
                setRankings(data.rankings || []);
            }
        } catch (err) {
            toast.error("Failed to load university profile");
        } finally {
            setLoading(false);
        }
    };

    const startEditingUniversity = () => {
        setOriginalUniversity({ ...university });
        setEditingUniversity(true);
    };

    const cancelEditUniversity = () => {
        setUniversity(originalUniversity);
        setEditingUniversity(false);
    };

    const updateUniversity = async () => {
        if (savingUniversity) return;
        
        setSavingUniversity(true);
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
                const data = await res.json();
                toast.success("University information updated!");
                setUniversity(data.university || university);
                setOriginalUniversity(data.university || university);
                setDisplayName(data.university?.name || university.name || "Your University");
                setEditingUniversity(false);
            } else {
                toast.error("Failed to update");
            }
        } catch (err) {
            toast.error("Failed to update");
        } finally {
            setSavingUniversity(false);
        }
    };

    const handleImageUpload = async (file, type) => {
        if (!file) return;
        
        setUploadingImage(prev => ({ ...prev, [type]: true }));
        try {
            const formData = new FormData();
            formData.append(type === 'profile' ? 'logoImage' : 'bannerImage', file);
            const res = await fetch(`${API_URL}/university/media`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`${type === 'profile' ? 'Logo' : 'Banner'} updated`);
                fetchUniversityProfile();
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
        try {
            const res = await fetch(`${API_URL}/university/media/clear`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success("Images cleared");
                setUniversity((prev) => ({ ...prev, logo_url: "", banner_url: "" }));
                setShowEditMenu(false);
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to clear images");
            }
        } catch (err) {
            toast.error("Failed to clear images");
        }
    };

    const addDegree = async (e) => {
        e.preventDefault();
        if (addingDegree) return;
        
        setAddingDegree(true);
        try {
            const res = await fetch(`${API_URL}/university/degrees`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(degreeForm),
            });
            if (res.ok) {
                toast.success("Degree added");
                setShowDegreeForm(false);
                setDegreeForm({ degree_name: "" });
                fetchUniversityProfile();
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to add degree");
            }
        } catch (err) {
            toast.error("Failed to add degree");
        } finally {
            setAddingDegree(false);
        }
    };

    const deleteDegree = async (id) => {
        if (deletingItem) return;
        
        setDeletingItem(id);
        try {
            const res = await fetch(`${API_URL}/university/degrees/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success("Degree deleted");
                fetchUniversityProfile();
            }
        } catch (err) {
            toast.error("Failed to delete");
        } finally {
            setDeletingItem(null);
        }
    };

    const addPlacement = async (e) => {
        e.preventDefault();
        if (addingPlacement) return;
        
        setAddingPlacement(true);
        try {
            const res = await fetch(`${API_URL}/university/placements`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
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
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to add placement");
            }
        } catch (err) {
            toast.error("Failed to add placement");
        } finally {
            setAddingPlacement(false);
        }
    };

    const deletePlacement = async (id) => {
        if (deletingItem) return;
        
        setDeletingItem(id);
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
        } finally {
            setDeletingItem(null);
        }
    };

    const addRanking = async (e) => {
        e.preventDefault();
        if (addingRanking) return;
        
        setAddingRanking(true);
        try {
            const res = await fetch(`${API_URL}/university/rankings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(rankingForm),
            });
            if (res.ok) {
                toast.success("Ranking added");
                setShowRankingForm(false);
                setRankingForm({
                    ranking_body: "", rank_value: "", year: "", category: "", certificate_url: ""
                });
                fetchUniversityProfile();
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to add ranking");
            }
        } catch (err) {
            toast.error("Failed to add ranking");
        } finally {
            setAddingRanking(false);
        }
    };

    const deleteRanking = async (id) => {
        if (deletingItem) return;
        
        setDeletingItem(id);
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
        } finally {
            setDeletingItem(null);
        }
    };

    if (loading) return <LoadingSpinner message="Loading university profile..." />;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN - MAIN CONTENT */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* HEADER with ProfileHeader component */}
                        <ProfileHeader
                            profile={university}
                            displayName={displayName}
                            API_URL={API_URL}
                            showEditMenu={showEditMenu}
                            setShowEditMenu={setShowEditMenu}
                            handleImageUpload={handleImageUpload}
                            clearImages={clearImages}
                            setEditingIntro={startEditingUniversity}
                            uploadingImage={uploadingImage}
                        >
                            <p className="text-base text-gray-600 mt-2">
                                {university.university_type ? `${university.university_type} University` : "Educational Institution"}
                                {university.accreditation && ` • ${university.accreditation}`}
                            </p>
                            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{university.city && university.state ? `${university.city}, ${university.state}` : "Add location"}</span>
                            </div>
                        </ProfileHeader>

                        {/* UNIVERSITY INFORMATION SECTION */}
                        <SectionCard 
                            title="University Information" 
                            onAdd={editingUniversity ? null : startEditingUniversity}
                            addLabel="Edit"
                        >
                            {editingUniversity ? (
                                <FormContainer>
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
                                                    placeholder="e.g., 1950"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label>Campus Area</Label>
                                                <Input
                                                    value={university.campus_area}
                                                    onChange={(e) => setUniversity({ ...university, campus_area: e.target.value })}
                                                    placeholder="e.g., 200 acres"
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Zipcode</Label>
                                                <Input
                                                    value={university.zipcode}
                                                    onChange={(e) => setUniversity({ ...university, zipcode: e.target.value })}
                                                    placeholder="Postal code"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label>Phone</Label>
                                                <Input
                                                    value={university.phone}
                                                    onChange={(e) => setUniversity({ ...university, phone: e.target.value })}
                                                    placeholder="University phone"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Address</Label>
                                            <Input
                                                value={university.address}
                                                onChange={(e) => setUniversity({ ...university, address: e.target.value })}
                                                placeholder="Full address"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Email</Label>
                                                <Input
                                                    type="email"
                                                    value={university.email}
                                                    onChange={(e) => setUniversity({ ...university, email: e.target.value })}
                                                    placeholder="University email"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label>Website URL</Label>
                                                <Input
                                                    value={university.website_url}
                                                    onChange={(e) => setUniversity({ ...university, website_url: e.target.value })}
                                                    placeholder="https://www.university.edu"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Total Students</Label>
                                                <Input
                                                    type="number"
                                                    value={university.total_students}
                                                    onChange={(e) => setUniversity({ ...university, total_students: e.target.value })}
                                                    placeholder="Total students"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label>Total Faculty</Label>
                                                <Input
                                                    type="number"
                                                    value={university.total_faculty}
                                                    onChange={(e) => setUniversity({ ...university, total_faculty: e.target.value })}
                                                    placeholder="Total faculty"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Vice Chancellor Name</Label>
                                            <Input
                                                value={university.vice_chancellor_name}
                                                onChange={(e) => setUniversity({ ...university, vice_chancellor_name: e.target.value })}
                                                placeholder="Vice Chancellor's name"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Vice Chancellor Email</Label>
                                                <Input
                                                    type="email"
                                                    value={university.vice_chancellor_email}
                                                    onChange={(e) => setUniversity({ ...university, vice_chancellor_email: e.target.value })}
                                                    placeholder="Vice Chancellor's email"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label>Vice Chancellor Phone</Label>
                                                <Input
                                                    value={university.vice_chancellor_phone}
                                                    onChange={(e) => setUniversity({ ...university, vice_chancellor_phone: e.target.value })}
                                                    placeholder="Vice Chancellor's phone"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 justify-end pt-2">
                                            <button
                                                onClick={cancelEditUniversity}
                                                disabled={savingUniversity}
                                                className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={updateUniversity}
                                                disabled={savingUniversity}
                                                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {savingUniversity && (
                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                )}
                                                {savingUniversity ? "Saving..." : "Save Changes"}
                                            </button>
                                        </div>
                                    </div>
                                </FormContainer>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                    <InfoItem label="University Name" value={university.name} />
                                    <InfoItem label="Type" value={university.university_type} />
                                    <InfoItem label="Accreditation" value={university.accreditation} />
                                    <InfoItem label="Established" value={university.established_year} />
                                    <InfoItem label="Campus Area" value={university.campus_area} />
                                    <InfoItem label="Location" value={university.city && university.state ? `${university.city}, ${university.state}` : null} />
                                    <InfoItem label="Address" value={university.address} />
                                    <InfoItem label="Zipcode" value={university.zipcode} />
                                    <InfoItem label="Phone" value={university.phone} icon="phone" />
                                    <InfoItem label="Email" value={university.email} icon="email" />
                                    <InfoItem label="Website" value={university.website_url} icon="link" />
                                    <InfoItem label="Total Students" value={university.total_students} />
                                    <InfoItem label="Total Faculty" value={university.total_faculty} />
                                    <InfoItem label="Vice Chancellor" value={university.vice_chancellor_name} />
                                    <InfoItem label="VC Email" value={university.vice_chancellor_email} icon="email" />
                                    <InfoItem label="VC Phone" value={university.vice_chancellor_phone} icon="phone" />
                                </div>
                            )}
                        </SectionCard>

                        {/* DEGREES SECTION */}
                        <SectionCard title="Degrees Offered" onAdd={() => setShowDegreeForm(!showDegreeForm)}>
                            {showDegreeForm && (
                                <FormContainer onSubmit={addDegree}>
                                    <div>
                                        <Label>Degree Name *</Label>
                                        <Input
                                            required
                                            value={degreeForm.degree_name}
                                            onChange={(e) => setDegreeForm({ degree_name: e.target.value })}
                                            placeholder="e.g., B.Tech Computer Science, MBA, M.Sc Physics"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowDegreeForm(false)} 
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
                                <div className="space-y-2">
                                    {degrees.map((deg) => (
                                        <ItemCard
                                            key={deg.id}
                                            colorScheme="blue"
                                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>}
                                            title={deg.degree_name}
                                            onDelete={() => deleteDegree(deg.id)}
                                            isDeleting={deletingItem === deg.id}
                                        />
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
                                                onChange={(e) => setPlacementForm({ ...placementForm, academic_year: e.target.value })}
                                                placeholder="e.g., 2023-24"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Placement Percentage</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={placementForm.placement_percent}
                                                onChange={(e) => setPlacementForm({ ...placementForm, placement_percent: e.target.value })}
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
                                                onChange={(e) => setPlacementForm({ ...placementForm, average_package: e.target.value })}
                                                placeholder="e.g., 7.5"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Highest Package (LPA)</Label>
                                            <Input
                                                value={placementForm.highest_package}
                                                onChange={(e) => setPlacementForm({ ...placementForm, highest_package: e.target.value })}
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
                                                onChange={(e) => setPlacementForm({ ...placementForm, companies_visited: e.target.value })}
                                                placeholder="e.g., 150"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Top Recruiters</Label>
                                            <Input
                                                value={placementForm.top_recruiters}
                                                onChange={(e) => setPlacementForm({ ...placementForm, top_recruiters: e.target.value })}
                                                placeholder="e.g., Google, Microsoft, Amazon"
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Year</Label>
                                            <Input
                                                type="number"
                                                value={rankingForm.year}
                                                onChange={(e) => setRankingForm({ ...rankingForm, year: e.target.value })}
                                                placeholder="2024"
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label>Category</Label>
                                            <Input
                                                value={rankingForm.category}
                                                onChange={(e) => setRankingForm({ ...rankingForm, category: e.target.value })}
                                                placeholder="e.g., Engineering"
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Certificate URL</Label>
                                        <Input
                                            value={rankingForm.certificate_url}
                                            onChange={(e) => setRankingForm({ ...rankingForm, certificate_url: e.target.value })}
                                            placeholder="https://certificate-url.com"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end">
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
                                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                                            title={`${r.ranking_body} Rank ${r.rank_value}`}
                                            period={r.year ? `Year ${r.year}` : null}
                                            subtitle={r.category}
                                            link={r.certificate_url ? { url: r.certificate_url, text: "View Certificate" } : null}
                                            onDelete={() => deleteRanking(r.id)}
                                            isDeleting={deletingItem === r.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* FACILITIES SECTION - Removed */}
                        {/* RESEARCH SECTION - Removed */}
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

                        <SectionCard title="Quick Info">
                            <div className="space-y-4">
                                <InfoDisplay 
                                    icon={
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    }
                                    label="Established"
                                    value={university.established_year || "Not specified"}
                                />
                                <InfoDisplay 
                                    icon={
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    }
                                    label="Students"
                                    value={university.total_students || "Not specified"}
                                />
                                <InfoDisplay 
                                    icon={
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    }
                                    label="Faculty"
                                    value={university.total_faculty || "Not specified"}
                                />
                                <InfoDisplay 
                                    icon={
                                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    }
                                    label="Campus"
                                    value={university.campus_area || "Not specified"}
                                />
                                {university.website_url && (
                                    <div className="pt-2 border-t">
                                        <a
                                            href={university.website_url}
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

                        {university.vice_chancellor_name && (
                            <SectionCard title="Vice Chancellor">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-gray-900">{university.vice_chancellor_name}</p>
                                    {university.vice_chancellor_email && (
                                        <a href={`mailto:${university.vice_chancellor_email}`} className="text-sm text-blue-600 hover:text-blue-700 block">
                                            {university.vice_chancellor_email}
                                        </a>
                                    )}
                                    {university.vice_chancellor_phone && (
                                        <a href={`tel:${university.vice_chancellor_phone}`} className="text-sm text-blue-600 hover:text-blue-700 block">
                                            {university.vice_chancellor_phone}
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
