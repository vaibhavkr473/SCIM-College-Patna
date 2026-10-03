import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '@/lib/api.js';
import { useAuth } from '@/lib/auth.jsx';
import LoadingSpinner from '@/components/shared/LoadingSpinner.jsx';

export default function TestTake() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [violationCount, setViolationCount] = useState(0);
  const [violationMsg, setViolationMsg] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const videoRef = useRef(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    async function fetchTest() {
      try {
        const data = await api.getTest(id);
        if (data) {
          setTest(data);
          setTimeLeft(data.duration_minutes * 60);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
    fetchTest();
  }, [id]);

  const submitTest = useCallback(async (autoSubmit = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);

    try {
      const questions = test.questions || [];
      let score = 0;
      let totalMarks = 0;

      questions.forEach((q) => {
        totalMarks += parseInt(q.marks) || 1;
        if (q.question_type === 'mcq') {
          const userAnswer = answers[q.order_index];
          if (userAnswer !== undefined && String(userAnswer) === String(q.correct_answer)) {
            score += parseInt(q.marks) || 1;
          }
        }
      });

      await api.submitTest({
        test_id: id,
        answers: answers,
        score: score,
        total_marks: totalMarks,
        status: 'submitted',
        violation_flags: violationCount,
      });

      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
      navigate('/student/tests');
    } catch {
      submittedRef.current = false;
      setSubmitting(false);
    }
  }, [test, answers, violationCount, profile, id, navigate, cameraStream]);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft, submitTest]);

  useEffect(() => {
    if (!started) return;

    const handleVisibility = () => {
      if (document.hidden) {
        setViolationCount((c) => {
          const newCount = c + 1;
          setViolationMsg(`Warning ${newCount}/3: You switched away from the test tab. This has been recorded.`);
          setTimeout(() => setViolationMsg(null), 4000);
          if (newCount >= 3) submitTest(true);
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [started, submitTest]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return true;
    } catch {
      setCameraError('Camera access denied. You can still take the test but violations will be recorded.');
      return false;
    }
  };

  const handleStart = async () => {
    const cameraOk = await startCamera();
    setStarted(true);
    if (!cameraOk) {
      setViolationCount(1);
    }
  };

  const handleAnswer = (qIndex, value) => {
    setAnswers({ ...answers, [qIndex]: value });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner />;

  if (!test) {
    return <div className="fade-in"><p className="text-muted-custom">Test not found.</p></div>;
  }

  if (!started) {
    return (
      <div className="fade-in test-container">
        <div className="scim-card">
          <div className="card-body p-4 text-center">
            <i className="bi bi-clipboard-check" style={{ fontSize: '3rem', color: 'var(--scim-gold)' }}></i>
            <h4 className="fw-bold mt-3">{test.title}</h4>
            <p className="text-muted-custom">{test.description}</p>
            <div className="d-flex justify-content-center gap-3 my-3">
              <div><strong>{test.duration_minutes}</strong> min</div>
              <div><strong>{(test.questions || []).length}</strong> questions</div>
            </div>
            <div className="alert alert-warning" style={{ fontSize: '0.85rem', maxWidth: 500, margin: '0 auto' }}>
              <i className="bi bi-exclamation-triangle me-1"></i>
              This test is proctored. Your camera will be active and tab switching is monitored.
              Switching tabs 3 times will auto-submit your test.
            </div>
            <button className="btn btn-navy mt-3" onClick={handleStart}>
              <i className="bi bi-play-circle me-1"></i> Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  const questions = test.questions || [];
  const timerClass = timeLeft < 60 ? 'danger' : timeLeft < 300 ? 'warning' : '';

  return (
    <div className="fade-in test-container">
      <div className="test-timer">
        <div>
          <strong>{test.title}</strong>
          <span className="text-muted-custom ms-2" style={{ fontSize: '0.8rem' }}>
            Violations: {violationCount}/3
          </span>
        </div>
        <div className={`test-timer-display ${timerClass}`}>{formatTime(timeLeft)}</div>
        <button className="btn btn-outline-danger btn-sm" onClick={() => submitTest(false)} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {violationMsg && (
        <div className="proctor-warning-banner">
          <i className="bi bi-exclamation-triangle"></i> {violationMsg}
        </div>
      )}

      {cameraError && (
        <div className="alert alert-warning" style={{ fontSize: '0.85rem' }}>
          <i className="bi bi-camera-video-off me-1"></i> {cameraError}
        </div>
      )}

      {questions.map((q, idx) => (
        <div className="test-question-card" key={idx}>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <strong>Q{idx + 1}. {q.question_text}</strong>
            <span className="badge-role-comember" style={{ fontSize: '0.7rem' }}>{q.marks || 1} mark{(q.marks || 1) > 1 ? 's' : ''}</span>
          </div>
          {q.question_type === 'mcq' ? (
            <div>
              {(q.options || []).map((opt, oIdx) => (
                <label key={oIdx} className={`test-option ${answers[q.order_index] === String(oIdx + 1) ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name={`q-${q.order_index}`}
                    value={String(oIdx + 1)}
                    checked={answers[q.order_index] === String(oIdx + 1)}
                    onChange={() => handleAnswer(q.order_index, String(oIdx + 1))}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              className="scim-form-control"
              rows={3}
              placeholder="Type your answer..."
              value={answers[q.order_index] || ''}
              onChange={(e) => handleAnswer(q.order_index, e.target.value)}
            />
          )}
        </div>
      ))}

      <div className="proctor-camera-container">
        <div className="proctor-camera-label">
          <i className="bi bi-camera-video"></i> LIVE
        </div>
        <video ref={videoRef} autoPlay muted playsInline />
      </div>
    </div>
  );
}
