import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, RefreshCw, Code, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';

export default function StudyPlanner({ userId }) {
  const [roadmap, setRoadmap] = useState([]);
  const [completedDays, setCompletedDays] = useState([]);
  const [leetcodeProblems, setLeetcodeProblems] = useState([]);
  const [completedProblems, setCompletedProblems] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('roadmap'); // 'roadmap' or 'leetcode'

  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [loadingLeetcode, setLoadingLeetcode] = useState(false);
  const [error, setError] = useState('');

  // Fetch study plan on mount
  const fetchStudyPlan = async (force = false) => {
    setLoadingRoadmap(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/studyPlan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ force })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load study plan.');
      }
      setRoadmap(data.roadmap || []);
      setCompletedDays(data.completedDays || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  // Fetch LeetCode recommendations
  const fetchLeetcodeProblems = async () => {
    setLoadingLeetcode(true);
    try {
      const response = await fetch('http://localhost:8080/progress/leetcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        }
      });
      const data = await response.json();
      if (response.ok) {
        setLeetcodeProblems(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load Leetcode recommendations', err);
    } finally {
      setLoadingLeetcode(false);
    }
  };

  // Fetch current user progress metrics (for completed problems list)
  const fetchProgressStats = async () => {
    try {
      const response = await fetch(`http://localhost:8080/progress`, {
        headers: { 'X-User-Id': userId }
      });
      if (response.ok) {
        const data = await response.json();
        setCompletedProblems(data.completedProblems || []);
      }
    } catch (err) {
      console.error('Failed to load progress stats', err);
    }
  };

  useEffect(() => {
    fetchStudyPlan();
    fetchLeetcodeProblems();
    fetchProgressStats();
  }, [userId]);

  const toggleDayCompletion = async (dayIdx) => {
    try {
      const response = await fetch('http://localhost:8080/studyPlan/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ day: dayIdx })
      });
      const data = await response.json();
      if (response.ok) {
        setCompletedDays(data.completedDays || []);
      }
    } catch (err) {
      console.error('Error toggling day completion', err);
    }
  };

  const toggleProblemCompletion = async (problemName) => {
    try {
      const response = await fetch('http://localhost:8080/progress/leetcode/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ problemName })
      });
      const data = await response.json();
      if (response.ok) {
        setCompletedProblems(data.completedProblems || []);
      }
    } catch (err) {
      console.error('Error toggling problem completion', err);
    }
  };

  const handleRegeneratePlan = () => {
    if (window.confirm('Are you sure you want to regenerate your study plan? This will clear current progress.')) {
      fetchStudyPlan(true);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="glowing-title">Study Planner &amp; Coding Practice</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Follow your custom 30-day placement preparation roadmap and solve recommended LeetCode coding challenges.
          </p>
        </div>
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

      {/* Sub Tabs Toggle */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
        <button
          onClick={() => setActiveSubTab('roadmap')}
          className={`btn ${activeSubTab === 'roadmap' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Calendar size={18} /> 30-Day Roadmap
        </button>
        <button
          onClick={() => setActiveSubTab('leetcode')}
          className={`btn ${activeSubTab === 'leetcode' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Code size={18} /> Recommended LeetCode
        </button>
      </div>

      {/* 30-Day Roadmap Tab */}
      {activeSubTab === 'roadmap' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} style={{ color: 'var(--primary)' }} /> Your Custom Placement Roadmap
            </h3>
            <button
              onClick={handleRegeneratePlan}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              disabled={loadingRoadmap}
            >
              <RefreshCw size={14} /> Re-Generate Plan
            </button>
          </div>

          {loadingRoadmap ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {roadmap.map((dayText, idx) => {
                const isCompleted = completedDays.includes(idx);
                return (
                  <div
                    key={idx}
                    className="glass-panel"
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      textAlign: 'left',
                      borderColor: isCompleted ? 'var(--primary)' : 'var(--border-light)',
                      background: isCompleted ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-card)',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleDayCompletion(idx)}
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        accentColor: 'var(--primary)',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    />

                    {/* Content */}
                    <div style={{ flexGrow: 1 }}>
                      <div style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: isCompleted ? 'var(--primary)' : 'white',
                        marginBottom: '0.25rem'
                      }}>
                        Day {idx + 1}
                      </div>
                      <p style={{
                        fontSize: '0.925rem',
                        color: isCompleted ? 'var(--text-muted)' : '#cbd5e1',
                        textDecoration: isCompleted ? 'line-through' : 'none'
                      }}>
                        {dayText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LeetCode Recommendations Tab */}
      {activeSubTab === 'leetcode' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={20} style={{ color: 'var(--secondary)' }} /> Curated Practice Problems
            </h3>
            <button
              onClick={fetchLeetcodeProblems}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              disabled={loadingLeetcode}
            >
              <RefreshCw size={14} /> Refresh Recommendations
            </button>
          </div>

          {loadingLeetcode ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {leetcodeProblems.map((prob, idx) => {
                const isCompleted = completedProblems.includes(prob.name);
                const diffColor = prob.difficulty === 'Easy' ? 'var(--accent-green)' : (prob.difficulty === 'Medium' ? 'var(--accent-orange)' : 'var(--accent-pink)');
                return (
                  <div
                    key={idx}
                    className="glass-panel"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1.5rem',
                      textAlign: 'left',
                      borderColor: isCompleted ? 'var(--accent-green)' : 'var(--border-light)',
                      background: isCompleted ? 'rgba(16, 185, 129, 0.03)' : 'var(--bg-card)'
                    }}
                  >
                    {/* Completion Checkbox */}
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleProblemCompletion(prob.name)}
                      style={{
                        width: '22px',
                        height: '22px',
                        accentColor: 'var(--accent-green)',
                        cursor: 'pointer',
                        marginTop: '0.25rem',
                        flexShrink: 0
                      }}
                    />

                    {/* Details */}
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white' }}>{prob.name}</h4>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: `rgba(255, 255, 255, 0.05)`,
                            border: `1px solid ${diffColor}`,
                            color: diffColor
                          }}>
                            {prob.difficulty}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({prob.category})</span>
                        </div>
                        {prob.link && (
                          <a
                            href={prob.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--secondary)', textDecoration: 'none', fontWeight: 600 }}
                          >
                            Solve on LeetCode <ExternalLink size={14} />
                          </a>
                        )}
                      </div>

                      <p style={{ fontSize: '0.925rem', color: '#cbd5e1' }}>
                        <strong>Importance:</strong> {prob.importance}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
