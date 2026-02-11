import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BookOpen } from "lucide-react";


// const BACKEND_URL = "http://localhost:5000";
const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const goToSkillTests = () => {
    navigate("/student/skill-test");
  };

  const navigate = useNavigate();
  const userType = Number(localStorage.getItem("user_type"));
  const token = localStorage.getItem("token");

  /* ================= ADMIN REDIRECT ================= */
  useEffect(() => {
    if (userType === 1 || userType === 2) {
      navigate("/admin-dashboard");
    }
  }, [userType, navigate]);

  /* ================= STATES ================= */
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* ================= PROFILE ================= */
  const goToProfile = () => {
    if (userType === 3) navigate("/profile/student");
    else if (userType === 6) navigate("/profile/school");
    else if (userType === 4) navigate("/profile/college");
    else if (userType === 5) navigate("/profile/university");
    else if (userType === 7) navigate("/profile/company");
  };

  /* ================= FETCH COMPANY JOBS ================= */
  useEffect(() => {
    if (userType === 7) {
      fetchCompanyJobs();
    }
  }, [userType]);

  const fetchCompanyJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/company/publish`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("FETCH JOBS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE JOB ================= */
  const deleteJob = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      await fetch(`${API_URL}/company/publish/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobs((prev) => prev.filter((job) => job.id !== postId));
    } catch (err) {
      console.error("DELETE JOB ERROR:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 space-y-8">

      {/* ================= DASHBOARD HEADERS ================= */}
      <div className="text-center space-y-2">
        {userType === 3 && (
          <>
            <h1 className="text-3xl font-bold">🎓 Student Dashboard</h1>
            <p className="text-gray-600">
              Welcome! View your learning progress and activities.
            </p>
          </>
        )}

        {userType === 6 && (
          <>
            <h1 className="text-3xl font-bold">🏫 School Dashboard</h1>
            <p className="text-gray-600">
              Manage school operations and students.
            </p>
          </>
        )}

        {userType === 4 && (
          <>
            <h1 className="text-3xl font-bold">🎓 College Dashboard</h1>
            <p className="text-gray-600">
              Handle college departments and admissions.
            </p>
          </>
        )}

        {userType === 5 && (
          <>
            <h1 className="text-3xl font-bold">🏛️ University Dashboard</h1>
            <p className="text-gray-600">
              University administration and analytics.
            </p>
          </>
        )}

        {userType === 7 && (
          <>
            <h1 className="text-3xl font-bold">🏢 Company Dashboard</h1>
            <p className="text-gray-600">
              Manage jobs and recruitment process.
            </p>
          </>
        )}
      </div>

      {/* ================= COMPANY JOB LIST ================= */}
      {userType === 7 && (
        <div className="max-w-5xl mx-auto space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Job Posts</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {loading && <p className="text-gray-500">Loading jobs...</p>}

              {!loading && jobs.length === 0 && (
                <p className="text-gray-500">No job posts created yet.</p>
              )}

              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_URL}/company/publish/${job.id}`, {
                        method: "GET",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });

                      if (!res.ok) throw new Error("Failed to fetch job details");

                      const data = await res.json();

                      // You can store the job details in localStorage, state, or context
                      localStorage.setItem("selectedJob", JSON.stringify(data));

                      // Navigate to frontend route for job details
                      navigate(`/company/posts/${job.id}`);
                    } catch (err) {
                      console.error("Error fetching job details:", err);
                      alert("Failed to load job details");
                    }
                  }}
                >
                  <div>
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <p className="text-sm text-gray-500">
                      Status: <span className="capitalize">{job.status}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= ACTION BUTTONS ================= */}
      <div className="flex justify-center gap-4">
        {userType !== 1 && userType !== 2 && (
          <Button onClick={goToProfile}>Profile</Button>
        )}
        {/* STUDENT JOBS BUTTON */}
        {userType === 3 && (
          <>
            <Button
              onClick={() => navigate("/jobs")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Jobs
            </Button>

            {/* ✅ MY APPLIED JOBS BUTTON */}
            <Button
              onClick={() => navigate("/student/applied-jobs")}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              My Applied Jobs
            </Button>
            <Button
              onClick={goToSkillTests}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            >
              <BookOpen size={16} />
              Take Skill Tests
            </Button>
          </>
        )}


        {userType === 7 && (
          <Button
            onClick={() => navigate("/company/posts")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Create Job
          </Button>
        )}

        {userType !== 1 && userType !== 2 && (
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}
