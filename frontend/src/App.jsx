import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, MessageSquare, ShieldAlert, Award, Calendar, LogOut, GraduationCap, Menu, Brain, User } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import AIChat from './pages/AIChat';
import MockInterview from './pages/MockInterview';
import StudyPlanner from './pages/StudyPlanner';
import AdminDashboard from './pages/AdminDashboard';
import AptitudeRound from './pages/AptitudeRound';
import ProfileSettings from './pages/ProfileSettings';
import { API_BASE_URL } from './config';

export default function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // Responsive sidebar states
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load user session on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Close mobile drawer on link selection
  const handleTabSelect = (tab) => {
    setCurrentTab(tab);
    setMobileOpen(false);
  };

  if (!user) {
    if (isRegistering) {
      return (
        <Register
          switchToLogin={() => setIsRegistering(false)}
          onRegisterSuccess={() => setIsRegistering(false)}
        />
      );
    } else {
      return (
        <Login
          switchToRegister={() => setIsRegistering(true)}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }
  }

  // Admin Dashboard Render Branch
  if (user.role === 'admin') {
    return (
      <div className="dashboard-layout" style={{ '--sidebar-width': '0px' }}>
        <div className="main-container" style={{ marginLeft: 0, width: '100%' }}>
          <header className="top-header" style={{ padding: '0 2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <GraduationCap size={32} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: 0 }}>
                CareerPilot AI - Administrator Console
              </h2>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </header>
          <main className="main-content">
            <AdminDashboard userId={user.userId} onLogout={handleLogout} />
          </main>
        </div>
      </div>
    );
  }

  // Student Dashboard Render Branch
  return (
    <div className="dashboard-layout" style={{
      '--sidebar-width': sidebarCompact ? '80px' : '260px'
    }}>
      {/* Mobile Drawer Overlay */}
      <div 
        className={`mobile-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarCompact ? 'sidebar-compact' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="logo-container">
          <GraduationCap size={32} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span className="logo-text">CareerPilot AI</span>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-links">
            <li>
              <a
                href="#dashboard"
                onClick={() => handleTabSelect('dashboard')}
                className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard style={{ flexShrink: 0 }} /> 
                <span className="nav-link-text">Dashboard</span>
              </a>
            </li>
            <li>
              <a
                href="#resume"
                onClick={() => handleTabSelect('resume')}
                className={`nav-link ${currentTab === 'resume' ? 'active' : ''}`}
              >
                <FileText style={{ flexShrink: 0 }} /> 
                <span className="nav-link-text">Resume Analyzer</span>
              </a>
            </li>
            <li>
              <a
                href="#chat"
                onClick={() => handleTabSelect('chat')}
                className={`nav-link ${currentTab === 'chat' ? 'active' : ''}`}
              >
                <MessageSquare style={{ flexShrink: 0 }} /> 
                <span className="nav-link-text">AI Chat</span>
              </a>
            </li>
            <li>
              <a
                href="#interview"
                onClick={() => handleTabSelect('interview')}
                className={`nav-link ${currentTab === 'interview' ? 'active' : ''}`}
              >
                <Award style={{ flexShrink: 0 }} /> 
                <span className="nav-link-text">Mock Interview</span>
              </a>
            </li>
            <li>
              <a
                href="#aptitude"
                onClick={() => handleTabSelect('aptitude')}
                className={`nav-link ${currentTab === 'aptitude' ? 'active' : ''}`}
              >
                <Brain style={{ flexShrink: 0 }} /> 
                <span className="nav-link-text">Aptitude Round</span>
              </a>
            </li>
            <li>
              <a
                href="#study"
                onClick={() => handleTabSelect('study')}
                className={`nav-link ${currentTab === 'study' ? 'active' : ''}`}
              >
                <Calendar style={{ flexShrink: 0 }} /> 
                <span className="nav-link-text">Study Planner</span>
              </a>
            </li>
            <li>
              <a
                href="#profile"
                onClick={() => handleTabSelect('profile')}
                className={`nav-link ${currentTab === 'profile' ? 'active' : ''}`}
              >
                <User style={{ flexShrink: 0 }} /> 
                <span className="nav-link-text">Profile Settings</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* User Profile Footer */}
        <div className="user-profile-footer" style={{
          borderTop: '1px solid var(--border-light)',
          paddingTop: '1.25rem',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '0.75rem',
          textAlign: 'left'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.85rem',
            flexShrink: 0
          }}>
            {user.profilePic ? (
              <img 
                src={`${API_BASE_URL}${user.profilePic}`} 
                alt="User Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              user.name ? (user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()) : 'CP'
            )}
          </div>
          
          <div className="user-profile-details" style={{ flexGrow: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '0.75rem' }}>
          <button
            onClick={handleLogout}
            className="btn btn-secondary user-logout-btn"
            style={{ width: '100%', padding: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} /> 
            <span className="user-logout-btn-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="main-container">
        {/* Sticky Top Header Bar */}
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setMobileOpen(true)} className="mobile-hamburger-btn">
              <Menu size={24} />
            </button>
            <button onClick={() => setSidebarCompact(!sidebarCompact)} className="desktop-toggle-btn" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'var(--transition-smooth)'
            }}>
              <Menu size={20} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
              {currentTab === 'dashboard' ? 'Placement Dashboard' : 
               currentTab === 'resume' ? 'Resume ATS Analyzer' :
               currentTab === 'chat' ? 'Mentor AI Chat' :
               currentTab === 'interview' ? 'Mock Interview Simulator' :
               currentTab === 'aptitude' ? 'Aptitude Round Practice' : 
               currentTab === 'profile' ? 'Profile Settings' : 'Roadmap Study Planner'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }}></span>
            <span style={{ whiteSpace: 'nowrap' }}>Placement Mentor Active</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="main-content">
          {currentTab === 'dashboard' && <Dashboard userId={user.userId} userName={user.name} setTab={setCurrentTab} />}
          {currentTab === 'resume' && <ResumeAnalyzer userId={user.userId} />}
          {currentTab === 'chat' && <AIChat userId={user.userId} />}
          {currentTab === 'interview' && <MockInterview userId={user.userId} />}
          {currentTab === 'aptitude' && <AptitudeRound userId={user.userId} />}
          {currentTab === 'study' && <StudyPlanner userId={user.userId} />}
          {currentTab === 'profile' && (
            <ProfileSettings 
              userId={user.userId} 
              userName={user.name} 
              userEmail={user.email} 
              userProfilePic={user.profilePic} 
              onProfileUpdate={(updatedUser) => {
                const newUserData = { ...user, ...updatedUser };
                setUser(newUserData);
                localStorage.setItem('user', JSON.stringify(newUserData));
              }} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
