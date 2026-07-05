import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { Award, FileText, CheckCircle2, Flame, HelpCircle, GraduationCap, ChevronRight, Brain } from 'lucide-react';

const RevealText = ({ text }) => {
  return (
    <span className="reveal-text">
      {text.split('').map((char, index) => (
        <span 
          key={index} 
          className="reveal-letter" 
          style={{ animationDelay: `${index * 25}ms`, whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default function Dashboard({ userId, userName, setTab }) {
  const [stats, setStats] = useState({
    totalProblemsSolved: 0,
    resumeScore: 0,
    interviewScore: 0,
    studyDays: 0,
    streak: 0,
    aptitudeScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/progress`, {
        headers: { 'X-User-Id': userId }
      });
      if (!response.ok) {
        throw new Error('Failed to load dashboard statistics.');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in-slide">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="glowing-title neon-glow-text">
          <RevealText text={`Welcome back, ${userName}!`} />
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Monitor your preparation, track milestones, and train with your placement mentor.
        </p>
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

      {/* Grid containing 4 stats cards */}
      <div className="dashboard-grid">
        {/* ATS Resume Score */}
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Resume ATS Score</span>
            <FileText size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="stat-value">{stats.resumeScore}%</div>
          <div className="stat-footer">
            {stats.resumeScore > 0 ? (
              <span style={{ color: 'var(--accent-green)' }}>Resume Uploaded</span>
            ) : (
              <span 
                onClick={() => setTab('resume')} 
                style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
              >
                Upload Resume Now
              </span>
            )}
          </div>
        </div>

        {/* Mock Interview Rating */}
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Interview Score</span>
            <Award size={20} style={{ color: 'var(--secondary)' }} />
          </div>
          <div className="stat-value">{stats.interviewScore}%</div>
          <div className="stat-footer">
            {stats.interviewScore > 0 ? (
              <span>Average score from mock sessions</span>
            ) : (
              <span 
                onClick={() => setTab('interview')} 
                style={{ color: 'var(--secondary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
              >
                Start First Mock Interview
              </span>
            )}
          </div>
        </div>

        {/* LeetCode Problems Solved */}
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Problems Solved</span>
            <CheckCircle2 size={20} style={{ color: 'var(--accent-green)' }} />
          </div>
          <div className="stat-value">{stats.totalProblemsSolved}</div>
          <div className="stat-footer">
            <span 
              onClick={() => setTab('study')} 
              style={{ color: 'var(--accent-green)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
            >
              Practice recommended LeetCode
            </span>
          </div>
        </div>

        {/* Preparation Daily Streak */}
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Daily Streak</span>
            <Flame size={20} style={{ color: 'var(--accent-orange)' }} />
          </div>
          <div className="stat-value">
            {stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}
          </div>
          <div className="stat-footer">
            <span>Keep completing daily tasks!</span>
          </div>
        </div>

        {/* Aptitude Practice Score */}
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Aptitude Score</span>
            <Brain size={20} style={{ color: 'var(--accent-pink)' }} />
          </div>
          <div className="stat-value">{stats.aptitudeScore}%</div>
          <div className="stat-footer">
            {stats.aptitudeScore > 0 ? (
              <span>Average MCQ quiz score</span>
            ) : (
              <span 
                onClick={() => setTab('aptitude')} 
                style={{ color: 'var(--accent-pink)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
              >
                Take Practice Quiz Now
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Preparation Hub Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
        
        {/* Quick Preparation Actions */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap style={{ color: 'var(--primary)' }} /> Quick Actions
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Direct access to core placement preparation features.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div 
              className="glass-panel-interactive" 
              onClick={() => setTab('resume')}
              style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px' }}
            >
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontWeight: 600, color: 'white' }}>Resume Analyzer</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Get your ATS score & resume feedback</p>
              </div>
              <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div 
              className="glass-panel-interactive" 
              onClick={() => setTab('interview')}
              style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px' }}
            >
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontWeight: 600, color: 'white' }}>Mock Interview Simulator</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Practice Java questions turn-by-turn with AI</p>
              </div>
              <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div 
              className="glass-panel-interactive" 
              onClick={() => setTab('study')}
              style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px' }}
            >
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontWeight: 600, color: 'white' }}>30-Day Placement Plan</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Create customizable roadmaps and track progress</p>
              </div>
              <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div 
              className="glass-panel-interactive" 
              onClick={() => setTab('aptitude')}
              style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px' }}
            >
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontWeight: 600, color: 'white' }}>Aptitude Practice Round</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Practice Quantitative, Reasoning, and Verbal MCQs</p>
              </div>
              <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {/* Preparation Insight box */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flame style={{ color: 'var(--accent-orange)' }} /> Placement Roadmap Progress
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Complete daily roadmap activities and coding challenges to keep your streak glowing!
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1rem' }}>
              {/* Custom Circular Progress */}
              <div style={{
                position: 'relative',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'conic-gradient(var(--primary) 0% 12%, rgba(255, 255, 255, 0.05) 12% 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{
                  width: '94px',
                  height: '94px',
                  borderRadius: '50%',
                  backgroundColor: '#0c111c',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                    {stats.studyDays}/30
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Days
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Roadmap Status:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>
                    {stats.studyDays > 0 ? `${Math.round((stats.studyDays / 30) * 100)}% Completed` : 'Not Started'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Latest Activity:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>
                    {stats.studyDays > 0 ? 'Day completed recently' : 'No records yet'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            marginTop: '2rem', 
            background: 'rgba(139, 92, 246, 0.05)', 
            border: '1px solid rgba(139, 92, 246, 0.1)', 
            padding: '1rem', 
            borderRadius: '12px',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            textAlign: 'left'
          }}>
            <strong>Placement Mentor Tip:</strong> Uploading your resume allows the AI to extract your core skills, pinpoint missing technologies, and generate a customized study plan to double your interview conversion rate!
          </div>
        </div>

      </div>
    </div>
  );
}
