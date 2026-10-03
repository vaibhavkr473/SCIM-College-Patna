import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth.jsx';
import { api } from '@/lib/api.js';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState('request');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState(null);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError, profile } = await signIn(email, password);

      if (signInError) {
        setError(signInError);
        setLoading(false);
        return;
      }

      if (profile?.role === 'admin' || profile?.role === 'co_member') {
        navigate(from || '/admin', { replace: true });
      } else {
        navigate(from || '/student', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await api.forgotPassword(forgotEmail);

      if (result?.success) {
        setForgotStep('verify');
        setForgotMessage('A 7-digit OTP has been sent to your email. Enter it below with your new password.');
      } else {
        setError(result?.message || 'Could not process request.');
      }
    } catch (err) {
      setError(err.message || 'Could not process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await api.resetPassword(forgotEmail, otp, newPassword);

      if (result?.success) {
        setForgotMessage('Password updated successfully! You can now log in with your new password.');
        setTimeout(() => {
          setShowForgot(false);
          setForgotStep('request');
          setForgotEmail('');
          setOtp('');
          setNewPassword('');
          setForgotMessage(null);
        }, 3000);
      } else {
        setError(result?.message || 'Invalid or expired OTP.');
      }
    } catch (err) {
      setError(err.message || 'Could not reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">SC</div>
        <div className="text-center mb-4">
          <h4 className="fw-bold">SCIM College, Patna</h4>
          <p className="text-muted-custom" style={{ fontSize: '0.85rem' }}>Academic Portal Login</p>
        </div>

        {!showForgot ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="scim-form-label">Email Address</label>
              <input
                type="email"
                className="scim-form-control"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@scimpatna.org"
              />
            </div>
            <div className="mb-3">
              <label className="scim-form-label">Password</label>
              <input
                type="password"
                className="scim-form-control"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="alert alert-danger" style={{ fontSize: '0.85rem', padding: '0.6rem 0.9rem' }}>
                <i className="bi bi-exclamation-triangle me-1"></i> {error}
              </div>
            )}

            <div className="d-flex justify-content-end mb-3">
              <button
                type="button"
                className="btn btn-link p-0"
                style={{ fontSize: '0.82rem' }}
                onClick={() => { setShowForgot(true); setError(null); }}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="btn btn-navy w-100" disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-1"></span> Signing in...</>
              ) : (
                <><i className="bi bi-box-arrow-in-right me-1"></i> Sign In</>
              )}
            </button>

            <div className="text-center mt-3">
              <Link to="/" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <i className="bi bi-arrow-left me-1"></i> Back to Home
              </Link>
            </div>
          </form>
        ) : (
          <div className="fade-in">
            {forgotMessage && (
              <div className="alert alert-success" style={{ fontSize: '0.85rem', padding: '0.6rem 0.9rem' }}>
                <i className="bi bi-check-circle me-1"></i> {forgotMessage}
              </div>
            )}

            {forgotStep === 'request' ? (
              <form onSubmit={handleForgotRequest}>
                <div className="mb-3">
                  <label className="scim-form-label">Email Address</label>
                  <input
                    type="email"
                    className="scim-form-control"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your registered email"
                  />
                </div>
                {error && (
                  <div className="alert alert-danger" style={{ fontSize: '0.85rem', padding: '0.6rem 0.9rem' }}>
                    <i className="bi bi-exclamation-triangle me-1"></i> {error}
                  </div>
                )}
                <button type="submit" className="btn btn-navy w-100" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotVerify}>
                <div className="mb-3">
                  <label className="scim-form-label">7-Digit OTP</label>
                  <input
                    type="text"
                    className="scim-form-control"
                    required
                    maxLength={7}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="e.g. 1234567"
                  />
                </div>
                <div className="mb-3">
                  <label className="scim-form-label">New Password</label>
                  <input
                    type="password"
                    className="scim-form-control"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                  />
                </div>
                {error && (
                  <div className="alert alert-danger" style={{ fontSize: '0.85rem', padding: '0.6rem 0.9rem' }}>
                    <i className="bi bi-exclamation-triangle me-1"></i> {error}
                  </div>
                )}
                <button type="submit" className="btn btn-gold w-100" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link p-0"
                style={{ fontSize: '0.82rem' }}
                onClick={() => { setShowForgot(false); setError(null); setForgotMessage(null); setForgotStep('request'); }}
              >
                <i className="bi bi-arrow-left me-1"></i> Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
