import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
    Building2, 
    MapPin, 
    Calendar, 
    Globe, 
    Linkedin, 
    Mail, 
    Phone,
    Briefcase,
    Users,
    DollarSign,
    MapPinned
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function CompanyPublicProfile() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState(null);
    const [techStack, setTechStack] = useState([]);
    const [roles, setRoles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCompanyProfile();
    }, [id]);

    const fetchCompanyProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/company/public/${id}`);
            const data = await response.json();

            if (response.ok) {
                setCompany(data.company);
                setTechStack(data.tech_stack || []);
                setRoles(data.roles || []);
                setLocations(data.locations || []);
            } else {
                setError(data.message || "Company not found");
            }
        } catch (err) {
            setError("Failed to load company profile");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading company profile...</div>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="max-w-md">
                    <CardContent className="pt-6">
                        <p className="text-center text-red-500">{error || "Company not found"}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        // <div className="min-h-screen mx bg-gray-50">
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100">

            {/* Banner Section */}
            <div className="relative">
                {company.banner_url ? (
                    // <div
                    //     className="w-full h-64 bg-cover bg-center"
                    //     style={{ backgroundImage: `url(${API_URL}${company.banner_url})` }}
                    // />
                    <div className="w-full h-72 bg-black">
                        <img
                            src={`${API_URL}${company.banner_url}`}
                            alt={company.name}
                            className="w-full h-full"
                        />
                    </div>

                ) : (
                    <div className="w-full h-64 bg-gradient-to-r from-blue-500 to-purple-600" />
                )}

                <div className="absolute -bottom-16 left-10 transform hover:scale-105 transition-transform duration-300 ease-in-out">
               
                    {company.logo_url ? (
                        <img
                            src={`${API_URL}${company.logo_url}`}
                            alt={company.name}
                            className="w-48 h-48 rounded-full border-4 border-white shadow-lg bg-white object-cover"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-lg border-4 border-white shadow-lg bg-white flex items-center justify-center">
                            <Building2 size={48} className="text-gray-400" />
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 pt-20 pb-8">
                {/* Company Header */}
                <div className="mb-10">
                    {/* Company Name */}
                    <h1 className="text-5xl font-bold tracking-tight pb-4
                                bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600
                                bg-clip-text text-transparent">
                        {company.name}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        {company.industry && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full
                                            bg-blue-50 text-blue-700 font-semibold text-sm
                                            hover:bg-blue-100 transition">
                                <Building2 size={18} />
                                <span>{company.industry}</span>
                            </div>
                        )}

                        {company.company_type && (
                            <Badge className="rounded-full px-4 py-2 text-sm font-semibold
                                            bg-gray-900 text-white hover:bg-gray-800 transition">
                                {company.company_type}
                            </Badge>
                        )}

                        {company.founded_year && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full
                                            bg-purple-50 text-purple-700 font-semibold text-sm
                                            hover:bg-purple-100 transition">
                                <Calendar size={18} />
                                <span>Founded {company.founded_year}</span>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-2" />

                    {/* Contact Actions */}
                    <div className="block lg:hidden flex flex-wrap gap-4">
                        {company.website_url && (
                            <a
                                href={company.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 px-4 py-2 rounded-full
                                        bg-white border border-gray-200 shadow-sm
                                        hover:shadow-md hover:border-blue-500
                                        transition-all duration-300"
                            >
                                <Globe size={18} className="text-blue-600 group-hover:scale-110 transition" />
                                <span className="font-medium text-gray-700 group-hover:text-blue-700">
                                    Website
                                </span>
                            </a>
                        )}

                        {company.linkedin_url && (
                            <a
                                href={company.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 px-4 py-2 rounded-full
                                        bg-white border border-gray-200 shadow-sm
                                        hover:shadow-md hover:border-blue-500
                                        transition-all duration-300"
                            >
                                <Linkedin size={18} className="text-blue-600 group-hover:scale-110 transition" />
                                <span className="font-medium text-gray-700 group-hover:text-blue-700">
                                    LinkedIn
                                </span>
                            </a>
                        )}

                        {company.hr_email && (
                            <a
                                href={`mailto:${company.hr_email}`}
                                className="group flex items-center gap-2 px-4 py-2 rounded-full
                                        bg-white border border-gray-200 shadow-sm
                                        hover:shadow-md hover:border-green-500
                                        transition-all duration-300"
                            >
                                <Mail size={18} className="text-green-600 group-hover:scale-110 transition" />
                                <span className="font-medium text-gray-700 group-hover:text-green-700">
                                    {company.hr_email}
                                </span>
                            </a>
                        )}

                        {company.phone && (
                            <a
                                href={`tel:${company.phone}`}
                                className="group flex items-center gap-2 px-4 py-2 rounded-full
                                        bg-white border border-gray-200 shadow-sm
                                        hover:shadow-md hover:border-indigo-500
                                        transition-all duration-300"
                            >
                                <Phone size={18} className="text-indigo-600 group-hover:scale-110 transition" />
                                <span className="font-medium text-gray-700 group-hover:text-indigo-700">
                                    {company.phone}
                                </span>
                            </a>
                        )}
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About Section */}
                        {company.description && (
                            <Card className="border-2 border-blue-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        About {company.name}
                                    </CardTitle>
                                    <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2"></div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">{company.description}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tech Stack */}
                        {techStack.length > 0 && (
                            <Card className="border-2 border-blue-100 shadow-md shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-2xl font-bold text-gray-900">Tech Stack</CardTitle>
                                    <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2.5">
                                        {techStack.map((tech, index) => (
                                            <Badge key={index} variant="outline" className="text-sm px-4 py-1.5 font-semibold border-2 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                                {tech.technology}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Open Positions */}
                        {roles.length > 0 && (
                            <Card className="border-2 border-blue-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <Briefcase size={24} className="text-blue-600" />
                                        Current Openings ({roles.length})
                                    </CardTitle>
                                    <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {roles.map((role, index) => (
                                            <div
                                                key={index}
                                                className="border-2 border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
                                            >
                                                <h3 className="font-bold text-xl mb-3 text-gray-900">{role.role_name}</h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                    {role.experience_level && (
                                                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                                                            <Users size={16} className="text-blue-600" />
                                                            <span className="font-medium">{role.experience_level}</span>
                                                        </div>
                                                    )}
                                                    {role.salary_range && (
                                                        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
                                                            <DollarSign size={16} className="text-green-600" />
                                                            <span className="font-medium">{role.salary_range}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Location Info */}
                    <div className="space-y-6">
                        {/* Contact Information Card */}
                        <Card className=" hidden lg:block border border-gray-200 shadow-lg hover:shadow-2xl 
                                        transition-all duration-300 bg-white rounded-2xl">

                            <CardContent className=" grid grid-cols-2 gap-4 p-5">
                            {/* <CardContent className="flex gap-4 p-5"> */}


                                {company.hr_email && (
                                    <a
                                        href={`mailto:${company.hr_email}`}
                                        className="group flex items-center justify-center
                                                h-14 rounded-xl border border-gray-200
                                                bg-gradient-to-br from-white to-blue-50
                                                hover:from-blue-600 hover:to-indigo-600
                                                transition-all duration-300 hover:scale-[1.05]
                                                hover:shadow-lg"
                                        title="Email"
                                    >
                                        <Mail
                                            size={22}
                                            className="text-blue-600 group-hover:text-white transition"
                                        />
                                    </a>
                                )}

                                {company.phone && (
                                    <a
                                        href={`tel:${company.phone}`}
                                        className="group flex items-center justify-center
                                                h-14 rounded-xl border border-gray-200
                                                bg-gradient-to-br from-white to-green-50
                                                hover:from-green-600 hover:to-emerald-600
                                                transition-all duration-300 hover:scale-[1.05]
                                                hover:shadow-lg"
                                        title="Call"
                                    >
                                        <Phone
                                            size={22}
                                            className="text-green-600 group-hover:text-white transition"
                                        />
                                    </a>
                                )}

                                {company.linkedin_url && (
                                    <a
                                        href={company.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center justify-center
                                                h-14 rounded-xl border border-gray-200
                                                bg-gradient-to-br from-white to-sky-50
                                                hover:from-sky-600 hover:to-blue-700
                                                transition-all duration-300 hover:scale-[1.05]
                                                hover:shadow-lg"
                                        title="LinkedIn"
                                    >
                                        <Linkedin
                                            size={22}
                                            className="text-sky-600 group-hover:text-white transition"
                                        />
                                    </a>
                                )}

                                {company.website_url && (
                                    <a
                                        href={company.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center justify-center
                                                h-14 rounded-xl border border-gray-200
                                                bg-gradient-to-br from-white to-purple-50
                                                hover:from-purple-600 hover:to-indigo-700
                                                transition-all duration-300 hover:scale-[1.05]
                                                hover:shadow-lg"
                                        title="Website"
                                    >
                                        <Globe
                                            size={22}
                                            className="text-purple-600 group-hover:text-white transition"
                                        />
                                    </a>
                                )}

                            </CardContent>
                        </Card>



                        <Card className="border-2 border-blue-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex font-bold text-xl items-center gap-2 text-gray-900">
                                    <Mail size={22} className="text-blue-600" />
                                    Contact Information
                                </CardTitle>
                                <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2"></div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {company.hr_email && (
                                    <a
                                        href={`mailto:${company.hr_email}`}
                                        className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-100"
                                    >
                                        <Mail size={18} className="text-blue-600" />
                                        <span className="text-sm text-gray-700 font-medium">{company.hr_email}</span>
                                    </a>
                                )}
                                {company.phone && (
                                    <a
                                        href={`tel:${company.phone}`}
                                        className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-100"
                                    >
                                        <Phone size={18} className="text-blue-600" />
                                        <span className="text-sm text-gray-700 font-medium">{company.phone}</span>
                                    </a>
                                )}
                                {company.linkedin_url && (
                                    <a
                                        href={company.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-100"
                                    >
                                        <Linkedin size={18} className="text-blue-600" />
                                        <span className="text-sm text-gray-700 font-medium">LinkedIn Profile</span>
                                    </a>
                                )}
                                {company.website_url && (
                                    <a
                                        href={company.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-100"
                                    >
                                        <Globe size={18} className="text-blue-600" />
                                        <span className="text-sm text-gray-700 font-medium">Visit Website</span>
                                    </a>
                                )}
                            </CardContent>
                        </Card>

                        {/* Headquarters */}
                        <Card className="border-2 border-blue-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex font-bold text-xl items-center gap-2 text-gray-900">
                                    <MapPin size={22} className="text-blue-600" />
                                    Headquarters
                                </CardTitle>
                                <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2"></div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {company.headquarters && (
                                    <p className="font-semibold text-base text-gray-900">{company.headquarters}</p>
                                )}
                                {company.address && <p className="text-sm text-gray-700 leading-relaxed">{company.address}</p>}
                                {(company.city || company.state) && (
                                    <p className="text-sm text-gray-700 font-medium">
                                        {[company.city, company.state].filter(Boolean).join(", ")}
                                    </p>
                                )}
                                {company.zipcode && (
                                    <p className="text-sm text-gray-700 font-medium">{company.zipcode}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Additional Locations */}
                        {locations.length > 0 && (
                            <Card className="border-2 border-blue-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 font-bold text-xl text-gray-900">
                                        <MapPinned size={22} className="text-blue-600" />
                                        Other Locations
                                    </CardTitle>
                                    <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {locations.map((location, index) => (
                                            <div key={index} className="text-sm border-l-4 border-blue-500 pl-3 py-1">
                                                {location.address && (
                                                    <p className="text-gray-800 font-medium">{location.address}</p>
                                                )}
                                                <p className="text-gray-600 font-medium">
                                                    {[location.city, location.state].filter(Boolean).join(", ")}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Stats */}
                        <Card className="border-2 border-blue-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                            <CardHeader className="pb-3">
                                <CardTitle className="font-bold text-xl text-gray-900">Company Info</CardTitle>
                                <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2"></div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {company.industry && (
                                    <div className="border-l-4 border-blue-500 pl-3 py-1">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Industry</p>
                                        <p className="font-semibold text-base text-gray-900">{company.industry}</p>
                                    </div>
                                )}
                                {company.company_type && (
                                    <div className="border-l-4 border-purple-500 pl-3 py-1">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Company Type</p>
                                        <p className="font-semibold text-base text-gray-900">{company.company_type}</p>
                                    </div>
                                )}
                                {company.founded_year && (
                                    <div className="border-l-4 border-green-500 pl-3 py-1">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Founded</p>
                                        <p className="font-semibold text-base text-gray-900">{company.founded_year}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}



