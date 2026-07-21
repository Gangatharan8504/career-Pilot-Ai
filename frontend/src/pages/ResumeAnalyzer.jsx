import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { UploadCloud, CheckCircle2, AlertTriangle, Search, Briefcase, DollarSign, Award, Star, ListChecks } from 'lucide-react';

export default function ResumeAnalyzer({ userId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);

  // Load existing analysis on mount
  useEffect(() => {
    const fetchExistingAnalysis = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/uploadResume`, {
          headers: { 'X-User-Id': userId }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.analysis) {
            setAnalysis(JSON.parse(data.analysis));
          }
        }
      } catch (err) {
        console.error('Failed to load existing analysis', err);
      }
    };
    fetchExistingAnalysis();
  }, [userId]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(50);
      const response = await fetch(`${API_BASE_URL}/uploadResume`, {
        method: 'POST',
        headers: {
          'X-User-Id': userId
        },
        body: formData
      });

      setUploadProgress(80);
      const data = await response.json();
      if (!response.ok) {
        const errMsg = data.details ? `${data.error} (${data.details})` : (data.error || 'Failed to analyze resume.');
        throw new Error(errMsg);
      }

      setUploadProgress(100);
      if (data.analysis) {
        setAnalysis(JSON.parse(data.analysis));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="glowing-title">Resume Analyzer</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Optimize your resume for applicant tracking systems (ATS) and get tailored improvement plans.
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

      {/* Upload Zone */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>
        <form onSubmit={handleUpload}>
          <div style={{
            border: '2px dashed var(--border-light)',
            borderRadius: '12px',
            padding: '2.5rem',
            background: 'rgba(255, 255, 255, 0.01)',
            cursor: 'pointer',
            position: 'relative',
            marginBottom: '1.5rem'
          }}>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <UploadCloud size={48} style={{ color: 'var(--primary)' }} />
              <div>
                <span style={{ fontWeight: 600, color: 'white' }}>Choose a PDF file</span> or drag it here
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Only PDF files up to 10MB are supported
              </div>
              {file && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid var(--primary)',
                  borderRadius: '20px',
                  color: 'white',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  Selected: {file.name}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ minWidth: '160px' }}
            disabled={loading}
          >
            {loading ? `Analyzing (${uploadProgress}%)` : 'Analyze Resume'}
          </button>
        </form>
      </div>

      {/* Analysis Results Display */}
      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Main summary row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            
            {/* ATS Score card */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: `conic-gradient(${analysis.atsScore >= 75 ? 'var(--accent-green)' : 'var(--accent-orange)'} 0% ${analysis.atsScore}%, rgba(255,255,255,0.05) ${analysis.atsScore}% 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#0c111c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'white'
                }}>
                  {analysis.atsScore}
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>
                  ATS Score Analysis
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {analysis.atsScore >= 75 
                    ? 'Excellent score! Your resume matches the industry standard format well.' 
                    : 'Weak score. Optimize formatting and add missing skills to increase your visibility.'}
                </p>
              </div>
            </div>

            {/* Expected Salary and Companies */}
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <DollarSign size={20} style={{ color: 'var(--accent-green)' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Expected Placement Salary:</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white' }}>{analysis.expectedSalary || 'N/A'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Briefcase size={20} style={{ color: 'var(--secondary)' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Top Eligible Companies:</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>
                    {analysis.topCompanies ? analysis.topCompanies.join(', ') : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          {analysis.feedback && (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={20} style={{ color: 'var(--primary)' }} /> Placement Mentor Feedback
              </h3>
              <p style={{ color: 'white', lineHeight: '1.6', fontSize: '0.975rem' }}>{analysis.feedback}</p>
            </div>
          )}

          {/* Strong vs Weak points */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Strong Points */}
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-green)' }}>
                <CheckCircle2 size={20} /> Strong Points
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analysis.strongPoints && analysis.strongPoints.map((point, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>✓</span>
                    <span style={{ color: '#e2e8f0' }}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weak Points & Missing Skills */}
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-orange)' }}>
                <AlertTriangle size={20} /> Areas to Improve
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {analysis.weakPoints && analysis.weakPoints.map((point, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--accent-orange)', fontWeight: 'bold' }}>⚠</span>
                    <span style={{ color: '#e2e8f0' }}>{point}</span>
                  </li>
                ))}
              </ul>

              {analysis.missingSkills && analysis.missingSkills.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Missing High-Demand Skills:
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {analysis.missingSkills.map((skill, idx) => (
                      <span key={idx} style={{
                        padding: '0.35rem 0.75rem',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        color: 'var(--accent-orange)',
                        fontWeight: 500
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Projects and Certifications */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Recommended Projects */}
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ListChecks size={20} style={{ color: 'var(--primary)' }} /> Recommended Projects to Build
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {analysis.projectsToBuild && analysis.projectsToBuild.map((project, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
                    <span style={{ color: '#e2e8f0' }}>{project}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Certifications */}
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} style={{ color: 'var(--secondary)' }} /> Suggested Certifications
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {analysis.certifications && analysis.certifications.map((cert, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>★</span>
                    <span style={{ color: '#e2e8f0' }}>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Job Recommendations Section */}
          {analysis.jobRecommendations && analysis.jobRecommendations.length > 0 && (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', marginTop: '1.5rem' }}>
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
                <Briefcase size={20} /> Suggested Job Recommendations
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Based on your experience, current project builds, and technical profile, we recommend preparing for these target roles:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {analysis.jobRecommendations.map((job, idx) => (
                  <div key={idx} style={{
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', margin: 0 }}>
                        {job.title}
                      </h4>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(6, 182, 212, 0.15)',
                        border: '1px solid var(--secondary)',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        color: 'var(--secondary)',
                        fontWeight: 600
                      }}>
                        {job.matchPercentage}% Profile Match
                      </span>
                    </div>

                    <p style={{ color: '#cbd5e1', fontSize: '0.925rem', lineHeight: '1.5', margin: 0 }}>
                      {job.reason}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                      {/* Key Matched Skills */}
                      {job.keySkillsMatched && job.keySkillsMatched.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Matched Skills:</span>
                          {job.keySkillsMatched.map((skill, sIdx) => (
                            <span key={sIdx} style={{
                              padding: '0.15rem 0.5rem',
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              color: 'var(--accent-green)',
                              fontWeight: 500
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Suggested Companies */}
                      {job.suggestedCompanies && job.suggestedCompanies.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Companies:</span>
                          {job.suggestedCompanies.map((company, cIdx) => (
                            <span key={cIdx} style={{
                              padding: '0.15rem 0.5rem',
                              background: 'rgba(139, 92, 246, 0.1)',
                              border: '1px solid rgba(139, 92, 246, 0.2)',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              color: 'var(--primary)',
                              fontWeight: 500
                            }}>
                              {company}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
