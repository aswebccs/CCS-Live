// import React, { useState, useEffect } from 'react';
// import { X } from 'lucide-react';

// const Subcategory = ({ categoryId, categoryName, onNext, onBack }) => {
//   const [subcategories, setSubcategories] = useState([]);
//   const [selectedSubcategory, setSelectedSubcategory] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [loading, setLoading] = useState(true);
  
//   const [newSubcategory, setNewSubcategory] = useState({
//     categoryId: categoryId,
//     name: '',
//     type: 'Exam',
//     shortDescription: '',
//     description: '',
//     isActive: true
//   });

//   useEffect(() => {
//     loadSubcategories();
//   }, [categoryId]);

//   const loadSubcategories = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`/api/subcategories?categoryId=${categoryId}`);
//       const data = await response.json();
//       setSubcategories(data);
//     } catch (error) {
//       console.error('Error loading subcategories:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateSubcategory = async (e) => {
//     e.preventDefault();
    
//     try {
//       const response = await fetch('/api/subcategories', {
//         method: 'POST',
//         headers: getAuthHeaders(true),
//         body: JSON.stringify(newSubcategory)
//       });
      
//       const createdSubcategory = await response.json();
//       setSubcategories([...subcategories, createdSubcategory]);
//       setSelectedSubcategory(createdSubcategory.id);
//       setShowModal(false);
      
//       setNewSubcategory({
//         categoryId: categoryId,
//         name: '',
//         type: 'Exam',
//         shortDescription: '',
//         description: '',
//         isActive: true
//       });
//     } catch (error) {
//       console.error('Error creating subcategory:', error);
//       alert('Failed to create subcategory');
//     }
//   };

//   const handleNext = () => {
//     if (!selectedSubcategory) {
//       alert('Please select a subcategory');
//       return;
//     }
    
//     const subcategory = subcategories.find(s => s.id === selectedSubcategory);
//     onNext({
//       subcategoryId: subcategory.id,
//       subcategoryName: subcategory.name
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="text-2xl font-bold mb-2">Select Subcategory</h2>
//           <p className="text-gray-500 mb-6">Category: {categoryName}</p>
          
//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Sub Category Name
//             </label>
//             <select
//               value={selectedSubcategory}
//               onChange={(e) => setSelectedSubcategory(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="">Enter Category Name</option>
//               {subcategories.map(sub => (
//                 <option key={sub.id} value={sub.id}>{sub.name}</option>
//               ))}
//             </select>
//           </div>

//           <button
//             onClick={() => setShowModal(true)}
//             className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
//           >
//             NEW SUB CATEGORY
//           </button>

//           <div className="mt-6 flex justify-between">
//             <button
//               onClick={onBack}
//               className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
//             >
//               Back
//             </button>
//             <button
//               onClick={handleNext}
//               disabled={!selectedSubcategory}
//               className={`px-6 py-2 rounded-lg font-medium ${
//                 selectedSubcategory
//                   ? 'bg-blue-600 text-white hover:bg-blue-700'
//                   : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//               }`}
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h2 className="text-xl font-bold text-gray-800">New Sub Category</h2>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <form onSubmit={handleCreateSubcategory} className="p-6">
//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Sub Category Name
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={newSubcategory.name}
//                   onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
//                   placeholder="Enter Category Name"
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>

//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Category <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   value={newSubcategory.categoryId}
//                   disabled
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
//                 >
//                   <option value={categoryId}>{categoryName}</option>
//                 </select>
//               </div>

//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Type <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   value={newSubcategory.type}
//                   onChange={(e) => setNewSubcategory({ ...newSubcategory, type: e.target.value })}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="Exam">Exam</option>
//                   <option value="Quiz">Quiz</option>
//                 </select>
//               </div>

//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Short Description
//                 </label>
//                 <textarea
//                   rows={3}
//                   value={newSubcategory.shortDescription}
//                   onChange={(e) => setNewSubcategory({ ...newSubcategory, shortDescription: e.target.value })}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
//                 />
//               </div>

//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Description
//                 </label>
//                 <div className="border border-gray-300 rounded-lg overflow-hidden">
//                   <div className="flex items-center gap-1 p-2 bg-white border-b border-gray-300">
//                     <button type="button" className="p-2 hover:bg-gray-100 rounded"><strong>B</strong></button>
//                     <button type="button" className="p-2 hover:bg-gray-100 rounded"><em>I</em></button>
//                     <button type="button" className="p-2 hover:bg-gray-100 rounded"><s>S</s></button>
//                     <button type="button" className="p-2 hover:bg-gray-100 rounded"><u>U</u></button>
//                     <button type="button" className="p-2 hover:bg-gray-100 rounded text-sm">x₂</button>
//                     <button type="button" className="p-2 hover:bg-gray-100 rounded text-sm">x²</button>
//                     <div className="w-px h-6 bg-gray-300 mx-1"></div>
//                     <button type="button" className="p-2 hover:bg-gray-100 rounded">≡</button>
//                     <button type="button" className="p-2 hover:bg-gray-100 rounded">≣</button>
//                     <button type="button" className="p-2 hover:bg-gray-100 rounded">⊞</button>
//                     <button type="button" className="p-2 hover:bg-gray-100 rounded">🖼</button>
//                   </div>
//                   <textarea
//                     rows={8}
//                     value={newSubcategory.description}
//                     onChange={(e) => setNewSubcategory({ ...newSubcategory, description: e.target.value })}
//                     className="w-full px-4 py-3 focus:outline-none resize-none"
//                   />
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-900 mb-1">Active</label>
//                     <p className="text-sm text-gray-500">Active (Shown Everywhere). In-active (Hidden Everywhere).</p>
//                   </div>
//                   <label className="relative inline-flex items-center cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={newSubcategory.isActive}
//                       onChange={(e) => setNewSubcategory({ ...newSubcategory, isActive: e.target.checked })}
//                       className="sr-only peer"
//                     />
//                     <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
//                   </label>
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
//               >
//                 Create
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Subcategory;




import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

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
  const modalRef = useRef(null);
  const shownAlertsRef = useRef(new Set());
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
        showAlertOnce(result.message);
      } else {
        showAlertOnce(result.message);
      }
    } catch (error) {
      showAlertOnce('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/exam-management/subcategories/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      const result = await res.json();

      if (result.success) {
        loadSubcategories();
        showAlertOnce(result.message);
      } else {
        showAlertOnce(result.message);
      }
    } catch (error) {
      showAlertOnce('Delete failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/exam-management/subcategories/${id}/toggle`, { method: 'PATCH', headers: getAuthHeaders() });
      const result = await res.json();

      if (result.success) {
        loadSubcategories();
      }
    } catch (error) {
      showAlertOnce('Toggle failed');
    }
  };

  const handleRowAction = (sub, action) => {
    if (action === 'edit') {
      setEditingSubcategory(sub);
      setShowModal(true);
      return;
    }
    if (action === 'toggle') {
      handleToggle(sub.id);
      return;
    }
    if (action === 'delete') {
      handleDelete(sub.id);
    }
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
              <div key={sub.id} className="grid grid-cols-5 gap-4 items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
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
    </div>
  );
};

export default Subcategories;

