import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
    GraduationCap, 
    MapPin, 
    Globe, 
    Mail, 
    Phone,
    BookOpen,
    Award,
    TrendingUp,
    DollarSign,
    Users
} from "lucide-react";

export default function CollegePublicProfile() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [college, setCollege] = useState(null);
    const [degrees, setDegrees] = useState([]);
    const [placements, setPlacements] = useState([]);
    const [rankings, setRankings] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCollegeProfile();
    }, [id]);

    const fetchCollegeProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/college/public/${id}`);
            const data = await response.json();

            if (response.ok) {
                setCollege(data.college);
                setDegrees(data.degrees || []);
                setPlacements(data.placements || []);
                setRankings(data.rankings || []);
            } else {
                setError(data.message || "College not found");
            }
        } catch (err) {
            setError("Failed to load college profile");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading college profile...</div>
            </div>
        );
    }

    if (error || !college) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="max-w-md">
                    <CardContent className="pt-6">
                        <p className="text-center text-red-500">{error || "College not found"}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100">
            {/* Banner Section */}
            <div className="relative">
                {college?.banner_image_url ? (
                    <div className="w-full h-72 bg-black">
                        <img
                            src={college.banner_image_url}
                            alt={college.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-full h-72 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
                )}

                <div className="absolute -bottom-16 left-10 transform hover:scale-105 transition-transform duration-300 ease-in-out">
                    {college?.logo_image_url ? (
                        <img
                            src={college.logo_image_url}
                            alt={college.name}
                            className="w-48 h-48 rounded-full border-4 border-white shadow-lg bg-white object-cover"
                        />
                    ) : (
                        <div className="w-48 h-48 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                            <GraduationCap size={64} className="text-gray-400" />
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 pt-20 pb-8">
                {/* College Header */}
                <div className="mb-8">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">{college.name}</h1>
                    
                    <div className="flex flex-wrap gap-4 text-gray-700 mb-6">
                        {college?.city && college?.state && (
                            <div className="flex items-center gap-2 font-medium">
                                <MapPin size={20} className="text-blue-600" />
                                <span className="text-base">{college.city}, {college.state}</span>
                            </div>
                        )}
                        {college?.established_year && (
                            <div className="flex items-center gap-2 font-medium">
                                <GraduationCap size={20} className="text-blue-600" />
                                <span className="text-base">Est. {college.established_year}</span>
                            </div>
                        )}
                    </div>

                    {/* College Info Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {college?.college_type && (
                            <Badge variant="secondary" className="px-3 py-1 text-sm">
                                {college.college_type}
                            </Badge>
                        )}
                        {college?.accreditation && (
                            <Badge className="bg-green-100 text-green-800 border-green-300 px-3 py-1 text-sm">
                                {college.accreditation}
                            </Badge>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-4 text-sm">
                        {college?.website_url && (
                            <a
                                href={college.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <Globe size={16} />
                                <span>Website</span>
                            </a>
                        )}
                        {college?.email && (
                            <a
                                href={`mailto:${college.email}`}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <Mail size={16} />
                                <span>{college.email}</span>
                            </a>
                        )}
                        {college?.phone && (
                            <a
                                href={`tel:${college.phone}`}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <Phone size={16} />
                                <span>{college.phone}</span>
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Academic Programs Section */}
                        {degrees.length > 0 && (
                            <Card className="border border-gray-200 shadow-md">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <BookOpen size={24} className="text-blue-600" />
                                            Degrees Offered ({degrees.length})
                                    </h2>
                                </div>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {degrees.map((degree, index) => (
                                            <div key={index} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-900">
                                                            {degree.degree_name || 'Degree Program'}
                                                        </h3>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Placements Section */}
                        {placements.length > 0 && (
                            <Card className="border border-gray-200 shadow-md">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <TrendingUp size={24} className="text-green-600" />
                                        Placement Statistics
                                    </h2>
                                </div>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {placements.map((placement, index) => (
                                            <div key={index} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <h3 className="font-bold text-lg text-gray-900 mb-3">{placement.academic_year}</h3>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {placement.placement_percent && (
                                                        <div className="bg-green-50 p-3 rounded-lg">
                                                            <p className="text-xs text-gray-600 font-medium">Placement Rate</p>
                                                            <p className="text-2xl font-bold text-green-600">{placement.placement_percent}%</p>
                                                        </div>
                                                    )}
                                                    {placement.average_package && (
                                                        <div className="bg-blue-50 p-3 rounded-lg">
                                                            <p className="text-xs text-gray-600 font-medium">Avg Package</p>
                                                            <p className="text-2xl font-bold text-blue-600">₹{placement.average_package} LPA</p>
                                                        </div>
                                                    )}
                                                    {placement.highest_package && (
                                                        <div className="bg-purple-50 p-3 rounded-lg">
                                                            <p className="text-xs text-gray-600 font-medium">Highest Package</p>
                                                            <p className="text-2xl font-bold text-purple-600">₹{placement.highest_package} LPA</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {placement.companies_visited && (
                                                    <p className="text-sm text-gray-600 mt-3">
                                                        <strong>Companies Visited:</strong> {placement.companies_visited}
                                                    </p>
                                                )}
                                                {placement.top_recruiters && (
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        <strong>Top Recruiters:</strong> {placement.top_recruiters}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Info Cards */}
                    <div className="space-y-6">
                        {/* Rankings Card */}
                        {rankings.length > 0 && (
                            <Card className="border border-gray-200 shadow-md">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                        <Award size={20} className="text-yellow-600" />
                                        Rankings
                                    </h3>
                                </div>
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        {rankings.map((ranking, index) => (
                                            <div key={index} className="pb-3 border-b border-gray-100 last:border-b-0">
                                                <p className="text-sm font-medium text-gray-600">{ranking.ranking_body}</p>
                                                <p className="text-xl font-bold text-blue-600">Rank #{ranking.rank_value}</p>
                                                <p className="text-xs text-gray-500">{ranking.category} • {ranking.year}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Address Card */}
                        <Card className="border border-gray-200 shadow-md">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                    <MapPin size={20} className="text-red-600" />
                                    Address
                                </h3>
                            </div>
                            <CardContent className="pt-6">
                                {college?.address && <p className="text-sm text-gray-700 mb-2">{college.address}</p>}
                                {college?.city && (
                                    <p className="text-sm text-gray-600">
                                        {college.city}{college.state ? `, ${college.state}` : ''}{college.zipcode ? ` - ${college.zipcode}` : ''}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
