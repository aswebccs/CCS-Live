import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

/* Auth Pages */
import Register from "./components/Register";
import Login from "./components/Login";
import VerifyEmail from "./components/VerifyEmail";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Welcome from "./components/Welcome";
import UniversityWelcome from "./components/university/UniversityWelcome";
import SchoolWelcome from "./components/school/SchoolWelcome";

/* Dashboard */
import Dashboard from "./components/Dashboard";

/* Profile Pages (already created by you) */
import StudentProfile from "./components/student/StudentProfile";
import SchoolProfile from "./components/school/SchoolProfile";
import CollegeProfile from "./components/college/CollegeProfile";
import CollegePublicProfile from "./components/college/CollegePublicProfile";
import UniversityProfile from "./components/university/UniversityProfile";
import CompanyProfile from "./components/company/CompanyProfile";
import CompanyPublicProfile from "./components/company/CompanyPublicProfile";
import StudentPublicProfile from "./components/student/StudentPublicProfile";
import SchoolPublicProfile from "./components/school/SchoolPublicProfile";
import CompanyPosts from "./components/company/CompanyPosts";
import StudentJobs from "./components/student/Jobs";
import ApplyJob from "./components/student/ApplyJob";
import CompanyJobDetail from "./components/company/CompanyJobDetail";
import PublicJobPage from "./components/publicJobPage";
/* Admin Pages */
import AdminDashboard from "./components/admin/adminDashboard";
import AdminLayout from "./components/admin/AdminLayout";
import UserListPage from "./components/admin/userTypePage";

import StudentAppliedJobs from "./components/student/StudentAppliedJobs";
import AppliedJobDetails from "./components/student/AppliedJobDetails";
import ApplicantDetail from "./components/company/ApplicantDetail";
/* Skill Test Pages - CATEGORY-BASED */
import SkillTestCategories from "./components/student/exam/SkillTestSimplified.jsx";
import SkillTestInstructions from "./components/student/exam/SkillTestInstructions_ModuleBased";
import SkillTest from "./components/student/exam/SkillTestModular";
import SkillTestResult from "./components/student/exam/Skilltestresult";

/* Admin - Exam Management */
import ExamManagement from "./components/admin/ExamManagement/ExamManagement";
import Category from "./components/admin/ExamManagement/Category";
import Subcategory from "./components/admin/ExamManagement/Subcategory";

import Exam from "./components/admin/ExamManagement/Exam";
import Questions from "./components/admin/ExamManagement/Questions";
/* ---------------- Route Guards ---------------- */

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" replace /> : children;
}

/* ---------------- App ---------------- */

function App() {
  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* Public routes */}
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Welcome screen - After first login/signup */}
        <Route
          path="/welcome"
          element={
            <PrivateRoute>
              <Welcome />
            </PrivateRoute>
          }
        />

        <Route
          path="/welcome/university"
          element={
            <PrivateRoute>
              <UniversityWelcome />
            </PrivateRoute>
          }
        />

        <Route
          path="/welcome/school"
          element={
            <PrivateRoute>
              <SchoolWelcome />
            </PrivateRoute>
          }
        />

        {/*Bellow two are lines added by me */}
        {/* Public Company Profile - No Authentication Required */}
        <Route path="/company/:id" element={<CompanyPublicProfile />} />
        <Route path="/college/:id" element={<CollegePublicProfile />} />
        <Route path="/student/:id" element={<StudentPublicProfile />} />
        <Route path="/school/check" element={<SchoolPublicProfile />} />
        {/* <Route path="/company/check" element={<CompanyPublicProfile />} /> */}


        {/* Dashboard (single entry after login) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Profile routes (navigated via Profile button) */}
        <Route
          path="/profile/student"
          element={
            <PrivateRoute>
              <StudentProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile/school"
          element={
            <PrivateRoute>
              <SchoolProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile/college"
          element={
            <PrivateRoute>
              <CollegeProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile/university"
          element={
            <PrivateRoute>
              <UniversityProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile/company"
          element={
            <PrivateRoute>
              <CompanyProfile />
            </PrivateRoute>
          }
        />
        {/* Company posts (create & manage) */}
        <Route
          path="/company/posts"
          element={
            <PrivateRoute>
              <CompanyPosts />
            </PrivateRoute>
          }
        />
        {/* Student Jobs Page */}
        <Route
          path="/jobs"
          element={
            <PrivateRoute>
              <StudentJobs />
            </PrivateRoute>
          }
        />
        {/* Apply Job Page */}
        <Route
          path="/jobs/apply/:jobId"
          element={
            <PrivateRoute>
              <ApplyJob />
            </PrivateRoute>
          }
        />
        {/* Company Job Detail Page */}
        <Route
          path="/company/posts/:postId"
          element={
            <PrivateRoute>
              <CompanyJobDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/applied-jobs"
          element={
            <PrivateRoute>
              <StudentAppliedJobs />
            </PrivateRoute>
          }
        />

        <Route
          path="/jobs/applied/:applicationId"
          element={
            <PrivateRoute>
              <AppliedJobDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/company/posts/:postId/applicant/:applicationId"
          element={
            <PrivateRoute>
              <ApplicantDetail />
            </PrivateRoute>
          }
        />

        {/* Main page - Shows categories with expandable tests */}
        <Route
          path="/student/skill-test"
          element={
            <PrivateRoute>
              <SkillTestCategories />
            </PrivateRoute>
          }
        />

        {/* Individual test instructions page */}
        <Route
          path="/student/skill-test/:testId"
          element={
            <PrivateRoute>
              <SkillTestInstructions />
            </PrivateRoute>
          }
        />

        {/* Test taking page */}
        <Route
          path="/student/skill-test/:testId/take"
          element={
            <PrivateRoute>
              <SkillTest />
            </PrivateRoute>
          }
        />

        {/* Result page */}
        <Route
          path="/student/skill-test/result"
          element={
            <PrivateRoute>
              <SkillTestResult />
            </PrivateRoute>
          }
        />
        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        {/* User Management */}
        <Route
          path="/userTypePage"
          element={
            <PrivateRoute>
              <AdminLayout>
                <UserListPage />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        {/* ⭐ NEW: Exam Management Routes */}

        {/* Main Exam Management Container (All 5 steps handled internally) */}
        <Route
          path="/admin/exam-management"
          element={
            <PrivateRoute>
              <AdminLayout>
                <ExamManagement />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        {/* Optional: Individual step routes (if you want direct access) */}
        <Route
          path="/admin/exam-management/category"
          element={
            <PrivateRoute>
              <AdminLayout>
                <Category />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/exam-management/subcategory"
          element={
            <PrivateRoute>
              <AdminLayout>
                <Subcategory />
              </AdminLayout>
            </PrivateRoute>
          }
        />


        <Route
          path="/admin/exam-management/exam"
          element={
            <PrivateRoute>
              <AdminLayout>
                <Exam />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/exam-management/questions"
          element={
            <PrivateRoute>
              <AdminLayout>
                <Questions />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/company/jobs"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
