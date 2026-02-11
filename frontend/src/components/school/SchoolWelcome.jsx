import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function SchoolWelcome() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [statesLoading, setStatesLoading] = useState(false);
    const [citiesLoading, setCitiesLoading] = useState(false);
    const [formData, setFormData] = useState({
        state: "",
        city: "",
        address: "",
        zipcode: "",
        phone: "",
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        const type = localStorage.getItem("userType");

        if (!token) {
            navigate("/login");
            return;
        }

        // Only allow school users (type 6)
        if (parseInt(type) !== 6) {
            navigate("/dashboard");
            return;
        }
    }, [navigate]);

    useEffect(() => {
        let isMounted = true;

        const loadStates = async () => {
            setStatesLoading(true);
            try {
                const response = await fetch(`${API_URL}/geo/states`);
                const data = await response.json();
                if (response.ok && Array.isArray(data.states)) {
                    if (isMounted) setStates(data.states);
                } else {
                    toast.error("Failed to load states");
                }
            } catch (error) {
                toast.error("Failed to load states");
            } finally {
                if (isMounted) setStatesLoading(false);
            }
        };

        loadStates();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        const selectedState = formData.state;
        if (!selectedState) {
            setCities([]);
            return;
        }

        let isMounted = true;

        const loadCities = async () => {
            setCitiesLoading(true);
            try {
                const response = await fetch(`${API_URL}/geo/cities?state=${encodeURIComponent(selectedState)}&limit=200`);
                const data = await response.json();
                if (response.ok && Array.isArray(data.cities)) {
                    if (isMounted) setCities(data.cities);
                } else {
                    if (isMounted) setCities([]);
                    toast.error("Failed to load cities");
                }
            } catch (error) {
                if (isMounted) setCities([]);
                toast.error("Failed to load cities");
            } finally {
                if (isMounted) setCitiesLoading(false);
            }
        };

        loadCities();

        return () => {
            isMounted = false;
        };
    }, [formData.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.state || !formData.city || !formData.address || !formData.zipcode || !formData.phone) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/school`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("School profile completed successfully!");
                navigate("/dashboard");
            } else {
                toast.error(data.message || "Failed to save school information");
            }
        } catch (error) {
            console.error("School welcome form error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === "state" && { city: "" }) // Reset city when state changes
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to CCS! 🎉</h1>
                    <p className="text-gray-600">Let's complete your school profile to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* LOCATION SECTION */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                                        State <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="state"
                                        name="state"
                                        required
                                        value={formData.state}
                                        onChange={handleChange}
                                        disabled={statesLoading}
                                        className="w-full mt-1.5 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select state</option>
                                        {states.map((state) => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                                        City <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="city"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        disabled={!formData.state || citiesLoading}
                                        className="w-full mt-1.5 border border-gray-300 rounded-lg p-2.5 disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select city</option>
                                        {formData.state && cities.map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                                    Address <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="address"
                                    name="address"
                                    type="text"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter complete school address"
                                    className="mt-1.5"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="zipcode" className="text-sm font-medium text-gray-700">
                                        Zipcode <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="zipcode"
                                        name="zipcode"
                                        type="text"
                                        required
                                        value={formData.zipcode}
                                        onChange={handleChange}
                                        placeholder="e.g., 110001"
                                        className="mt-1.5"
                                        maxLength={6}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                        Phone Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="e.g., +91 9876543210"
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                    >
                        {loading ? "Saving..." : "Continue"}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    All fields marked with <span className="text-red-500">*</span> are required to access your dashboard
                </p>
            </div>
        </div>
    );
}
