import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
    User, 
    MapPin, 
    Calendar, 
    Mail,
    GraduationCap,
    Briefcase,
    Award,
    Code,
    FileText,
    CheckCircle,
    Building2,
    ExternalLink
} from "lucide-react";

export default function StudentPublicProfile() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [education, setEducation] = useState([]);
    const [experience, setExperience] = useState([]);
    const [skills, setSkills] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStudentProfile();
    }, [id]);

    const fetchStudentProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/student/public/${id}`);
            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                setProfile(data.profile);
                setEducation(data.education || []);
                setExperience(data.experience || []);
                setSkills(data.skills || []);
                setCertifications(data.certifications || []);
            } else {
                setError(data.message || "Profile not found");
            }
        } catch (err) {
            setError("Failed to load profile");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading profile...</div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="max-w-md">
                    <CardContent className="pt-6">
                        <p className="text-center text-red-500">{error || "Profile not found"}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100">
            {/* Banner Section */}
            <div className="relative">
                {profile?.banner_image_url ? (
                    <div className="w-full h-72 bg-black">
                        <img
                            src={profile.banner_image_url}
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-full h-72 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                )}

                <div className="absolute -bottom-16 left-10 transform hover:scale-105 transition-transform duration-300 ease-in-out">
                    {profile?.profile_image_url ? (
                        <img
                            src={profile.profile_image_url}
                            alt={user.name}
                            className="w-48 h-48 rounded-full border-4 border-white shadow-lg bg-white object-cover"
                        />
                    ) : (
                        <div className="w-48 h-48 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                            <User size={64} className="text-gray-400" />
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 pt-20 pb-8">
                {/* Profile Header */}
                <div className="mb-8">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">{user.name}</h1>
                    
                    <div className="flex flex-wrap gap-4 text-gray-700 mb-6">
                        {profile?.city && profile?.state && (
                            <div className="flex items-center gap-2 font-medium">
                                <MapPin size={20} className="text-blue-600" />
                                <span className="text-base">{profile.city}, {profile.state}</span>
                            </div>
                        )}
                        {profile?.phone && (
                            <div className="flex items-center gap-2 font-medium">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-base">{profile.phone}</span>
                            </div>
                        )}
                        {profile?.dob && (
                            <div className="flex items-center gap-2 font-medium">
                                <Calendar size={20} className="text-blue-600" />
                                <span className="text-base">Born {formatDate(profile.dob)}</span>
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    {profile?.bio && (
                        <p className="text-gray-700 text-base leading-relaxed max-w-3xl">{profile.bio}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Education Section */}
                        {education.length > 0 && (
                            <Card className="border-2 border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <GraduationCap size={24} className="text-blue-600" />
                                        Education
                                    </CardTitle>
                                    <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {education.map((edu, index) => (
                                            <div
                                                key={index}
                                                className="border-2 border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-xl text-gray-900 mb-1">
                                                            {edu.degree}
                                                            {edu.field_of_study && (
                                                                <span className="text-gray-600 font-normal"> in {edu.field_of_study}</span>
                                                            )}
                                                        </h3>
                                                        <p className="text-base text-gray-700 font-medium flex items-center gap-2">
                                                            <Building2 size={16} className="text-blue-600" />
                                                            {edu.institution}
                                                        </p>
                                                    </div>
                                                    {edu.is_current && (
                                                        <Badge className="bg-green-100 text-green-800 border-green-300">
                                                            Current
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                                                    <Calendar size={16} className="text-gray-500" />
                                                    <span className="font-medium">
                                                        {edu.start_year} - {edu.is_current ? "Present" : edu.end_year || "N/A"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Experience Section */}
                        {experience.length > 0 && (
                            <Card className="border-2 border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <Briefcase size={24} className="text-purple-600" />
                                        Work Experience
                                    </CardTitle>
                                    <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mt-2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {experience.map((exp, index) => (
                                            <div
                                                key={index}
                                                className="border-2 border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-purple-200 transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-xl text-gray-900 mb-1">{exp.title}</h3>
                                                        <p className="text-base text-gray-700 font-medium flex items-center gap-2">
                                                            <Building2 size={16} className="text-purple-600" />
                                                            {exp.company}
                                                        </p>
                                                    </div>
                                                    {exp.is_current && (
                                                        <Badge className="bg-green-100 text-green-800 border-green-300">
                                                            Current
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-3 mb-3">
                                                    <Calendar size={16} className="text-gray-500" />
                                                    <span className="font-medium">
                                                        {formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                                    </span>
                                                </div>
                                                {exp.description && (
                                                    <p className="text-sm text-gray-700 leading-relaxed mt-3 pt-3 border-t border-gray-200">
                                                        {exp.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Certifications Section */}
                        {certifications.length > 0 && (
                            <Card className="border-2 border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <Award size={24} className="text-yellow-600" />
                                        Certifications
                                    </CardTitle>
                                    <div className="h-1 w-20 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full mt-2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {certifications.map((cert, index) => (
                                            <div
                                                key={index}
                                                className="border-2 border-gray-100 rounded-xl p-4 hover:shadow-lg hover:border-yellow-200 transition-all duration-200 bg-gradient-to-br from-white to-yellow-50"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Award size={20} className="text-yellow-600 mt-1 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-base text-gray-900 mb-1">{cert.name}</h4>
                                                        <p className="text-sm text-gray-700 font-medium mb-2">
                                                            {cert.issuing_organization}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                                            <Calendar size={14} />
                                                            <span>Issued {formatDate(cert.issue_date)}</span>
                                                        </div>
                                                        {cert.credential_id && (
                                                            <p className="text-xs text-gray-600 mb-2">
                                                                <span className="font-semibold">ID:</span> {cert.credential_id}
                                                            </p>
                                                        )}
                                                        {cert.credential_url && (
                                                            <a
                                                                href={cert.credential_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                            >
                                                                <ExternalLink size={12} />
                                                                View Certificate
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Skills & Contact */}
                    <div className="space-y-6">
                        {/* Contact Card */}
                        <Card className="border-2 border-blue-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex font-bold text-xl items-center gap-2 text-gray-900">
                                    <Mail size={22} className="text-blue-600" />
                                    Contact Information
                                </CardTitle>
                                <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2"></div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {user.email && (
                                    <a
                                        href={`mailto:${user.email}`}
                                        className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-100"
                                    >
                                        <Mail size={18} className="text-blue-600" />
                                        <span className="text-sm text-gray-700 font-medium break-all">{user.email}</span>
                                    </a>
                                )}
                            </CardContent>
                        </Card>

                        {/* Location Card */}
                        {(profile?.city || profile?.state) && (
                            <Card className="border-2 border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex font-bold text-xl items-center gap-2 text-gray-900">
                                        <MapPin size={22} className="text-blue-600" />
                                        Location
                                    </CardTitle>
                                    <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2"></div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-gray-700 font-medium">
                                        {[profile.city, profile.state].filter(Boolean).join(", ")}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Skills Card */}
                        {skills.length > 0 && (
                            <Card className="border-2 border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 font-bold text-xl text-gray-900">
                                        <Code size={22} className="text-blue-600" />
                                        Skills
                                    </CardTitle>
                                    <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, index) => (
                                            <Badge
                                                key={index}
                                                variant="outline"
                                                className="text-sm px-4 py-1.5 font-semibold border-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                            >
                                                {skill.skill_name}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Info */}
                        <Card className="border-2 border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                            <CardHeader className="pb-3">
                                <CardTitle className="font-bold text-xl text-gray-900">Profile Summary</CardTitle>
                                <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2"></div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {education.length > 0 && (
                                    <div className="border-l-4 border-blue-500 pl-3 py-1">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Education</p>
                                        <p className="font-semibold text-base text-gray-900">{education.length} {education.length === 1 ? 'Entry' : 'Entries'}</p>
                                    </div>
                                )}
                                {experience.length > 0 && (
                                    <div className="border-l-4 border-purple-500 pl-3 py-1">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Experience</p>
                                        <p className="font-semibold text-base text-gray-900">{experience.length} {experience.length === 1 ? 'Position' : 'Positions'}</p>
                                    </div>
                                )}
                                {skills.length > 0 && (
                                    <div className="border-l-4 border-green-500 pl-3 py-1">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Skills</p>
                                        <p className="font-semibold text-base text-gray-900">{skills.length} {skills.length === 1 ? 'Skill' : 'Skills'}</p>
                                    </div>
                                )}
                                {certifications.length > 0 && (
                                    <div className="border-l-4 border-yellow-500 pl-3 py-1">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Certifications</p>
                                        <p className="font-semibold text-base text-gray-900">{certifications.length} {certifications.length === 1 ? 'Certificate' : 'Certificates'}</p>
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
