import React from 'react';
import './Navbar.css';

export default function Navbar({ userName = "Ramaa Iyer" }) {
  const initials = userName.split(" ").map(n => n[0]).join("");

  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <div className="brand-logo">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.8 8.4h2.6l1.3-3.2 1.9 6 1.5-3.4 1 2.2h2.8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </div>
          <span className="brand-text">Health Journey</span>
        </div>

        <nav className="navbar-links">
          <a href="#" className="nav-link active">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2.2" y="2.2" width="5" height="5" rx="1.6" stroke="#0F172A" strokeWidth="1.4"></rect><rect x="8.8" y="2.2" width="5" height="5" rx="1.6" stroke="#0F172A" strokeWidth="1.4"></rect><rect x="2.2" y="8.8" width="5" height="5" rx="1.6" stroke="#0F172A" strokeWidth="1.4"></rect><rect x="8.8" y="8.8" width="5" height="5" rx="1.6" stroke="#0F172A" strokeWidth="1.4"></rect></svg>
            Dashboard
          </a>
          <a href="#" className="nav-link">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M4 13V8.5a4 4 0 018 0V3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"></path><circle cx="4" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.4"></circle><circle cx="12" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.4"></circle></svg>
            Journey
          </a>
          <a href="#" className="nav-link">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3.2 3.6A1.4 1.4 0 014.6 2.2h4.2l3.8 3.8v6.4a1.4 1.4 0 01-1.4 1.4H4.6a1.4 1.4 0 01-1.4-1.4V3.6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"></path><path d="M8.6 2.4V6h3.6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"></path></svg>
            Records
          </a>
          <a href="#" className="nav-link">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="6.2" cy="5.8" r="2.3" stroke="currentColor" strokeWidth="1.4"></circle><circle cx="11.4" cy="7" r="1.7" stroke="currentColor" strokeWidth="1.4"></circle><path d="M2.6 13c.5-2.1 1.9-3.2 3.6-3.2S9.3 10.9 9.8 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"></path></svg>
            Family
          </a>
        </nav>

        <div className="navbar-search">
          <label className="search-input-wrapper">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.4" stroke="#94A3B8" strokeWidth="1.5"></circle><line x1="9.4" y1="9.4" x2="12.6" y2="12.6" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"></line></svg>
            <input type="text" placeholder="Search records, medications, doctors…" />
            <span className="search-shortcut">⌘K</span>
          </label>
        </div>

        <div className="navbar-actions">
          <button className="notification-btn">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M4 6.6a4 4 0 018 0V10l1.2 1.8H2.8L4 10V6.6z" stroke="#334155" strokeWidth="1.4" strokeLinejoin="round"></path><path d="M6.6 13.4a1.6 1.6 0 002.8 0" stroke="#334155" strokeWidth="1.4" strokeLinecap="round"></path></svg>
            <span className="notification-dot"></span>
          </button>
          <div className="nav-divider"></div>
          <div className="user-profile-btn">
            <div className="user-avatar">{initials}</div>
            <span className="user-name">{userName}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 4l2.5 2.5L7.5 4" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </div>
        </div>
      </div>
    </header>
  );
}