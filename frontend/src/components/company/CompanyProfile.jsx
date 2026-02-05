import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { toast } from "sonner";

// const BACKEND_URL = "http://localhost:5000";
const API_URL = import.meta.env.VITE_API_URL;
const ASSET_URL = import.meta.env.VITE_ASSET_URL;
const COMPANY_TYPES = [
    "Public company",
    "Privately held",
    "Partnership",
    "Nonprofit",
    "Government Agency",
    "Self-employed",
];
export const INDIA_STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu & Kashmir",
    "Ladakh",
    "Puducherry",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman & Diu",
    "Lakshadweep",
    "Andaman & Nicobar Islands"
];
export const STATE_CITIES = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"],
    "Assam": ["Guwahati", "Silchar", "Jorhat", "Dibrugarh", "Tezpur"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
    "Chhattisgarh": ["Raipur", "Bilaspur", "Durg", "Korba", "Bhilai"],
    "Goa": ["Panaji", "Vasco da Gama", "Margao", "Mapusa", "Ponda"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Gandhinagar", "Jamnagar"],
    "Haryana": ["Chandigarh", "Gurgaon", "Faridabad", "Panipat", "Ambala"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Manali", "Mandi", "Solan"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
    "Karnataka": ["Bengaluru", "Mysore", "Mangalore", "Hubli", "Belgaum", "Davangere"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain", "Sagar"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Solapur", "Kolhapur", "Latur"],
    "Manipur": ["Imphal", "Thoubal", "Kakching", "Churachandpur"],
    "Meghalaya": ["Shillong", "Tura", "Nongpoh", "Jowai"],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Mon", "Tuensang"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"],
    "Punjab": ["Chandigarh", "Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda"],
    "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur", "Kota", "Ajmer", "Bikaner"],
    "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
    "Tripura": ["Agartala", "Udaipur", "Dharmanagar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida", "Ghaziabad", "Meerut"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Nainital", "Rishikesh", "Haldwani"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"],
    "Delhi": ["New Delhi", "Dwarka", "Rohini", "Karol Bagh", "Connaught Place"],
    "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla"],
    "Ladakh": ["Leh", "Kargil"],
    "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
    "Chandigarh": ["Chandigarh"],
    "Dadra and Nagar Haveli and Daman & Diu": ["Silvassa", "Daman", "Diu"],
    "Lakshadweep": ["Kavaratti", "Agatti"],
    "Andaman & Nicobar Islands": ["Port Blair", "Nicobar"]
};

