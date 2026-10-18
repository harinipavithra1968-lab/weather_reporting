import React, { useState } from 'react';
import { CloudSun, Eye, EyeOff } from 'lucide-react';
import {
  Mail,
  LockKeyhole,
  UserRound,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function Register({ onRegister, onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('Please complete all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    onRegister({ name: name.trim(), email: email.trim(), password });
  }

  return (
    <div className="auth-card register-card">
      <div className="mobile-auth-mark"><UserRound size={25} /></div>
      <div className="form-eyebrow">GET STARTED FOR FREE</div>
      <h2>Create your account</h2>
      <p className="form-subtitle">Make every forecast feel a little more personal.</p>
      <form onSubmit={submit} noValidate>
        <label className="field-label" htmlFor="register-name">Full name</label>
        <div className="auth-input-wrap"><UserRound size={17} /><input id="register-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" /></div>
        <label className="field-label" htmlFor="register-email">Email address</label>
        <div className="auth-input-wrap"><Mail size={17} /><input id="register-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></div>
        <label className="field-label" htmlFor="register-password">Password</label>
        <div className="auth-input-wrap"><LockKeyhole size={17} /><input id="register-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" /><button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
        <label className="field-label" htmlFor="register-confirm">Confirm password</label>
        <div className="auth-input-wrap"><LockKeyhole size={17} /><input id="register-confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter your password" autoComplete="new-password" /></div>
        {error && <div className="auth-error" role="alert"><AlertCircle size={16} />{error}</div>}
        <button className="auth-submit" type="submit">Create account <ArrowRight size={17} /></button>
      </form>
      <div className="auth-switch">Already have an account? <button type="button" onClick={onLogin}>Sign in</button></div>
      <div className="auth-divider"><span>YOUR WEATHER, YOUR WAY</span></div>
      <div className="auth-feature-row"><span>Personal dashboard</span><span>Free to explore</span></div>
    </div>
  );
}