import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Key } from 'lucide-react';

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

export default function Login({ onLoginSuccess, switchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot Password states
  const [showResetScreen, setShowResetScreen] = useState(false);
  const [resetPhase, setResetPhase] = useState(1); // 1: Email, 2: Verify & Change
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        const errMsg = data.details ? `${data.error} (${data.details})` : (data.error || 'Login failed. Please try again.');
        throw new Error(errMsg);
      }

      onLoginSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Request failed.');
      }

      setSuccess(data.message || 'Reset code sent to your email.');
      setResetPhase(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetOtp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed.');
      }

      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        setShowResetScreen(false);
        setResetPhase(1);
        setResetEmail('');
        setResetOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess('');
        setError('');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1.5rem',
      background: 'radial-gradient(circle at 50% 50%, #17112b 0%, #080b11 100%)'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        
        {showResetScreen ? (
          /* Forgot Password View */
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                marginBottom: '1rem',
                color: 'white',
                boxShadow: '0 8px 24px rgba(236, 72, 153, 0.3)'
              }}>
                <Key size={28} />
              </div>
              <h2 className="neon-glow-text" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
                <RevealText text="Reset Password" />
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                {resetPhase === 1 ? 'Enter your registered email to receive a code' : 'Verify reset code and choose a new password'}
              </p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '0.75rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                textAlign: 'left'
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
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}>
                {success}
              </div>
            )}

            {resetPhase === 1 ? (
              /* Reset Phase 1: Input Email */
              <form onSubmit={handleSendResetOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="email"
                      placeholder="you@university.edu"
                      className="form-input"
                      style={{ paddingLeft: '2.75rem' }}
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem' }}
                  disabled={loading}
                >
                  {loading ? 'Sending Code...' : 'Send Reset Code'}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            ) : (
              /* Reset Phase 2: Enter Code & Password */
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    className="form-input"
                    style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '4px' }}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="password"
                      placeholder="Min 6 characters"
                      className="form-input"
                      style={{ paddingLeft: '2.75rem' }}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="password"
                      placeholder="Confirm password"
                      className="form-input"
                      style={{ paddingLeft: '2.75rem' }}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem' }}
                  disabled={loading}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            )}

            <p style={{ marginTop: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
              Remember password?{' '}
              <span
                onClick={() => {
                  setShowResetScreen(false);
                  setResetPhase(1);
                  setError('');
                  setSuccess('');
                }}
                style={{
                  color: '#8b5cf6',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Back to Login
              </span>
            </p>
          </div>
        ) : (
          /* Standard Login Form */
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                marginBottom: '1rem',
                color: 'white',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
              }}>
                <LogIn size={28} />
              </div>
              <h2 className="neon-glow-text" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
                <RevealText text="Welcome Back" />
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                Sign in to access your placement preparation
              </p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '0.75rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="email"
                    placeholder="you@university.edu"
                    className="form-input"
                    style={{ paddingLeft: '2.75rem' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>
                    Password
                  </label>
                  <span 
                    onClick={() => {
                      setShowResetScreen(true);
                      setResetPhase(1);
                      setError('');
                      setSuccess('');
                    }}
                    style={{ color: '#8b5cf6', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Forgot Password?
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="form-input"
                    style={{ paddingLeft: '2.75rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <p style={{ marginTop: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
              Don't have an account?{' '}
              <span
                onClick={switchToRegister}
                style={{
                  color: '#8b5cf6',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Create account
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
