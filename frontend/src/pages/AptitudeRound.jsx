import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { BookOpen, Brain, MessageSquareText, Award, CheckCircle2, XCircle, ChevronRight, HelpCircle } from 'lucide-react';

export default function AptitudeRound({ userId }) {
  const [category, setCategory] = useState(''); // 'aptitude', 'reasoning', 'verbal'
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionId: 'A' | 'B' | 'C' | 'D' }
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startTest = async (selectedCategory) => {
    setCategory(selectedCategory);
    setLoading(true);
    setError('');
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);

    try {
      const response = await fetch(`${API_BASE_URL}/aptitude/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ category: selectedCategory })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions.');
      }
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qId, optionKey) => {
    if (submitted) return;
    setAnswers(prev => ({
      ...prev,
      [qId]: optionKey
    }));
  };

  const handleSubmitQuiz = async () => {
    // Check if all answered
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const finalPercent = Math.round((correct / questions.length) * 100);
    setCorrectCount(correct);
    setScore(finalPercent);
    setSubmitted(true);

    // Save score to backend Progress profile
    try {
      const response = await fetch(`${API_BASE_URL}/aptitude/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ score: finalPercent, category })
      });
      if (!response.ok) {
        console.error('Failed to update score metrics in DB.');
      }
    } catch (err) {
      console.error('Error submitting aptitude score:', err);
    }
  };

  const handleReset = () => {
    setCategory('');
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setCorrectCount(0);
  };

  return (
    <div className="fade-in-slide">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="glowing-title">Aptitude Practice Round</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Enhance your quantitative math skills, logical deduction, and verbal communication competencies for placement filters.
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          padding: '0.75rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          textAlign: 'left'
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: '1rem' }}>
          <div className="spinner"></div>
          <div style={{ color: 'var(--text-muted)' }}>Gemini is drafting your practice questions...</div>
        </div>
      )}

      {/* 1. Category Selection View */}
      {!loading && !category && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          
          {/* Quantitative Aptitude */}
          <div className="glass-panel-interactive" onClick={() => startTest('aptitude')} style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.15)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Quantitative Aptitude</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Practice problems on averages, time &amp; distance, work, permutations, interest rates, and ratios.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginTop: 'auto' }}>
              Start Practice Test <ChevronRight size={14} />
            </div>
          </div>

          {/* Logical Reasoning */}
          <div className="glass-panel-interactive" onClick={() => startTest('reasoning')} style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Brain size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Logical Reasoning</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Auditing puzzles, data arrangements, blood relations, syllogisms, and number/letter sequences.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600, marginTop: 'auto' }}>
              Start Practice Test <ChevronRight size={14} />
            </div>
          </div>

          {/* Verbal Ability */}
          <div className="glass-panel-interactive" onClick={() => startTest('verbal')} style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(236, 72, 153, 0.15)',
              color: 'var(--accent-pink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MessageSquareText size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Verbal Ability</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Practice grammar structures, synonyms &amp; antonyms, comprehension contexts, and word matching.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--accent-pink)', fontWeight: 600, marginTop: 'auto' }}>
              Start Practice Test <ChevronRight size={14} />
            </div>
          </div>

        </div>
      )}

      {/* 2. Quiz Questions View */}
      {!loading && category && questions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}>
          
          {/* Back button or score display */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={handleReset} className="btn btn-secondary">
              Back to Categories
            </button>
            {submitted && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
                <Award style={{ color: 'var(--primary)' }} />
                <span>Test Score: {correctCount}/{questions.length} ({score}%)</span>
              </div>
            )}
          </div>

          {/* Scrollable Questions list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {questions.map((q, qIdx) => {
              const selectedAnswer = answers[q.id];
              const isCorrect = selectedAnswer === q.correctAnswer;
              
              return (
                <div key={q.id} className="glass-panel" style={{
                  padding: '2rem',
                  border: submitted 
                    ? (isCorrect ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)') 
                    : '1px solid var(--border-light)',
                  background: submitted
                    ? (isCorrect ? 'rgba(16, 185, 129, 0.03)' : 'rgba(239, 68, 68, 0.03)')
                    : 'var(--bg-card)'
                }}>
                  
                  {/* Question Title */}
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '1.25rem' }}>
                    Q{qIdx + 1}. {q.question}
                  </h4>

                  {/* MCQ Options grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                    {Object.entries(q.options).map(([key, text]) => {
                      const isSelected = selectedAnswer === key;
                      const isCorrectOption = q.correctAnswer === key;
                      
                      let optionBg = 'rgba(255, 255, 255, 0.02)';
                      let optionBorder = '1px solid var(--border-light)';
                      let optionColor = 'white';

                      if (submitted) {
                        if (isCorrectOption) {
                          optionBg = 'rgba(16, 185, 129, 0.15)';
                          optionBorder = '1px solid var(--accent-green)';
                          optionColor = 'var(--accent-green)';
                        } else if (isSelected) {
                          optionBg = 'rgba(239, 68, 68, 0.15)';
                          optionBorder = '1px solid var(--accent-pink)';
                          optionColor = 'var(--accent-pink)';
                        }
                      } else if (isSelected) {
                        optionBg = 'rgba(139, 92, 246, 0.15)';
                        optionBorder = '1px solid var(--primary)';
                        optionColor = 'var(--primary)';
                      }

                      return (
                        <div
                          key={key}
                          onClick={() => handleSelectAnswer(q.id, key)}
                          style={{
                            padding: '1rem',
                            borderRadius: '10px',
                            background: optionBg,
                            border: optionBorder,
                            color: optionColor,
                            cursor: submitted ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: isSelected || (submitted && isCorrectOption) ? 600 : 400,
                            transition: 'var(--transition-smooth)'
                          }}
                        >
                          <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                            color: isSelected ? 'white' : 'var(--text-muted)',
                            fontSize: '0.85rem',
                            fontWeight: 700
                          }}>
                            {key}
                          </span>
                          <span>{text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation panel */}
                  {submitted && q.explanation && (
                    <div style={{
                      marginTop: '1.5rem',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderTop: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      color: 'var(--text-muted)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                        <HelpCircle size={16} style={{ color: 'var(--secondary)' }} /> Solution Explanation:
                      </div>
                      <p>{q.explanation}</p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Submit/Retry Footer controls */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            {!submitted ? (
              <button onClick={handleSubmitQuiz} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem' }}>
                Submit Test
              </button>
            ) : (
              <button onClick={handleReset} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem' }}>
                Take Another Practice Test
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
