import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { formatDate, getInitials, statusBadgeClass } from '../../utils/helpers';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/users', {
        params: { search, status: statusFilter, limit: 50 }
      });
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateStatus = async (id, status) => {
    setActionLoading(id + status);
    try {
      await api.patch(`/api/admin/users/${id}/status`, { status });
      toast.success(`User ${status}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    setActionLoading(id + 'del');
    try {
      await api.delete(`/api/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>User Management</h1>
          <p>{total} registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ width: '280px' }}>
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
          </select>

          <button className="btn btn-secondary btn-sm" onClick={fetchUsers}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="icon">👥</div>
            <h3>No users found</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Blood Group</th>
                  <th>City</th>
                  <th>Phone</th>
                  <th>Last Donation</th>
                  <th>Donations</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map(u => {
                  const isDemoUser = u.isDemo; // 🔐 key line

                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                            {getInitials(u.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td>{u.bloodGroup || '—'}</td>
                      <td>{u.city || '—'}</td>
                      <td>{u.phone || '—'}</td>
                      <td>{formatDate(u.lastDonationDate)}</td>
                      <td>{u.totalDonations}</td>

                      <td>
                        <span className={`badge ${statusBadgeClass(u.status)}`}>
                          {u.status}
                        </span>
                      </td>

                      {/* 🔥 ACTIONS */}
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>

                          {!isDemoUser ? (
                            <>
                              {u.status === 'active' ? (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => updateStatus(u._id, 'suspended')}
                                >
                                  🔒 Suspend
                                </button>
                              ) : (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => updateStatus(u._id, 'active')}
                                >
                                  ✓ Activate
                                </button>
                              )}

                              {u.status !== 'blocked' && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => updateStatus(u._id, 'blocked')}
                                >
                                  🚫 Block
                                </button>
                              )}

                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => deleteUser(u._id, u.name)}
                              >
                                🗑
                              </button>
                            </>
                          ) : (
                            <span style={{
                              fontSize: '12px',
                              color: '#e63946',
                              fontWeight: 600
                            }}>
                              🔐 Protected
                            </span>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}