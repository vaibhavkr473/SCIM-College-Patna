import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';
import { useAuth } from '@/lib/auth.jsx';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

export default function AdminTests() {
  const { profile } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', course: 'BBA', semester: '1', duration_minutes: '30' });
  const [questions, setQuestions] = useState([{ question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '', marks: 1 }]);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);

  const canManage = profile?.role === 'admin' || (profile?.permissions?.includes('manage_tests') ?? false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const data = await api.getTests();
      setTests(data || []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '', marks: 1 }]);
  };

  const updateQuestion = (idx, field, value) => {
    setQuestions(questions.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions(questions.map((q, i) => {
      if (i !== qIdx) return q;
      const newOpts = [...q.options];
      newOpts[optIdx] = value;
      return { ...q, options: newOpts };
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      const questionsJsonb = questions.map((q, i) => ({
        order_index: i,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.question_type === 'mcq' ? q.options.filter(o => o.trim()) : null,
        correct_answer: q.correct_answer,
        marks: parseInt(q.marks) || 1,
      }));

      await api.createTest({
        title: form.title,
        description: form.description || '',
        course: form.course,
        semester: parseInt(form.semester),
        duration_minutes: parseInt(form.duration_minutes),
        questions: questionsJsonb,
      });

      setForm({ title: '', description: '', course: 'BBA', semester: '1', duration_minutes: '30' });
      setQuestions([{ question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '', marks: 1 }]);
      setShowForm(false);
      fetchTests();
    } catch (err) {
      setError(err.message || 'Failed to create test');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this test?')) return;
    try {
      await api.deleteTest(id);
      fetchTests();
    } catch {
      // ignore
    }
  };

  const toggleActive = async (t) => {
    try {
      await api.updateTest(t.id, { is_active: !t.is_active });
      fetchTests();
    } catch {
      // ignore
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0"><i className="bi bi-clipboard-check me-2"></i>Test Builder</h5>
        {canManage && (
          <button className="btn btn-navy" onClick={() => setShowForm(!showForm)}>
            <i className="bi bi-clipboard-plus me-1"></i> Create Test
          </button>
        )}
      </div>

      {showForm && canManage && (
        <div className="scim-card mb-3 fade-in">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0"><i className="bi bi-clipboard-plus me-2"></i>Create New Test</h6>
              <button className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => setShowForm(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="scim-form-label">Test Title</label>
                  <input className="scim-form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="scim-form-label">Description</label>
                  <input className="scim-form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="scim-form-label">Course</label>
                  <select className="form-select scim-form-control" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                    <option value="BBA">BBA</option>
                    <option value="BCA">BCA</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="scim-form-label">Semester</label>
                  <select className="form-select scim-form-control" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                    {[1, 2, 3, 4, 5, 6].map((s) => <option key={s} value={s}>Sem {s}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="scim-form-label">Duration (minutes)</label>
                  <input type="number" className="scim-form-control" required min={1} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
                </div>
              </div>

              <hr className="border-custom" />

              <h6 className="mb-3">Questions</h6>
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="scim-card-flat mb-3 p-3" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Question {qIdx + 1}</strong>
                    {questions.length > 1 && (
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))}>
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                  <div className="row g-2">
                    <div className="col-12">
                      <input className="scim-form-control" placeholder="Question text" required value={q.question_text} onChange={(e) => updateQuestion(qIdx, 'question_text', e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <select className="form-select scim-form-control" value={q.question_type} onChange={(e) => updateQuestion(qIdx, 'question_type', e.target.value)}>
                        <option value="mcq">Multiple Choice (MCQ)</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <input type="number" className="scim-form-control" placeholder="Marks" min={1} value={q.marks} onChange={(e) => updateQuestion(qIdx, 'marks', e.target.value)} />
                    </div>
                    {q.question_type === 'mcq' && (
                      <div className="col-12">
                        {q.options.map((opt, oIdx) => (
                          <input key={oIdx} className="scim-form-control mb-1" placeholder={`Option ${oIdx + 1}`} value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)} />
                        ))}
                      </div>
                    )}
                    <div className="col-12">
                      <input className="scim-form-control" placeholder={q.question_type === 'mcq' ? 'Correct option number (1, 2, 3, or 4)' : 'Expected answer (for reference)'} value={q.correct_answer} onChange={(e) => updateQuestion(qIdx, 'correct_answer', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className="btn btn-outline-secondary mb-3" onClick={addQuestion}>
                <i className="bi bi-plus-circle me-1"></i> Add Question
              </button>

              {error && <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>{error}</div>}
              <button type="submit" className="btn btn-navy" disabled={creating}>
                {creating ? 'Creating...' : 'Publish Test'}
              </button>
            </form>
          </div>
        </div>
      )}

      {tests.length === 0 ? (
        <EmptyState icon="bi-clipboard-check" title="No tests created yet" message="Create timed MCQ and short-answer tests for your students." />
      ) : (
        <div className="row g-3">
          {tests.map((t) => (
            <div className="col-md-6 col-lg-4" key={t.id}>
              <div className="scim-card h-100">
                <div className="card-body p-3">
                  <h6 style={{ fontSize: '0.95rem' }}>{t.title}</h6>
                  <p className="text-muted-custom" style={{ fontSize: '0.82rem' }}>{t.description}</p>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    <span className={`badge-course-${t.course?.toLowerCase()}`}>{t.course}</span>
                    <span className="badge-role-comember">Sem {t.semester}</span>
                    <span className="badge-role-admin"><i className="bi bi-clock"></i> {t.duration_minutes}m</span>
                    <span className={`badge-role-${t.is_active ? 'student' : 'comember'}`}>{t.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="d-flex gap-2">
                    {canManage && (
                      <>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleActive(t)}>
                          <i className="bi bi-toggle-on"></i> {t.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(t.id)}>
                          <i className="bi bi-trash me-1"></i> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
