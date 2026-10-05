import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';
import { useAuth } from '@/lib/auth.jsx';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StudentCalendar() {
  const { profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data || []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventsForDate = (dateStr) => {
    return events.filter((ev) => {
      const evDate = ev.event_date;
      const evEnd = ev.end_date || ev.event_date;
      return dateStr >= evDate && dateStr <= evEnd;
    });
  };

  const isRelevant = (ev) => {
    if (!ev.course) return true;
    return ev.course === profile?.course;
  };

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, otherMonth: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const cellDate = new Date(year, month, d);
    cellDate.setHours(0, 0, 0, 0);
    cells.push({
      day: d,
      dateStr,
      isToday: cellDate.getTime() === today.getTime(),
      events: eventsForDate(dateStr).filter(isRelevant),
    });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, otherMonth: true });
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0"><i className="bi bi-calendar3 me-2"></i>Academic Calendar</h5>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={prevMonth}>
            <i className="bi bi-chevron-left"></i>
          </button>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', minWidth: 140, textAlign: 'center', lineHeight: '2rem' }}>
            {MONTH_NAMES[month]} {year}
          </span>
          <button className="btn btn-sm btn-outline-secondary" onClick={nextMonth}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="scim-card">
        <div className="card-body p-3">
          <div className="calendar-grid">
            {DAY_NAMES.map((d) => (
              <div key={d} className="calendar-day-name">{d}</div>
            ))}
            {cells.map((cell, idx) => (
              <div
                key={idx}
                className={`calendar-day ${cell.otherMonth ? 'other-month' : ''} ${cell.isToday ? 'today' : ''}`}
              >
                {cell.day}
                {cell.events && cell.events.map((ev) => (
                  <span
                    key={ev.id}
                    className={`calendar-event ${ev.event_type === 'exam' ? 'exam' : ev.event_type === 'holiday' ? 'holiday' : (ev.course || '').toLowerCase()}`}
                    title={ev.title}
                  >
                    {ev.title}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
