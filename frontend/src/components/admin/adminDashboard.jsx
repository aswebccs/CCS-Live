import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Briefcase, CheckCircle, TrendingUp, GraduationCap, School, Building2, LogOut, LayoutDashboard, Settings, Bell, Search, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import UserTypePage from "./userTypePage"

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

const StatCard = ({ title, value, icon: Icon, color, percentage, subtitle, actionLabel, onClick }) => {
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
        <div className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-all duration-200">
          {actionLabel} <ArrowRight className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

// ... (UserTypeCard and RecentActivityItem remain exactly the same)

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserTypePage, setShowUserTypePage] = useState(false);

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

  // Show UserTypePage
  if (showUserTypePage) {
    return <UserTypePage onBack={handleBackToDashboard} />;
  }

  // ... (stats, recentActivities, handleLogout remain exactly the same)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Users button navigates to UserTypePage */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 hidden md:block`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className={`text-xl font-bold text-gray-800 ${!sidebarOpen && 'hidden'}`}>Admin Panel</h1>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveMenu('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeMenu === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">Dashboard</span>}
            </button>

            {/* USERS BUTTON - Navigate to UserTypePage */}
            <button
              onClick={navigateToUsers}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeMenu === 'users' ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-200' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">Users</span>}
            </button>

            {/* Rest of sidebar unchanged */}
            <button onClick={() => setActiveMenu('jobs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeMenu === 'jobs' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Briefcase className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">Job Postings</span>}
            </button>
            
            <button onClick={() => setActiveMenu('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeMenu === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Settings className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">Settings</span>}
            </button>

            <button onClick={() => window.location.href = '/login'} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 mt-4">
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Header - unchanged */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search users, jobs..."
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
            <p className="text-gray-500">Monitor and manage your platform efficiently</p>
          </div>

          {/* TOTAL USERS CARD - Click to navigate to UserTypePage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={15420}
              icon={Users}
              color="bg-blue-500"
              percentage={12}
              subtitle="All registered users"
              actionLabel="View all users"
              onClick={goToUsersFromTotalUsers}  // ← NAVIGATES TO USERTYPEPAGE
            />
            
            {/* Other stat cards unchanged */}
            <StatCard title="Today Signups" value={245} icon={UserPlus} color="bg-emerald-500" percentage={18} subtitle="New registrations" actionLabel="View signups" />
            <StatCard title="Total Job Postings" value={3567} icon={Briefcase} color="bg-purple-500" percentage={15} subtitle="All jobs posted" actionLabel="Manage jobs" />
            <StatCard title="Active Jobs" value={892} icon={CheckCircle} color="bg-amber-500" percentage={7} subtitle="Currently active" actionLabel="View active" />
            <StatCard title="Total Referrals" value={8923} icon={TrendingUp} color="bg-rose-500" percentage={22} subtitle="Successful referrals" actionLabel="View referrals" />
          </div>

          {/* Rest of dashboard unchanged */}
          {/* ... User Types, Recent Activity sections remain exactly the same ... */}
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Users by Category</h2>
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm">
                Manage Categories
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {[
                { type: 'Students', count: 11690, icon: GraduationCap, color: 'bg-blue-500' },
                { type: 'Schools', count: 156, icon: School, color: 'bg-purple-500' },
                { type: 'Colleges', count: 1850, icon: Building2, color: 'bg-teal-500' },
                { type: 'Universities', count: 2890, icon: Building2, color: 'bg-amber-500' },
                { type: 'Companies', count: 766, icon: Briefcase, color: 'bg-rose-500' }
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

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
                <span className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">View all →</span>
              </div>
              <div className="space-y-4">
                {[
                  { action: 'New company registered', user: 'Microsoft Corp', time: '10 min ago', color: 'bg-emerald-500' },
                  { action: 'Job posting published', user: 'Google LLC', time: '25 min ago', color: 'bg-blue-500' },
                  { action: 'New user signup', user: 'Emily Davis', time: '1 hour ago', color: 'bg-purple-500' },
                  { action: 'Job application submitted', user: 'Robert Chen', time: '2 hours ago', color: 'bg-amber-500' }
                ].map((activity, index) => (
                  <RecentActivityItem key={index} {...activity} />
                ))}
              </div>
            </div>
          </div>
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

const RecentActivityItem = ({ action, user, time, color }) => {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
      <div className={`w-2 h-2 ${color} rounded-full mt-2`}></div>
      <div className="flex-1">
        <p className="text-sm text-gray-800">{action}</p>
        <p className="text-xs text-gray-500 mt-0.5">{user} • {time}</p>
      </div>
    </div>
  );
};
