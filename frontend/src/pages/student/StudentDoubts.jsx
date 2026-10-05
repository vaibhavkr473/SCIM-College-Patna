import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api.js';
import { useAuth } from '@/lib/auth.jsx';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

export default function StudentDoubts() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('board');
  const [doubts, setDoubts] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ subject: '', question: '' });
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchDoubts();
  }, [profile]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const data = await api.getDoubts();
      setDoubts(data || []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const fetchResponses = async (doubtId) => {
    try {
      const data = await api.getDoubtResponses(doubtId);
      setResponses({ ...responses, [doubtId]: data || [] });
    } catch {
      setResponses({ ...responses, [doubtId]: [] });
    }
  };

  const toggleExpand = (doubtId) => {
    if (expandedId === doubtId) {
      setExpandedId(null);
    } else {
      setExpandedId(doubtId);
      if (!responses[doubtId]) fetchResponses(doubtId);
    }
  };

  const handleAskDoubt = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.question.trim()) return;
    setSubmitting(true);

    try {
      await api.createDoubt({
        subject: form.subject,
        question: form.question,
      });

      setForm({ subject: '', question: '' });
      fetchDoubts();
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleAIChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = { role: 'user', content: chatInput };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const data = await api.askTutor({
        question: chatInput,
        course: profile?.course,
        history: chatMessages.map((m) => ({ role: m.role, content: m.content })),
      });

      const aiMsg = { role: 'ai', content: data.answer || data.error || 'Sorry, I could not generate an answer.' };
      setChatMessages([...newMessages, aiMsg]);
    } catch {
      setChatMessages([...newMessages, { role: 'ai', content: 'The AI tutor is not available right now. Please try asking your professor on the Doubt Board tab.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <h5 className="fw-bold mb-3"><i className="bi bi-question-circle me-2"></i>Doubt Section</h5>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'board' ? 'active' : ''}`}
            onClick={() => setActiveTab('board')}
          >
            <i className="bi bi-people me-1"></i> Ask Professors
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            <i className="bi bi-robot me-1"></i> AI Tutor
          </button>
        </li>
      </ul>

      {activeTab === 'board' && (
        <div className="fade-in">
          <div className="scim-card mb-3">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3"><i className="bi bi-question-square me-2"></i>Ask a New Question</h6>
              <form onSubmit={handleAskDoubt}>
                <div className="mb-2">
                  <label className="scim-form-label">Subject</label>
                  <input
                    className="scim-form-control"
                    required
                    placeholder="e.g. Financial Accounting, Data Structures"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <label className="scim-form-label">Your Question</label>
                  <textarea
                    className="scim-form-control"
                    required
                    rows={3}
                    placeholder="Describe your question in detail..."
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-navy" disabled={submitting}>
                  {submitting ? 'Submitting...' : <><i className="bi bi-send me-1"></i> Submit Question</>}
                </button>
              </form>
            </div>
          </div>

          {doubts.length === 0 ? (
            <EmptyState icon="bi-question-circle" title="No questions yet" message="Ask a question and your professors will respond." />
          ) : (
            <div className="d-flex flex-column gap-2">
              {doubts.map((d) => (
                <div className="scim-card" key={d.id}>
                  <div className="card-body p-3" onClick={() => toggleExpand(d.id)} style={{ cursor: 'pointer' }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className={`badge-role-${d.is_answered ? 'student' : 'admin'}`} style={{ fontSize: '0.7rem' }}>
                            {d.is_answered ? 'Answered' : 'Pending'}
                          </span>
                          <strong style={{ fontSize: '0.88rem' }}>{d.subject}</strong>
                        </div>
                        <p className="mb-0" style={{ fontSize: '0.88rem' }}>{d.question}</p>
                      </div>
                      <i className={`bi ${expandedId === d.id ? 'bi-chevron-up' : 'bi-chevron-down'}`} style={{ fontSize: '0.9rem' }}></i>
                    </div>
                  </div>
                  {expandedId === d.id && (responses[d.id] || []).length > 0 && (
                    <div className="border-top border-custom p-3 fade-in">
                      {(responses[d.id] || []).map((r) => (
                        <div key={r.id} className="mb-2">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="badge-role-comember" style={{ fontSize: '0.68rem' }}>{r.responder_name}</span>
                            <span className="text-muted-custom" style={{ fontSize: '0.72rem' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="mb-0" style={{ fontSize: '0.86rem' }}>{r.response_text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="fade-in">
          <div className="scim-card mb-2">
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-2">
                <div className="stat-icon bg-gold" style={{ width: 36, height: 36, fontSize: '1rem' }}>
                  <i className="bi bi-robot"></i>
                </div>
                <div>
                  <strong style={{ fontSize: '0.9rem' }}>AI Tutor</strong>
                  <p className="text-muted-custom mb-0" style={{ fontSize: '0.76rem' }}>
                    Ask academic questions about {profile?.course} topics. Powered by Gemini AI.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="chat-container">
            <div className="chat-messages">
              {chatMessages.length === 0 && (
                <div className="text-center text-muted-custom py-4">
                  <i className="bi bi-robot" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-2 mb-0" style={{ fontSize: '0.85rem' }}>Ask me anything about your coursework!</p>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role === 'user' ? 'user' : 'ai'}`}>
                  {msg.content}
                </div>
              ))}
              {chatLoading && (
                <div className="chat-message ai">
                  <span className="spinner-border spinner-border-sm me-1"></span> Thinking...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form className="chat-input-area" onSubmit={handleAIChat}>
              <input
                className="scim-form-control"
                placeholder="Ask a question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
              />
              <button type="submit" className="btn btn-navy" disabled={chatLoading || !chatInput.trim()}>
                <i className="bi bi-send"></i>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
