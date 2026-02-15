
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { 
  Users, Search, UserPlus, GraduationCap, School, Building2, Briefcase
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const FILTERABLE_TYPE_CONFIGS = [
  { name: 'Student/Professional', id: 3, icon: GraduationCap, color: 'bg-blue-500' },
  { name: 'College', id: 4, icon: Building2, color: 'bg-teal-500' },
  { name: 'University', id: 5, icon: Building2, color: 'bg-emerald-500' },
  { name: 'School', id: 6, icon: School, color: 'bg-amber-500' },
  { name: 'Company', id: 7, icon: Briefcase, color: 'bg-rose-500' },
];

const CountUp = ({ end, duration = 2000 }) => {
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
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [end, duration]);

  const formatted = count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toLocaleString();
  return <span className="text-2xl font-bold text-gray-800">{formatted}</span>;
};

const UserTypeFilterCard = ({ type, count, icon: Icon, color, isActive, onClick }) => (
  <div
    className={`cursor-pointer p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
      isActive
        ? 'bg-blue-50 border-blue-200 shadow-md'
        : 'bg-white border-gray-100 hover:border-gray-200'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 mb-1">{type}</p>
        <CountUp end={count} />
      </div>
    </div>
  </div>
);

const UserListPage = ({ onBack, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('users');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const searchRef = useRef(null);

  // Load data
  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const response = await fetch(`${API_URL}/admin/users`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load users');
        }
        if (isMounted) {
          const list = Array.isArray(data?.users) ? data.users : [];
          setUsers(list);
          setFilteredUsers(list);
        }
      } catch (error) {
        if (isMounted) {
          setUsers([]);
          setFilteredUsers([]);
          setLoadError(error?.message || 'Failed to load users');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter users
  const filterUsers = useCallback((usersList, type, term) => {
    let filtered = [...usersList];
    if (type !== 'all') {
      filtered = filtered.filter((user) => user.user_type == type);
    }

    const normalizedTerm = term.trim().toLowerCase();
    if (normalizedTerm) {
      filtered = filtered.filter((user) => {
        const name = user.name?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        const typeLabel = user.user_type === 3
          ? 'student/professional'
          : (FILTERABLE_TYPE_CONFIGS.find(t => t.id === user.user_type)?.name || 'unknown').toLowerCase();
        const statusLabel = user.status ? 'active' : 'inactive';
        const statusMatch = (normalizedTerm === 'active' || normalizedTerm === 'inactive')
          ? statusLabel === normalizedTerm
          : statusLabel.includes(normalizedTerm);

        return (
          name.includes(normalizedTerm) ||
          email.includes(normalizedTerm) ||
          typeLabel.includes(normalizedTerm) ||
          statusMatch
        );
      });
    }

    return filtered;
  }, []);

  const exportUsersToExcel = useCallback(() => {
    const rows = filteredUsers.map((user) => ({
      Name: user.name,
      Email: user.email,
      'User Type': user.user_type === 3 ? 'Student/Professional' : (FILTERABLE_TYPE_CONFIGS.find(t => t.id === user.user_type)?.name || 'Unknown'),
      Status: user.status ? 'Active' : 'Inactive',
      Created: new Date(user.created_at).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    const fileName = `users_${selectedType === 'all' ? 'all' : selectedType}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }, [filteredUsers, selectedType]);

  useEffect(() => {
    const result = filterUsers(users, selectedType, searchTerm);
    setFilteredUsers(result);
  }, [selectedType, searchTerm, users, filterUsers]);

  // Toggle user status
  const toggleUserStatus = useCallback((userId) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, status: !user.status }
          : user
      )
    );
  }, []);

  // Handle edit user
  const handleEditUser = (userId) => {
    console.log('Edit user:', userId);
    alert(`Edit user ${userId}`);
  };

  const handleActionSelect = (user, action) => {
    if (!action) return;

    if (action === 'edit') {
      handleEditUser(user.id);
      return;
    }

    if (action === 'toggle') {
      toggleUserStatus(user.id);
      return;
    }

  };

  // Navigation handlers
  const handleGoToDashboard = () => {
    if (onNavigate) {
      onNavigate('dashboard');
      return;
    }
    if (onBack) onBack();
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };


  const handleSearchKeyDown = useCallback((e) => {

    if (e.key === 'Backspace') {
      e.stopPropagation(); // Prevent event from bubbling up to parent handlers
    }
    
    if (e.key === 'Escape') {
      setSearchTerm('');
      searchRef.current?.blur();
    }
  }, []);

  // Additional protection: prevent backspace navigation on the entire component
  useEffect(() => {
    const preventBackspaceNav = (e) => {
      // Only prevent if we're NOT in an input field
      const target = e.target;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      if (e.key === 'Backspace' && !isInput) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', preventBackspaceNav, true);
    return () => document.removeEventListener('keydown', preventBackspaceNav, true);
  }, []);

  // Calculate counts
  const typeCounts = {
    all: users.length,
    'Student/Professional': users.filter(u => u.user_type === 3).length,
    College: users.filter(u => u.user_type === 4).length,
    University: users.filter(u => u.user_type === 5).length,
    School: users.filter(u => u.user_type === 6).length,
    Company: users.filter(u => u.user_type === 7).length,
  };

  const statusColor = (status) => (status ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
     

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
      

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
            <p className="text-gray-500">View and manage all platform users with type-based filtering.</p>
          </div>

          {/* Users by Type */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Users by Type ({typeCounts.all})</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              <UserTypeFilterCard
                type="All Users"
                count={typeCounts.all}
                icon={Users}
                color="bg-gray-500"
                isActive={selectedType === 'all'}
                onClick={() => setSelectedType('all')}
              />
              {FILTERABLE_TYPE_CONFIGS.map(({ name, id, icon: Icon, color }) => (
                <UserTypeFilterCard
                  key={name}
                  type={name}
                  count={typeCounts[name]}
                  icon={Icon}
                  color={color}
                  isActive={selectedType == id}
                  onClick={() => setSelectedType(id)}
                />
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">
                  Users List ({filteredUsers.length})
                  {selectedType !== 'all' && (
                    <span className="ml-2 text-sm text-gray-500">
                      • {FILTERABLE_TYPE_CONFIGS.find(t => t.id == selectedType)?.name || 'Unknown'}
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={searchRef}
                      type="search"
                      placeholder="Search by name"
                      className="pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-56"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      autoComplete="off"
                    />
                  </div>
                  <button
                    onClick={exportUsersToExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm"
                  >
                    Export to Excel
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium text-sm">
                    <UserPlus className="w-4 h-4" />
                    Add User
                  </button>
                </div>
              </div>
            </div>
            {loadError && (
              <div className="px-6 py-3 bg-red-50 text-red-700 text-sm border-b border-red-100">
                {loadError}
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-xs">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {user.user_type === 3 ? 'Student/Professional' : 
                            FILTERABLE_TYPE_CONFIGS.find(t => t.id === user.user_type)?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColor(user.status)}`}>
                          {user.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            handleActionSelect(user, e.target.value);
                            e.target.value = '';
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="">Actions</option>
                          <option value="edit">Edit</option>
                          <option value="toggle">{user.status ? 'Deactivate' : 'Activate'}</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserListPage;
