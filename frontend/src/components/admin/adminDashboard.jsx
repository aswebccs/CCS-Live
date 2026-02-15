
import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Briefcase, CheckCircle, TrendingUp, GraduationCap, School, Building2, LogOut, LayoutDashboard, Settings, Bell, Search, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import UserTypePage from "./userTypePage"

const API_URL = import.meta.env.VITE_API_URL;

const CountUp = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime;
    let animationFrame;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;
      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  const formatted = count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toLocaleString();
  return <span>{formatted}{suffix}</span>;
};

const StatCard = ({ title, value, icon: Icon, color, percentage, subtitle, actionLabel, onClick, onActionClick }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100 group cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        {percentage && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
            +{percentage}%
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800 mb-1">
        <CountUp end={value} />
      </h3>
      {subtitle && <p className="text-xs text-gray-400 mb-3">{subtitle}</p>}
      {actionLabel && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onActionClick?.();
          }}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-all duration-200"
        >
          {actionLabel} <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// ... (UserTypeCard and RecentActivityItem remain exactly the same)

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showUserTypePage, setShowUserTypePage] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [todaySignups, setTodaySignups] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [activeJobs, setActiveJobs] = useState(0);
  const [jobFilter, setJobFilter] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [referralsLoading, setReferralsLoading] = useState(true);
  const [referralsError, setReferralsError] = useState('');
  const [signups, setSignups] = useState([]);
  const [signupsLoading, setSignupsLoading] = useState(true);
  const [signupsError, setSignupsError] = useState('');
  const [userTypeCounts, setUserTypeCounts] = useState({
    students: 0,
    schools: 0,
    colleges: 0,
    universities: 0,
    companies: 0,
  });

  // Handle navigation functions
  const navigateToUsers = () => {
    setActiveMenu('users');
    setShowUserTypePage(true);
  };

  const goToUsersFromTotalUsers = () => {
    setShowUserTypePage(true);
  };

  const handleBackToDashboard = useCallback(() => {
    setShowUserTypePage(false);
    setActiveMenu('dashboard');
  }, []);

  // Handle Backspace key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace' && showUserTypePage) {
        e.preventDefault();
        handleBackToDashboard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showUserTypePage, handleBackToDashboard]);

  useEffect(() => {
    let isMounted = true;

    const loadUserCount = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/users`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load users');
        }
        if (isMounted) {
          const users = Array.isArray(data?.users) ? data.users : [];
          const counts = {
            students: 0,
            schools: 0,
            colleges: 0,
            universities: 0,
            companies: 0,
          };

          users.forEach((user) => {
            const userType = Number(user?.user_type);
            if (userType === 3) counts.students += 1;
            else if (userType === 6) counts.schools += 1;
            else if (userType === 4) counts.colleges += 1;
            else if (userType === 5) counts.universities += 1;
            else if (userType === 7) counts.companies += 1;
          });

          setTotalUsers(users.length);
          setUserTypeCounts(counts);
        }
      } catch (error) {
       if (isMounted) {
          setTotalUsers(0);
          setUserTypeCounts({
            students: 0,
            schools: 0,
            colleges: 0,
            universities: 0,
            companies: 0,
          });
        }
      }
    };

    loadUserCount();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadJobsSummary = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/jobs/summary`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load job summary');
        }
        if (isMounted) {
          setTotalJobs(Number(data?.total) || 0);
          setActiveJobs(Number(data?.active) || 0);
        }
      } catch (error) {
        if (isMounted) {
          setTotalJobs(0);
          setActiveJobs(0);
        }
      }
    };

    loadJobsSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSignupSummary = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/signups/summary`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load signups');
        }
        if (isMounted) {
          setTodaySignups(Number(data?.total) || 0);
        }
      } catch (error) {
        if (isMounted) setTodaySignups(0);
      }
    };

    loadSignupSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadReferralSummary = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/referrals/summary`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load referrals');
        }
        if (isMounted) {
          setTotalReferrals(Number(data?.total) || 0);
        }
      } catch (error) {
        if (isMounted) setTotalReferrals(0);
      }
    };

    loadReferralSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadJobs = useCallback(async (signal) => {
    setJobsLoading(true);
    setJobsError('');
    try {
      const response = await fetch(`${API_URL}/admin/jobs`, {
        credentials: 'include',
        signal,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load jobs');
      }
      if (!signal?.aborted) {
        setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
      }
    } catch (error) {
      if (!signal?.aborted) {
        setJobs([]);
        setJobsError(error?.message || 'Failed to load jobs');
      }
    } finally {
      if (!signal?.aborted) setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeMenu === 'jobs') {
      const controller = new AbortController();
      loadJobs(controller.signal);
      return () => controller.abort();
    }
    return undefined;
  }, [activeMenu, loadJobs]);

  const loadReferrals = useCallback(async (signal) => {
    setReferralsLoading(true);
    setReferralsError('');
    try {
      const response = await fetch(`${API_URL}/admin/referrals`, {
        credentials: 'include',
        signal,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load referrals');
      }
      if (!signal?.aborted) {
        setReferrals(Array.isArray(data?.referrals) ? data.referrals : []);
      }
    } catch (error) {
      if (!signal?.aborted) {
        setReferrals([]);
        setReferralsError(error?.message || 'Failed to load referrals');
      }
    } finally {
      if (!signal?.aborted) setReferralsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeMenu === 'referrals') {
      const controller = new AbortController();
      loadReferrals(controller.signal);
      return () => controller.abort();
    }
    return undefined;
  }, [activeMenu, loadReferrals]);

  const loadSignups = useCallback(async (signal) => {
    setSignupsLoading(true);
    setSignupsError('');
    try {
      const response = await fetch(`${API_URL}/admin/signups`, {
        credentials: 'include',
        signal,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load signups');
      }
      if (!signal?.aborted) {
        setSignups(Array.isArray(data?.signups) ? data.signups : []);
      }
    } catch (error) {
      if (!signal?.aborted) {
        setSignups([]);
        setSignupsError(error?.message || 'Failed to load signups');
      }
    } finally {
      if (!signal?.aborted) setSignupsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeMenu === 'signups') {
      const controller = new AbortController();
      loadSignups(controller.signal);
      return () => controller.abort();
    }
    return undefined;
  }, [activeMenu, loadSignups]);

  const handleNavigate = useCallback((menu) => {
    setActiveMenu(menu);
    setShowUserTypePage(false);
  }, []);

  const filteredJobs = jobFilter === 'active'
    ? jobs.filter((job) => String(job.status).toLowerCase() === 'published')
    : jobs;

  // Show UserTypePage
  if (showUserTypePage) {
    return <UserTypePage onBack={handleBackToDashboard} onNavigate={handleNavigate} />;
  }


  return (
    <div className="min-h-screen bg-gray-50 flex">
     

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {activeMenu === 'jobs' ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Job Postings</h1>
                <p className="text-gray-500">All jobs created by companies and employees.</p>
              </div>

              <div className="max-w-5xl mx-auto space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">
                      {jobFilter === 'active' ? 'Active Job Posts' : 'All Job Posts'} ({filteredJobs.length})
                    </h3>
                  </div>
                  <div className="px-6 py-4 space-y-4">
                    {jobsLoading && <p className="text-gray-500">Loading jobs...</p>}

                    {!jobsLoading && filteredJobs.length === 0 && !jobsError && (
                      <p className="text-gray-500">No job posts created yet.</p>
                    )}

                    {jobsError && (
                      <p className="text-red-600">{jobsError}</p>
                    )}

                    {filteredJobs.map((job) => (
                      <div
                        key={job.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div>
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <p className="text-sm text-gray-500">
                            Status: <span className="capitalize">{job.status}</span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(job.created_at).toLocaleDateString()}
                          </p>
                          {job.company_name && (
                            <p className="text-sm text-gray-500">Company: {job.company_name}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : activeMenu === 'referrals' ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Referrals</h1>
                <p className="text-gray-500">Users who registered with a referral code.</p>
              </div>

              <div className="max-w-6xl mx-auto space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">All Referrals ({referrals.length})</h3>
                  </div>
                  <div className="px-6 py-4 space-y-4">
                    {referralsLoading && <p className="text-gray-500">Loading referrals...</p>}

                    {!referralsLoading && referrals.length === 0 && !referralsError && (
                      <p className="text-gray-500">No referrals found yet.</p>
                    )}

                    {referralsError && (
                      <p className="text-red-600">{referralsError}</p>
                    )}

                    {!referralsLoading && referrals.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500 border-b">
                              <th className="py-2 pr-4 font-medium">User</th>
                              <th className="py-2 pr-4 font-medium">Email</th>
                              <th className="py-2 pr-4 font-medium">Referral Code</th>
                              <th className="py-2 pr-4 font-medium">Referred By</th>
                              <th className="py-2 pr-4 font-medium">Registered</th>
                            </tr>
                          </thead>
                          <tbody>
                            {referrals.map((ref) => (
                              <tr key={ref.id} className="border-b last:border-b-0">
                                <td className="py-3 pr-4 text-gray-800 font-medium">{ref.name}</td>
                                <td className="py-3 pr-4 text-gray-600">{ref.email}</td>
                                <td className="py-3 pr-4 text-gray-800 font-mono">{ref.referral_code}</td>
                                <td className="py-3 pr-4 text-gray-600">
                                  {ref.referrer_name ? `${ref.referrer_name} (${ref.referrer_type})` : "Unknown"}
                                </td>
                                <td className="py-3 pr-4 text-gray-600">
                                  {ref.created_at ? new Date(ref.created_at).toLocaleDateString() : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : activeMenu === 'signups' ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Today Signups</h1>
                <p className="text-gray-500">Users who registered today.</p>
              </div>

              <div className="max-w-6xl mx-auto space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">All Signups ({signups.length})</h3>
                  </div>
                  <div className="px-6 py-4 space-y-4">
                    {signupsLoading && <p className="text-gray-500">Loading signups...</p>}

                    {!signupsLoading && signups.length === 0 && !signupsError && (
                      <p className="text-gray-500">No signups found today.</p>
                    )}

                    {signupsError && (
                      <p className="text-red-600">{signupsError}</p>
                    )}

                    {!signupsLoading && signups.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500 border-b">
                              <th className="py-2 pr-4 font-medium">User</th>
                              <th className="py-2 pr-4 font-medium">Email</th>
                              <th className="py-2 pr-4 font-medium">User Type</th>
                              <th className="py-2 pr-4 font-medium">Status</th>
                              <th className="py-2 pr-4 font-medium">Registered</th>
                            </tr>
                          </thead>
                          <tbody>
                            {signups.map((user) => (
                              <tr key={user.id} className="border-b last:border-b-0">
                                <td className="py-3 pr-4 text-gray-800 font-medium">{user.name}</td>
                                <td className="py-3 pr-4 text-gray-600">{user.email}</td>
                                <td className="py-3 pr-4 text-gray-600">{user.user_type}</td>
                                <td className="py-3 pr-4 text-gray-600">{user.status ? 'Active' : 'Inactive'}</td>
                                <td className="py-3 pr-4 text-gray-600">
                                  {user.created_at ? new Date(user.created_at).toLocaleString() : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
                <p className="text-gray-500">Monitor and manage your platform efficiently</p>
              </div>

              {/* TOTAL USERS CARD - Click to navigate to UserTypePage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard
                  title="Total Users"
                  value={totalUsers}
                  icon={Users}
                  color="bg-blue-500"
                  subtitle="All registered users"
                  actionLabel="View all users"
                  onClick={goToUsersFromTotalUsers}  // ← NAVIGATES TO USERTYPEPAGE
                />

                {/* Other stat cards unchanged */}
                <StatCard
                  title="Today Signups"
                  value={todaySignups}
                  icon={UserPlus}
                  color="bg-emerald-500"
                  subtitle="New registrations"
                  actionLabel="View signups"
                  onClick={() => setActiveMenu('signups')}
                />
                <StatCard
                  title="Total Jobs"
                  value={totalJobs}
                  icon={Briefcase}
                  color="bg-purple-500"
                  subtitle="All jobs posted"
                  actionLabel="Manage jobs"
                  onClick={() => {
                    setJobFilter('all');
                    setActiveMenu('jobs');
                  }}
                  onActionClick={() => {
                    setJobFilter('all');
                    setActiveMenu('jobs');
                  }}
                />
                <StatCard
                  title="Active Jobs"
                  value={activeJobs}
                  icon={CheckCircle}
                  color="bg-amber-500"
                  subtitle="Currently active"
                  actionLabel="View active"
                  onClick={() => {
                    setJobFilter('active');
                    setActiveMenu('jobs');
                  }}
                  onActionClick={() => {
                    setJobFilter('active');
                    setActiveMenu('jobs');
                  }}
                />
                <StatCard
                  title="Total Referrals"
                  value={totalReferrals}
                  icon={TrendingUp}
                  color="bg-rose-500"
                  subtitle="Successful referrals"
                  actionLabel="View referrals"
                  onClick={() => setActiveMenu('referrals')}
                />
                <StatCard
                  title="Events"
                  value={0}
                  icon={Calendar}
                  color="bg-indigo-500"
                  subtitle="All events created"
                  actionLabel="View events"
                />
              </div>

              {/* Rest of dashboard unchanged */}
              {/* ... User Types, Recent Activity sections remain exactly the same ... */}

              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Users by Category</h2>
                 
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[
                    { type: 'Students', count: userTypeCounts.students, icon: GraduationCap, color: 'bg-blue-500' },
                    { type: 'Schools', count: userTypeCounts.schools, icon: School, color: 'bg-purple-500' },
                    { type: 'Colleges', count: userTypeCounts.colleges, icon: Building2, color: 'bg-teal-500' },
                    { type: 'Universities', count: userTypeCounts.universities, icon: Building2, color: 'bg-amber-500' },
                    { type: 'Companies', count: userTypeCounts.companies, icon: Briefcase, color: 'bg-rose-500' }
                  ].map((userType, index) => (
                    <UserTypeCard
                      key={index}
                      type={userType.type}
                      count={userType.count}
                      icon={userType.icon}
                      color={userType.color}
                    />
                  ))}
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Add UserTypeCard and RecentActivityItem components here (same as your original)
const UserTypeCard = ({ type, count, icon: Icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-0.5">{type}</p>
          <h4 className="text-2xl font-bold text-gray-800">
            <CountUp end={count} />
          </h4>
        </div>
      </div>
    </div>
  );
};
