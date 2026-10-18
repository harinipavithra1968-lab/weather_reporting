
import React, { useState } from 'react';
import {
  CloudSun,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    let saved = null;

    try {
      saved = JSON.parse(
        localStorage.getItem('skycastAccount') || 'null'
      );
    } catch {
      saved = null;
    }

    if (saved) {
      if (
        saved.email.toLowerCase() !== email.trim().toLowerCase() ||
        saved.password !== password
      ) {
        setError('Email or password is incorrect.');
        return;
      }
    }

    const account = saved
      ? { name: saved.name, email: saved.email }
      : { name: email.trim().split('@')[0], email: email.trim() };

    onLogin(account);
  }

  return (
    <div className="auth-card">
      <div className="mobile-auth-mark">
        <CloudSun size={26} />
      </div>

      <div className="form-eyebrow">WELCOME BACK</div>
      <h2>Sign in to SkyCast</h2>
      <p className="form-subtitle">
        Your weather dashboard is just a moment away.
      </p>

      <form onSubmit={submit} noValidate>
        <label className="field-label" htmlFor="login-email">
          Email address
        </label>
        <div className="auth-input-wrap">
          <Mail size={17} />
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <label className="field-label" htmlFor="login-password">
          Password
        </label>
        <div className="auth-input-wrap">
          <LockKeyhole size={17} />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <button
            className="password-toggle"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <div className="form-options">
          <label className="remember-label">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <span className="demo-note">Demo sign-in</span>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button className="auth-submit" type="submit">
          Sign in <ArrowRight size={17} />
        </button>
      </form>

      <div className="auth-switch">
        New to SkyCast?{' '}
        <button type="button" onClick={onRegister}>
          Create an account
        </button>
      </div>

      <div className="auth-divider">
        <span>BUILT FOR EVERY FORECAST</span>
      </div>

      <div className="auth-feature-row">
        <span><CloudSun size={16} /> Live weather</span>
        <span>7-day outlook</span>
      </div>
    </div>
  );
}
