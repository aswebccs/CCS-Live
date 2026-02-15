import React, { useState, useEffect, useRef } from 'react';
import {
  X
} from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);
  const shownAlertsRef = useRef(new Set());
  const modalRef = useRef(null);

  const getAuthHeaders = (includeJson = false) => {
    const token = localStorage.getItem('token');
    return {
      ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    loadCategories();
  }, [searchCode, searchName, filterStatus, page, rowsPerPage]);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || '',
        shortDescription: editingCategory.short_description || '',
        description: editingCategory.description || '',
        isActive: editingCategory.is_active ?? true
      });
    } else {
      setFormData({
        name: '',
        shortDescription: '',
        description: '',
        isActive: true
      });
    }
  }, [editingCategory]);

  useEffect(() => {
    if (!showModal) return;
    if (!editorRef.current) return;
    editorRef.current.innerHTML = formData.description || '';
  }, [showModal, editingCategory]);

  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e) => {
      if (e.key !== 'Backspace') return;
      const target = document.activeElement;
      const isEditable =
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA';
      const inModal = modalRef.current?.contains(target);
      if (isEditable && inModal) return;
      e.preventDefault();
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [showModal]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: rowsPerPage,
        ...(searchCode && { search_code: searchCode }),
        ...(searchName && { search_name: searchName }),
        ...(filterStatus && { status: filterStatus })
      });

      const res = await fetch(`http://localhost:5000/api/exam-management/categories?${params}`);
      const result = await res.json();

      if (result.success) {
        setCategories(result.data);
        setTotalPages(result.pagination.totalPages);
      }
    } catch {
      showAlertOnce('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      showAlertOnce('Category name is required');
      return;
    }
    if (formData.shortDescription.length > 160) {
      showAlertOnce('Short description must be 160 characters or less');
      return;
    }
    setSaving(true);

    try {
      const url = editingCategory
        ? `http://localhost:5000/api/exam-management/categories/${editingCategory.id}`
        : 'http://localhost:5000/api/exam-management/categories';

      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          name: trimmedName,
          short_description: formData.shortDescription,
          description: formData.description,
          is_active: formData.isActive
        })
      });

      const result = await res.json();

      if (result.success) {
        setShowModal(false);
        setEditingCategory(null);
        loadCategories();
        showAlertOnce(result.message);
      } else {
        showAlertOnce(result.message);
      }
    } catch {
      showAlertOnce('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
    const res = await fetch(`http://localhost:5000/api/exam-management/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const result = await res.json();
      
      if (result.success) {
        loadCategories();
        showAlertOnce(result.message);
      } else {
        showAlertOnce(result.message);
      }
    } catch {
      showAlertOnce('Delete failed');
    }
  };

  const handleToggle = async (id) => {
    try {
    const res = await fetch(`http://localhost:5000/api/exam-management/categories/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const result = await res.json();
      
      if (result.success) {
        loadCategories();
      }
    } catch {
      showAlertOnce('Toggle failed');
    }
  };

  const handleRowAction = (category, action) => {
    if (action === 'edit') {
      setEditingCategory(category);
      setShowModal(true);
      return;
    }
    if (action === 'toggle') {
      handleToggle(category.id);
      return;
    }
    if (action === 'delete') {
      handleDelete(category.id);
    }
  };

  const applyFormat = (command) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, null);
    setFormData((prev) => ({
      ...prev,
      description: editorRef.current.innerHTML
    }));
  };

  const showAlertOnce = (message) => {
    if (shownAlertsRef.current.has(message)) return;
    shownAlertsRef.current.add(message);
    alert(message);
    setTimeout(() => shownAlertsRef.current.delete(message), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            NEW CATEGORY
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <div className="min-w-[900px]">
          {/* Search Headers */}
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">CODE</label>
              <input
                type="text"
                placeholder="Search Code"
                value={searchCode}
                onChange={(e) => {
                  setSearchCode(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">NAME</label>
              <input
                type="text"
                placeholder="Search Name"
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">STATUS</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No categories found
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="grid grid-cols-4 gap-4 items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <div>
                  <span className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded text-sm font-medium">
                        {cat.code}
                  </span>
                </div>

                <div>
                  <span className="font-medium text-gray-800">{cat.name}</span>
                </div>

                <div>
                  <span
                    className={`inline-block px-3 py-1.5 rounded text-sm font-medium ${
                      cat.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      handleRowAction(cat, e.target.value);
                      e.target.value = '';
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="">Actions</option>
                    <option value="edit">Edit</option>
                    <option value="toggle">{cat.is_active ? 'Make Inactive' : 'Make Active'}</option>
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
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value));
                  setPage(1);
                }}
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
                  if (newPage >= 1 && newPage <= totalPages) {
                    setPage(newPage);
                  }
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
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6">
              {/* Category Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Category Name <span className="text-red-500">*</span>
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

              {/* Short Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Short Description (Max. 160 Characters)
                </label>
                <textarea
                  maxLength={160}
                  rows={3}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.shortDescription.length}/160 characters
                </p>
              </div>

              {/* Description with Rich Text Editor */}
              {/* <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                 
                  <div className="flex items-center gap-1 p-2 bg-white border-b border-gray-300">
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Bold"
                      onClick={() => applyFormat('bold')}
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Italic"
                      onClick={() => applyFormat('italic')}
                    >
                      <em>I</em>
                    </button>
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Strikethrough"
                      onClick={() => applyFormat('strikeThrough')}
                    >
                      <s>S</s>
                    </button>
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Underline"
                      onClick={() => applyFormat('underline')}
                    >
                      <u>U</u>
                    </button>
                  </div>
           
                  <div
                    ref={editorRef}
                    contentEditable
                    role="textbox"
                    aria-multiline="true"
                    suppressContentEditableWarning
                    tabIndex={0}
                    className="w-full px-4 py-3 min-h-[150px] focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace') {
                        e.stopPropagation();
                      }
                    }}
                    onInput={(e) =>
                      setFormData({
                        ...formData,
                        description: e.currentTarget.innerHTML
                      })
                    }
                  />
                </div>
              </div> */}

              {/* Active Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Active</label>
                    <p className="text-sm text-gray-500">
                      Active (Shown Everywhere). In-active (Hidden Everywhere).
                    </p>
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;