export default function CompanyProfile() {
    const token = localStorage.getItem("token");

    const [company, setCompany] = useState({
        name: "", industry: "", company_type: "", founded_year: "", description: "",
        headquarters: "", state: "", city: "", address: "", zipcode: "", hr_email: "", phone: "",
        logo_url: "", banner_url: ""
    });

    const [socialLinks, setSocialLinks] = useState({
        website: "", linkedin: "", instagram: "", facebook: "", twitter: "", youtube: ""
    });

    const [hasCompany, setHasCompany] = useState(false);
    const [hasSocialLinks, setHasSocialLinks] = useState(false);
    const [showEditMenu, setShowEditMenu] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const logoInputRef = useRef(null);
    const bannerInputRef = useRef(null);
    const toggleProfileMenu = () => {
        console.log('toggleProfileMenu clicked');
        setShowProfileMenu((v) => !v);
    };
    const logoBtnRef = useRef(null);
    const [profileMenuStyle, setProfileMenuStyle] = useState(null);
    useEffect(() => {
        console.log('showProfileMenu state:', showProfileMenu);
    }, [showProfileMenu]);

    useEffect(() => {
        if (showProfileMenu && logoBtnRef.current) {
            const rect = logoBtnRef.current.getBoundingClientRect();
            const menuWidth = 176; // approx for w-44
            const menuHeight = 88;
            let top = rect.top - menuHeight - 8;
            // if not enough space above, place below
            if (top < 8) top = rect.bottom + 8;
            let left = rect.left;
            if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;
            if (left < 8) left = 8;
            setProfileMenuStyle({ position: 'fixed', top: Math.round(top), left: Math.round(left), zIndex: 99999 });
        } else {
            setProfileMenuStyle(null);
        }
    }, [showProfileMenu]);

    const [editingCompany, setEditingCompany] = useState(false);
    const [editingSocial, setEditingSocial] = useState(false);
    const [backupCompany, setBackupCompany] = useState(null);
    const [backupSocial, setBackupSocial] = useState(null);

    const apiCall = async (url, method, body, isFormData = false) => {
        const res = await fetch(url, {
            method,
            headers: isFormData
                ? { Authorization: `Bearer ${token}` }
                : { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
        });
        return res.json();
    };

    /* ================= LOAD DATA ================= */
    useEffect(() => {
        apiCall(`${API_URL}/company`, "GET").then((data) => {
            if (data.company) { setCompany(data.company); setHasCompany(true); }
            if (data.social_links) { setSocialLinks(data.social_links); setHasSocialLinks(true); }
        });
    }, []);

    /* ================= COMPANY ================= */
    const saveCompany = async () => {
        const res = await apiCall(`${API_URL}/company`, "PUT", company);
        if (res.company) {
            toast.success(hasCompany ? "Company profile updated successfully" : "Company profile saved successfully");
            setCompany(res.company);
            setHasCompany(true);
            setEditingCompany(false);
        } else toast.error("Failed to save company profile");
    };

    const handleImageUpload = async (file, type) => {
        if (!file) return;

        try {
            const formData = new FormData();
            if (type === "logo") {
                formData.append("logoImage", file);
            } else {
                formData.append("bannerImage", file);
            }

            const res = await fetch(`${API_URL}/company/media`, { // ✅ FIXED
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`${type === "logo" ? "Logo" : "Banner"} updated successfully`);
                setCompany(data.company);
                setShowEditMenu(false);
                setShowProfileMenu(false);
            } else {
                toast.error(data.message || "Upload failed");
            }
        } catch (err) {
            toast.error("Failed to upload");
        }
    };



    const deleteImage = async (type) => {
        try {
            const res = await fetch(`${API_URL}/company/media/clear?type=${type}`, { // ✅ FIX
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setCompany(prev => ({
                    ...prev,
                    [type === "logo" ? "logo_url" : "banner_url"]: ""
                }));
                toast.success(`${type === "logo" ? "Logo" : "Banner"} deleted`);
                setShowEditMenu(false);
                setShowProfileMenu(false);
            } else {
                toast.error("Failed to delete image");
            }
        } catch (err) {
            toast.error("Failed to delete image");
        }
    };

    const clearImages = async () => {
        try {
            const res = await fetch(`${API_URL}/company/media/clear`, { // ✅ FIX
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setCompany(prev => ({ ...prev, logo_url: "", banner_url: "" }));
                toast.success("Images cleared");
                setShowEditMenu(false);
            } else {
                toast.error("Failed to clear images");
            }
        } catch (err) {
            toast.error("Failed to clear images");
        }
    };


    /* ================= SOCIAL LINKS ================= */
    const saveSocialLinks = async () => {
        const res = await apiCall(
            `${API_URL}/company/social-links`,
            hasSocialLinks ? "PUT" : "POST",
            socialLinks
        );
        if (res.social_links) {
            toast.success(res.message);
            setSocialLinks(res.social_links);
            setHasSocialLinks(true);
            setEditingSocial(false);
        } else toast.error("Failed to save social links");
    };

    const bannerStyle = company.banner_url
        ? {
            backgroundImage: `url(${ASSET_URL}${company.banner_url})`, // ✅ FIXED
            backgroundSize: "cover",
            backgroundPosition: "center"
        }
        : {};


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-5 py-7">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN - MAIN CONTENT */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* HEADER */}
                        <div className="bg-white rounded-lg shadow overflow-visible">
                            <div className="relative h-50 bg-gradient-to-br from-gray-700 via-gray-600 to-amber-700 border-b-4 border-white" style={bannerStyle}>
                                <button
                                    onClick={() => setShowEditMenu(!showEditMenu)}
                                    className="absolute top-4 right-4 bg-white hover:bg-gray-100 p-2.5 rounded-full shadow-lg transition z-40"
                                >
                                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>

                                {showEditMenu && (
                                    <div className="absolute top-16 right-4 w-44 z-50 pointer-events-auto">
                                        <div className="bg-white rounded-lg shadow-xl border overflow-hidden">
                                            <div style={{ position: 'absolute', right: 12, top: -8, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '8px solid white', filter: 'drop-shadow(0 -1px 0 rgba(0,0,0,0.06))' }} />
                                            <button className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-50" onClick={() => bannerInputRef.current?.click()}>
                                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3l-4 4-4-4" /></svg>
                                                <span className="text-sm">Update cover</span>
                                            </button>
                                            <button className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600" onClick={() => deleteImage('banner')}>
                                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" /></svg>
                                                <span className="text-sm">Delete cover</span>
                                            </button>
                                            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0], 'banner')} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="px-6 pb-6 relative">
                                <div className="absolute -top-20 left-6">
                                    <div className="relative">
                                        <div className="w-40 h-40 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden relative">
                                            {company.logo_url ? (
                                                <img
                                                    src={`${ASSET_URL}${company.logo_url}`}  // ✅ FIXED
                                                    className="w-full h-full object-cover"
                                                    alt="Company Logo"
                                                />

                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                                                    <span className="text-5xl font-bold text-white">{company.name ? company.name.charAt(0).toUpperCase() : 'C'}</span>
                                                </div>
                                            )}

                                            <button ref={logoBtnRef} className="absolute bottom-2 right-2 bg-white hover:bg-gray-100 p-2 rounded-full shadow-lg transition z-30" onClick={toggleProfileMenu} aria-label="Edit logo">
                                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </button>

                                            {showProfileMenu && (
                                                <div
                                                    className="z-50 pointer-events-auto"
                                                    style={profileMenuStyle || { position: 'absolute', right: 0, bottom: '100%', marginBottom: '8px' }}
                                                >
                                                    <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
                                                        <div style={{ position: 'absolute', right: 12, top: -8, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '8px solid white', filter: 'drop-shadow(0 -1px 0 rgba(0,0,0,0.06))' }} />
                                                        <button className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-50" onClick={() => logoInputRef.current?.click()}>
                                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v8" /></svg>
                                                            <span className="text-sm">Update image</span>
                                                        </button>
                                                        <button className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600" onClick={() => deleteImage('logo')}>
                                                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" /></svg>
                                                            <span className="text-sm">Delete image</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0], 'logo')} />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-24">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{company.name || 'Company Name'}</h1>
                                    <p className="text-base text-gray-700 mt-1">{company.industry || 'Industry'}</p>
                                    <p className="text-sm text-gray-600 mt-2">{company.city && company.state ? `${company.city}, ${company.state}` : 'Add your location'}</p>
                                </div>
                            </div>
                        </div>

                        {/* COMPANY INFO */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Company Information</h2>
                                <div>
                                    <button className="p-1.5 hover:bg-gray-100 rounded-full transition" onClick={() => { setBackupCompany(JSON.parse(JSON.stringify(company))); setEditingCompany(true); }} aria-label="Edit company">
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="Company Name" value={company.name} disabled={!editingCompany} onChange={(v) => setCompany({ ...company, name: v })} />
                                    <Field label="Industry" value={company.industry} disabled={!editingCompany} onChange={(v) => setCompany({ ...company, industry: v })} />

                                    <div>
                                        <Label className="text-sm font-medium text-gray-900">Company Type</Label>
                                        <select className="w-full border rounded-md p-2 mt-1 bg-white" disabled={!editingCompany} value={company.company_type} onChange={(e) => setCompany({ ...company, company_type: e.target.value })}>
                                            <option value="">Select</option>
                                            {COMPANY_TYPES.map((t) => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>

                                    <Field label="Founded Year" value={company.founded_year} disabled={!editingCompany} onChange={(v) => setCompany({ ...company, founded_year: v })} />
                                    <Field label="Headquarters" value={company.headquarters} disabled={!editingCompany} onChange={(v) => setCompany({ ...company, headquarters: v })} />

                                    <div>
                                        <Label className="text-sm font-medium text-gray-900">State</Label>
                                        <select className="w-full border rounded-md p-2 mt-1 bg-white" disabled={!editingCompany} value={company.state} onChange={(e) => setCompany({ ...company, state: e.target.value, city: "" })}>
                                            <option value="">Select State</option>
                                            {INDIA_STATES.map((s) => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-gray-900">City</Label>
                                        <select className="w-full border rounded-md p-2 mt-1 disabled:bg-gray-100 bg-white" value={company.city} disabled={!editingCompany || !company.state} onChange={(e) => setCompany({ ...company, city: e.target.value })}>
                                            <option value="">Select City</option>
                                            {(STATE_CITIES[company.state] || []).map((c) => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <Field label="Address" value={company.address} disabled={!editingCompany} onChange={(v) => setCompany({ ...company, address: v })} />
                                    <Field label="Zip Code" value={company.zipcode} disabled={!editingCompany} onChange={(v) => setCompany({ ...company, zipcode: v })} />
                                    <Field label="Human resources Email" value={company.hr_email} disabled={!editingCompany} onChange={(v) => setCompany({ ...company, hr_email: v })} />
                                    <Field label="Phone" value={company.phone} disabled={!editingCompany} onChange={(v) => setCompany({ ...company, phone: v })} />
                                    <Field label="Website" value={company.website} disabled={!editingCompany} onChange={(v) => setCompany({ ...company, website: v })} />

                                    <div className="md:col-span-2">
                                        <Label className="text-sm font-medium text-gray-900">Description</Label>
                                        <textarea rows={4} disabled={!editingCompany} className="w-full border rounded p-2" value={company.description} onChange={(e) => setCompany({ ...company, description: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {editingCompany && (
                                <div className="flex justify-end gap-2 pt-4">
                                    <button className="px-3 py-1 border rounded" onClick={() => { setCompany(backupCompany || company); setEditingCompany(false); }}>Cancel</button>
                                    <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={saveCompany}>Update</button>
                                </div>
                            )}

                        </div>

                        {/* SOCIAL MEDIA */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Social Media Links</h2>
                                <div>
                                    <button className="p-1.5 hover:bg-gray-100 rounded-full transition" onClick={() => { setBackupSocial(JSON.parse(JSON.stringify(socialLinks))); setEditingSocial(true); }} aria-label="Edit social">
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="LinkedIn" value={socialLinks.linkedin} disabled={!editingSocial} onChange={(v) => setSocialLinks({ ...socialLinks, linkedin: v })} />
                                    <Field label="Instagram" value={socialLinks.instagram} disabled={!editingSocial} onChange={(v) => setSocialLinks({ ...socialLinks, instagram: v })} />
                                    <Field label="Facebook" value={socialLinks.facebook} disabled={!editingSocial} onChange={(v) => setSocialLinks({ ...socialLinks, facebook: v })} />
                                    <Field label="X" value={socialLinks.twitter} disabled={!editingSocial} onChange={(v) => setSocialLinks({ ...socialLinks, twitter: v })} />
                                    <Field label="YouTube" value={socialLinks.youtube} disabled={!editingSocial} onChange={(v) => setSocialLinks({ ...socialLinks, youtube: v })} />
                                    <Field label="Pinterest" value={socialLinks.pinterest} disabled={!editingSocial} onChange={(v) => setSocialLinks({ ...socialLinks, pinterest: v })} />
                                </div>

                                {editingSocial && (
                                    <div className="flex justify-end gap-2 pt-4">
                                        <button className="px-3 py-1 border rounded" onClick={() => { setSocialLinks(backupSocial || socialLinks); setEditingSocial(false); }}>Cancel</button>
                                        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={saveSocialLinks}>Update</button>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - SIDEBAR */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg shadow p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900">Profile Language</h3>
                                <button className="p-1.5 hover:bg-gray-100 rounded-full transition">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-sm text-gray-700">English</p>
                        </div>

                        <div className="bg-white rounded-lg shadow p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900">Public Profile & URL</h3>
                                <button className="p-1.5 hover:bg-gray-100 rounded-full transition">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 break-all">{`www.ccs.com/company/${company.name ? company.name.toLowerCase().replace(/\s+/g, '-') : 'company-name'}`}</p>
                            {socialLinks.linkedin && <p className="text-sm mt-2 text-blue-500">LinkedIn: {socialLinks.linkedin}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, disabled }) {
    return (
        <div>
            <Label className="text-sm font-medium text-gray-900">{label}</Label>
            <Input value={value || ""} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="mt-1" />
        </div>
    );
}
