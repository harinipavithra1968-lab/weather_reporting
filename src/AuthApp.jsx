import React, { useState } from 'react';
import { CloudSun } from 'lucide-react';

import App from './App.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';

function readUser() {
  try { return JSON.parse(localStorage.getItem('skycastUser') || 'null'); }
  catch { return null; }
}

export default function AuthApp() {
  const [user, setUser] = useState(() => readUser());
  const [page, setPage] = useState('login');

  function handleLogin(account) {
    localStorage.setItem('skycastUser', JSON.stringify(account));
    setUser(account);
  }


function handleRegister(account) {
  const newUser = {
    name: account.name,
    email: account.email
  };

  localStorage.setItem('skycastAccount', JSON.stringify(account));
  localStorage.setItem('skycastUser', JSON.stringify(newUser));

  setUser(newUser);
}

  function handleLogout() {
    localStorage.removeItem('skycastUser');
    setUser(null);
    setPage('login');
  }

  if (user) return <App onLogout={handleLogout} />;

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />
      <header className="auth-brand-row">
        <a className="auth-brand" href="#" aria-label="SkyCast home">
          <span className="auth-brand-icon"><CloudSun size={24} /></span>
          <span>sky<span>cast</span><small>WEATHER STUDIO</small></span>
        </a>
        <span className="auth-header-note">YOUR PERSONAL WEATHER SPACE</span>
      </header>
      <div className="auth-layout">
        <section className="auth-promo">
          <div className="promo-chip"><span /> WEATHER, REIMAGINED</div>
          <h1>Every day,<br />in a <span>better light.</span></h1>
          <p>Stay one step ahead of the weather. Your forecast, your plans, your world — all in one place.</p>
          <div className="promo-weather">
            <div className="promo-sun"><CloudSun size={62} strokeWidth={1.25} /></div>
            <div><span>YOUR DAY, AT A GLANCE</span><strong>Forecast with confidence.</strong><small>Live conditions · Hourly updates · 7-day outlook</small></div>
          </div>
          <div className="promo-decoration decoration-one" />
          <div className="promo-decoration decoration-two" />
        </section>
        <section className="auth-form-wrap">
          {page === 'login'
            ? <Login onLogin={handleLogin} onRegister={() => setPage('register')} />
            : <Register onRegister={handleRegister} onLogin={() => setPage('login')} />}
          <p className="auth-legal">By continuing, you agree to use SkyCast responsibly. <br />Weather data provided by Open-Meteo.</p>
        </section>
      </div>
      <footer className="auth-footer"><span>© {new Date().getFullYear()} SkyCast Weather Studio</span><span>Made for clearer days <span className="footer-star">✦</span></span></footer>
    </div>
  );
}