import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';
import { useAuth } from '@/lib/auth.jsx';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

export default function AdminCalendar() {
  const { profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', event_type: 'event', course: '', event_date: '', end_date: '' });
  const [error, setError] = useState(null);

  const canManage = profile?.role === 'admin' || (profile?.permissions?.includes('manage_calendar') ?? false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getEvents();
      setEvents(data || []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await api.createEvent({
        title: form.title,
        description: form.description || '',
        event_type: form.event_type,
        course: form.course || null,
        event_date: form.event_date,
        end_date: form.end_date || null,
      });

      setForm({ title: '', description: '', event_type: 'event', course: '', event_date: '', end_date: '' });
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      setError(err.message || 'Failed to create event');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.deleteEvent(id);
      fetchEvents();
    } catch {
      // ignore
    }
  };

  const typeIcon = (type) => {
    const map = { class: 'bi-book', exam: 'bi-pencil-square', holiday: 'bi-calendar-x', event: 'bi-calendar-event' };
    return map[type] || 'bi-calendar3';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0"><i className="bi bi-calendar3 me-2"></i>Academic Calendar</h5>
        {canManage && (
          <button className="btn btn-navy" onClick={() => setShowForm(!showForm)}>
            <i className="bi bi-plus-circle me-1"></i> Add Event
          </button>
        )}
      </div>

      {showForm && canManage && (
        <div className="scim-card mb-3 fade-in">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0"><i className="bi bi-plus-circle me-2"></i>Add Calendar Event</h6>
              <button className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => setShowForm(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="scim-form-label">Title</label>
                  <input className="scim-form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="scim-form-label">Event Type</label>
                  <select className="form-select scim-form-control" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
                    <option value="event">Event</option>
                    <option value="class">Class</option>
                    <option value="exam">Exam</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="scim-form-label">Description</label>
                  <input className="scim-form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="scim-form-label">Course (optional)</label>
                  <select className="form-select scim-form-control" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                    <option value="">All Courses</option>
                    <option value="BBA">BBA</option>
                    <option value="BCA">BCA</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="scim-form-label">Start Date</label>
                  <input type="date" className="scim-form-control" required value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="scim-form-label">End Date (optional)</label>
                  <input type="date" className="scim-form-control" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
                {error && <div className="col-12"><div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>{error}</div></div>}
                <div className="col-12">
                  <button type="submit" className="btn btn-navy">Add Event</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <EmptyState icon="bi-calendar3" title="No calendar events" message="Add academic events, exams, and holidays." />
      ) : (
        <div className="row g-3">
          {events.map((ev) => (
            <div className="col-md-6 col-lg-4" key={ev.id}>
              <div className="scim-card h-100">
                <div className="card-body p-3">
                  <div className="d-flex align-items-start gap-3">
                    <div className="stat-icon bg-gold">
                      <i className={`bi ${typeIcon(ev.event_type)}`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 style={{ fontSize: '0.92rem' }}>{ev.title}</h6>
                      <p className="text-muted-custom mb-1" style={{ fontSize: '0.78rem' }}>
                        {new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {ev.end_date && ` — ${new Date(ev.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                      </p>
                      <div className="d-flex flex-wrap gap-1">
                        <span className={`badge-role-${ev.event_type === 'exam' ? 'admin' : ev.event_type === 'holiday' ? 'student' : 'comember'}`} style={{ fontSize: '0.7rem' }}>
                          {ev.event_type}
                        </span>
                        {ev.course && <span className={`badge-course-${ev.course?.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>{ev.course}</span>}
                      </div>
                      {ev.description && <p className="text-secondary-custom mt-2 mb-0" style={{ fontSize: '0.82rem' }}>{ev.description}</p>}
                    </div>
                    {canManage && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(ev.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
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
