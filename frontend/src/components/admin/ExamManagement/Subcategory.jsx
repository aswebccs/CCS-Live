
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { API_ENDPOINTS } from '../../../config/api';

const Subcategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    shortDescription: '',
    isActive: true
  });

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: '', message: '' });
  const modalRef = useRef(null);
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    subcategoryName: '',
    subcategoryId: null,
    isProcessing: false
  });
  const getAuthHeaders = (includeJson = false) => {
    const token = localStorage.getItem('token');
    return {
      ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    loadCategories();
    loadSubcategories();
  }, [searchCode, searchName, filterStatus, page, rowsPerPage]);

  useEffect(() => {
    if (editingSubcategory) {
      setFormData({
        name: editingSubcategory.name || '',
        category_id: editingSubcategory.category_id || '',
        shortDescription: editingSubcategory.short_description || '',
        isActive: editingSubcategory.is_active ?? true
      });
    } else {
      setFormData({
        name: '',
        category_id: '',
        shortDescription: '',
        isActive: true
      });
    }
  }, [editingSubcategory]);


  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e) => {
      if (e.key !== 'Backspace') return;
      const target = document.activeElement;
      const isEditable = target?.isContentEditable || target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT';
      const inModal = modalRef.current?.contains(target);
      if (isEditable && inModal) return;
      e.preventDefault();
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [showModal]);

  const loadCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/exam-management/categories');
      const result = await res.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSubcategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: rowsPerPage,
        ...(searchCode && { search_code: searchCode }),
        ...(searchName && { search_name: searchName }),
        ...(filterStatus && { status: filterStatus })
      });

      const res = await fetch(`http://localhost:5000/api/exam-management/subcategories?${params}`);
      const result = await res.json();

      if (result.success) {
        setSubcategories(result.data);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (error) {
      showAlertOnce('Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      showAlertOnce('Subcategory name is required');
      return;
    }
    if (!formData.category_id) {
      showAlertOnce('Category is required');
      return;
    }
    if (formData.shortDescription.length > 160) {
      showAlertOnce('Short description must be 160 characters or less');
      return;
    }
    setSaving(true);

    try {
      const url = editingSubcategory
        ? `http://localhost:5000/api/exam-management/subcategories/${editingSubcategory.id}`
        : 'http://localhost:5000/api/exam-management/subcategories';

      const method = editingSubcategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          name: trimmedName,
          category_id: formData.category_id,
         
          short_description: formData.shortDescription,
        
          is_active: formData.isActive
        })
      });

      const result = await res.json();

      if (result.success) {
        setShowModal(false);
        setEditingSubcategory(null);
        loadSubcategories();
        showAlertOnce(result.message || (editingSubcategory ? 'Subcategory updated' : 'Subcategory created'), 'success');
      } else {
        showAlertOnce(result.message || 'Save failed');
      }
    } catch (error) {
      showAlertOnce('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, name) => {
    if (!id) {
      showAlertOnce('Invalid subcategory id. Please refresh and try again.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Delete Subcategory',
      message: `Are you sure you want to delete the subcategory "${name}"? This will move it to the Recycle Bin where you can restore or permanently delete it.`,
      subcategoryName: name,
      subcategoryId: id,
      isProcessing: false
    });
  };

  const handleConfirmDelete = async () => {
    const id = confirmModal.subcategoryId;
    if (!id) {
      showAlertOnce('Invalid subcategory id. Please refresh and try again.');
      return;
    }
    try {
      setConfirmModal(prev => ({ ...prev, isProcessing: true }));
      const res = await fetch(API_ENDPOINTS.SUBCATEGORY_DELETE(id), { 
        method: 'DELETE', 
        headers: getAuthHeaders() 
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || `HTTP ${res.status}`);
      if (result.success) {
        setConfirmModal({ isOpen: false, title: '', message: '', subcategoryName: '', subcategoryId: null, isProcessing: false });
        loadSubcategories();
        showAlertOnce(result.message || 'Subcategory deleted and moved to trash', 'success');
      } else {
        showAlertOnce(result.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showAlertOnce(error.message || 'Failed to delete subcategory. Please try again.');
    } finally {
      setConfirmModal(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/exam-management/subcategories/${id}/toggle`, { method: 'PATCH', headers: getAuthHeaders() });
      const result = await res.json();

      if (result.success) {
        loadSubcategories();
        showAlertOnce(result.message || 'Status updated', 'success');
      } else {
        showAlertOnce(result.message || 'Toggle failed');
      }
    } catch (error) {
      showAlertOnce('Toggle failed');
    }
  };

  const handleRowAction = (sub, action) => {
    const subId = sub.id ?? sub.subcategory_id ?? null;
    if (action === 'edit') {
      setEditingSubcategory({ ...sub, id: subId });
      setShowModal(true);
      return;
    }
    if (action === 'toggle') {
      handleToggle(subId);
      return;
    }
    if (action === 'delete') {
      handleDelete(subId, sub.name);
    }
  };

  const showAlertOnce = (message, type = 'error') => {
    setNotice({ message, type });
    setTimeout(() => setNotice({ message: '', type: '' }), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {notice.message && (
        <div className="fixed top-6 right-6 z-[60] w-[340px] animate-slideIn">
          <div
            className={`flex items-start gap-3 bg-white rounded-xl shadow-lg border border-gray-200 px-5 py-4 transition-all duration-300 ${
              notice.type === "success"
                ? "border-l-4 border-l-green-500"
                : "border-l-4 border-l-red-500"
            }`}
          >
            {/* Icon */}
            <div className={`text-xl ${
              notice.type === "success" ? "text-green-500" : "text-red-500"
            }`}>
              {notice.type === "success" ? "✓" : "⚠"}
            </div>
            <p className="text-sm text-gray-600 mt-1">
                {notice.message}
            </p>
          </div>
        </div>

        )}

        {/* Confirmation Modal */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
              {/* Modal Header */}
              <div className="p-6 bg-red-50 border-b border-red-100">
                <h3 className="text-lg font-bold text-red-900">
                  {confirmModal.title}
                </h3>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    if (!confirmModal.isProcessing) {
                      setConfirmModal({ isOpen: false, title: '', message: '', subcategoryName: '', subcategoryId: null, isProcessing: false });
                    }
                  }}
                  disabled={confirmModal.isProcessing}
                  className="px-4 py-2 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={confirmModal.isProcessing}
                  className="px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500 flex items-center gap-2"
                >
                  {confirmModal.isProcessing && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Sub Categories</h1>
          <button
            onClick={() => { setEditingSubcategory(null); setShowModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            NEW SUB CATEGORY
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <div className="min-w-[1050px]">
          {/* Search Headers */}
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">CODE</label>
              <input
                type="text"
                placeholder="Search Code"
                value={searchCode}
                onChange={(e) => { setSearchCode(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">NAME</label>
              <input
                type="text"
                placeholder="Search Name"
                value={searchName}
                onChange={(e) => { setSearchName(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">CATEGORY</label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">STATUS</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Search Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">ACTIONS</label>
            </div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading...</p>
            </div>
          ) : subcategories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No subcategories found</div>
          ) : (
            subcategories.map((sub) => (
              <div key={sub.id ?? sub.subcategory_id ?? sub.code} className="grid grid-cols-5 gap-4 items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <div>
                  <span className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded text-sm font-medium">
                     {sub.code}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-800">{sub.name}</span>
                </div>
                <div>
                  <span className="text-gray-700">{sub.category_name}</span>
                </div>
                <div>
                  <span className={`inline-block px-3 py-1.5 rounded text-sm font-medium ${
                    sub.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {sub.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      handleRowAction(sub, e.target.value);
                      e.target.value = '';
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="">Actions</option>
                    <option value="edit">Edit</option>
                    <option value="toggle">{sub.is_active ? 'Make Inactive' : 'Make Active'}</option>
                    <option value="delete">Delete</option>
                  </select>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">ROWS PER PAGE:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(1); }}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-medium">PAGE</span>
              <input
                type="number"
                value={page}
                onChange={(e) => {
                  const newPage = parseInt(e.target.value);
                  if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
                }}
                min="1"
                max={totalPages}
                className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 font-medium">OF {totalPages}</span>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div ref={modalRef} className="bg-white w-full max-w-2xl rounded-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {editingSubcategory ? 'Edit Sub Category' : 'New Sub Category'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6">
              {/* Sub Category Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Sub Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter Category Name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

            

              {/* Short Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Active</label>
                    <p className="text-sm text-gray-500">Active (Shown Everywhere). In-active (Hidden Everywhere).</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : editingSubcategory ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Subcategories;















