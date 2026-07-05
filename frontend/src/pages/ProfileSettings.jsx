import React, { useState, useRef } from 'react';
import { User, Mail, Camera, Save, AlertCircle } from 'lucide-react';

export default function ProfileSettings({ userId, userName, userEmail, userProfilePic, onProfileUpdate }) {
  const [name, setName] = useState(userName || '');
  const [profilePic, setProfilePic] = useState(userProfilePic || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Fallback initials calculation
  const getInitials = (n) => {
    if (!n) return 'CP';
    const parts = n.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.substring(0, 2).toUpperCase();
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name || !name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8080/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ name })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setSuccess('Profile updated successfully!');
      onProfileUpdate(data.user); // update parent state/localStorage
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image file size must be less than 2MB.');
      return;
    }

    // Validate type (must be image)
    if (!file.type.startsWith('image/')) {
      setError('Only image files (JPG, PNG, WebP) are allowed.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8080/profile/upload-pic', {
        method: 'POST',
        headers: {
          'X-User-Id': userId
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image.');
      }

      setSuccess('Profile picture uploaded successfully!');
      setProfilePic(data.profilePic);
      onProfileUpdate(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const picUrl = profilePic ? `http://localhost:8080${profilePic}` : null;

  return (
    <div className="fade-in-slide">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="glowing-title">Profile Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your personal account, set your display name, and upload a profile picture.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        alignItems: 'start'
      }}>
        
        {/* Left Side: Avatar Panel */}
        <div className="glass-panel" style={{
          padding: '2.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          border: '1px solid var(--border-light)'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Profile Picture
          </h3>

          <div 
            onClick={triggerFileInput}
            style={{
              position: 'relative',
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              cursor: 'pointer',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.25)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease'
            }}
            className="profile-avatar-container"
          >
            {picUrl ? (
              <img 
                src={picUrl} 
                alt="Profile avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>
                {getInitials(name)}
              </span>
            )}

            {/* Hover overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(8, 11, 17, 0.65)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.25s ease',
              color: 'white'
            }} className="avatar-hover-overlay">
              <Camera size={20} style={{ marginBottom: '0.25rem' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Change</span>
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />

          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={triggerFileInput} 
            disabled={uploading}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
            Supports JPG, PNG, or WebP. Maximum file size allowed is 2MB.
          </p>
        </div>

        {/* Right Side: Profile Details form */}
        <div className="glass-panel" style={{
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          border: '1px solid var(--border-light)'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Account Details
          </h3>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '0.75rem',
              borderRadius: '12px',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#a7f3d0',
              padding: '0.75rem',
              borderRadius: '12px',
              fontSize: '0.9rem'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleUpdateName} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Email (Read-Only) */}
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Email Address (Read-only)
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{
                    paddingLeft: '2.75rem',
                    background: 'rgba(16, 22, 37, 0.25)',
                    color: '#64748b',
                    cursor: 'not-allowed',
                    borderColor: 'rgba(255, 255, 255, 0.03)'
                  }}
                  value={userEmail || ''}
                  disabled
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center', color: 'var(--text-muted)' }}>
                <AlertCircle size={14} style={{ color: '#475569' }} />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Email is locked to protect your credentials.
                </span>
              </div>
            </div>

            {/* Display Name (Editable) */}
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                Display Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Enter display name"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
              {!loading && <Save size={18} />}
            </button>
          </form>
        </div>

      </div>

      {/* CSS Styles injection for avatar camera hover effect */}
      <style dangerouslySetInnerHTML={{__html: `
        .profile-avatar-container:hover .avatar-hover-overlay {
          opacity: 1 !important;
        }
      `}} />
    </div>
  );
}
