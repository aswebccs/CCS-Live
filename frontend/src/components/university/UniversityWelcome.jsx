import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { STATES_AND_CITIES } from "../data/statesAndCities";

const API_URL = import.meta.env.VITE_API_URL;

export default function UniversityWelcome() {
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
        const type = Number(localStorage.getItem("userType"));

        if (!token) {
            navigate("/login");
            return;
        }

        if (type !== 5) {
            navigate("/welcome");
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
                } else if (isMounted) {
                    setStates(Object.keys(STATES_AND_CITIES));
                }
            } catch (error) {
                if (isMounted) setStates(Object.keys(STATES_AND_CITIES));
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
                } else if (isMounted) {
                    setCities(STATES_AND_CITIES[selectedState] || []);
                }
            } catch (error) {
                if (isMounted) setCities(STATES_AND_CITIES[selectedState] || []);
            } finally {
                if (isMounted) setCitiesLoading(false);
            }
        };

        loadCities();

        return () => {
            isMounted = false;
        };
    }, [formData.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "state" && { city: "" }),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/welcome`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("University profile completed successfully!");
                navigate("/dashboard");
            } else {
                toast.error(data.message || "Failed to save information");
            }
        } catch (error) {
            console.error("University welcome form error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome, University! 🎓</h1>
                    <p className="text-gray-600">Let’s complete your university profile to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                            placeholder="Enter university address"
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

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg font-semibold"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Complete Profile"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
