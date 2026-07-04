import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, Search, RefreshCw, BarChart2, Check, AlertCircle } from 'lucide-react';

export default function AdminDashboard({ userId, onLogout }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/admin/users', {
        headers: { 'X-User-Id': userId }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch student list.');
      }
      setStudents(data.students || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [userId]);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = students.length;
  const verifiedUsers = students.filter(s => s.isVerified).length;
  const unverifiedUsers = totalUsers - verifiedUsers;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in-slide" style={{ padding: '1rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="glowing-title">Admin Console</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Monitor student placement preparation metrics, active streaks, and account verifications.
          </p>
        </div>
        <button 
          onClick={fetchStudents} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          padding: '0.75rem',
          borderRadius: '12px',
          marginBottom: '1.5rem'
        }}>
          {error}
        </div>
      )}

      {/* Grid of Counts */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Total Students</span>
            <Users size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="stat-value">{totalUsers}</div>
          <div className="stat-footer">Registered accounts</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Verified Students</span>
            <UserCheck size={20} style={{ color: 'var(--accent-green)' }} />
          </div>
          <div className="stat-value">{verifiedUsers}</div>
          <div className="stat-footer" style={{ color: 'var(--accent-green)' }}>
            {totalUsers > 0 ? `${Math.round((verifiedUsers / totalUsers) * 100)}% active` : '0%'}
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Unverified Students</span>
            <UserX size={20} style={{ color: 'var(--accent-orange)' }} />
          </div>
          <div className="stat-value">{unverifiedUsers}</div>
          <div className="stat-footer">Pending verification check</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
            Registered Member Directory
          </h3>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search student by name/email..."
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Scrollable container for table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <th style={{ padding: '1rem 0.75rem' }}>Student Name</th>
                <th style={{ padding: '1rem 0.75rem' }}>Email Address</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>Account Status</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>Resume score</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>Interview rating</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>Streak</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>Roadmap Days</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', fontSize: '0.95rem', color: '#cbd5e1' }}>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: 600, color: 'white' }}>{student.name}</td>
                    <td style={{ padding: '1rem 0.75rem' }}>{student.email}</td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                      {student.isVerified ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '20px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          color: 'var(--accent-green)',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}>
                          <Check size={12} /> Verified
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '20px',
                          background: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          color: 'var(--accent-orange)',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}>
                          <AlertCircle size={12} /> Unverified
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'center', color: student.resumeScore > 0 ? 'var(--primary)' : 'inherit', fontWeight: student.resumeScore > 0 ? 700 : 'inherit' }}>
                      {student.resumeScore > 0 ? `${student.resumeScore}%` : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'center', color: student.interviewScore > 0 ? 'var(--secondary)' : 'inherit', fontWeight: student.interviewScore > 0 ? 700 : 'inherit' }}>
                      {student.interviewScore > 0 ? `${student.interviewScore}%` : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                      {student.streak} 🔥
                    </td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>
                      {student.studyDays}/30
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
