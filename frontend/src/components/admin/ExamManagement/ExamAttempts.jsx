import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ExamAttempts = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/exam-management/attempts', {
        params: {
          page,
          limit: 10,
          ...(search.trim() && { search: search.trim() }),
          ...(status && { status }),
        },
        headers: getAuthHeaders(),
      });
      const data = response?.data || {};
      setRows(data.data || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0, limit: 10 });
    } catch (err) {
      setRows([]);
      setPagination({ page: 1, totalPages: 1, total: 0, limit: 10 });
      alert('Failed to load exam attempts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [page, status]);

  const handleSearch = () => {
    setPage(1);
    fetchAttempts();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Exam Attempts</h1>
        <div className="text-sm text-gray-500">Total: {pagination.total}</div>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search user/email/exam"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Results</option>
            <option value="PASSED">Passed</option>
            <option value="FAILED">Failed</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
          <button
            onClick={() => {
              setSearch('');
              setStatus('');
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Exam</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Score</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Percentage</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Result</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Attempted At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-sm text-gray-500" colSpan={7}>Loading...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-sm text-gray-500" colSpan={7}>No attempts found</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-3 text-sm text-gray-800">{row.user_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.user_email}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{row.exam_title}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.score}/{row.total_questions}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{Number(row.percentage || 0).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${row.result_status === 'PASSED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {row.result_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {row.attempted_at ? new Date(row.attempted_at).toLocaleString() : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1.5 border rounded disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages || 1}</span>
        <button
          disabled={page >= (pagination.totalPages || 1)}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1.5 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ExamAttempts;


