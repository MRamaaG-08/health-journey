import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';

const NAV_ITEMS = [
  {
    id: 'section-dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2.2" y="2.2" width="5" height="5" rx="1.6" stroke="currentColor" strokeWidth="1.4"></rect><rect x="8.8" y="2.2" width="5" height="5" rx="1.6" stroke="currentColor" strokeWidth="1.4"></rect><rect x="2.2" y="8.8" width="5" height="5" rx="1.6" stroke="currentColor" strokeWidth="1.4"></rect><rect x="8.8" y="8.8" width="5" height="5" rx="1.6" stroke="currentColor" strokeWidth="1.4"></rect></svg>
    )
  },
  {
    id: 'section-journey',
    label: 'Journey',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M4 13V8.5a4 4 0 018 0V3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"></path><circle cx="4" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.4"></circle><circle cx="12" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.4"></circle></svg>
    )
  },
  {
    id: 'section-records',
    label: 'Records',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3.2 3.6A1.4 1.4 0 014.6 2.2h4.2l3.8 3.8v6.4a1.4 1.4 0 01-1.4 1.4H4.6a1.4 1.4 0 01-1.4-1.4V3.6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"></path><path d="M8.6 2.4V6h3.6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"></path></svg>
    )
  },
  {
    id: 'section-family',
    label: 'Family',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="6.2" cy="5.8" r="2.3" stroke="currentColor" strokeWidth="1.4"></circle><circle cx="11.4" cy="7" r="1.7" stroke="currentColor" strokeWidth="1.4"></circle><path d="M2.6 13c.5-2.1 1.9-3.2 3.6-3.2S9.3 10.9 9.8 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"></path></svg>
    )
  }
];

// Bottom-row sections share one horizontal band of the page.
const BOTTOM_SECTION_IDS = ['section-records', 'section-family', 'section-emergency'];

export default function Navbar({ userName = "Ramaa Iyer", onNavigate }) {
  const initials = userName.split(" ").map(n => n[0]).join("");
  const [activeSection, setActiveSection] = useState('section-dashboard');

  // While a click-triggered smooth scroll is animating, the scroll spy must
  // not overwrite the section the user just chose.
  const spySuppressedUntil = useRef(0);

  // Scroll spy: highlights the nav item for whichever region is on screen.
  // Runs entirely in the browser — no API call, no AI call.
  //
  // Records, Family and Emergency sit side by side in the same row, so they
  // share a vertical position. They are treated as one "bottom" region and
  // whichever of them the user last chose stays highlighted while there.
  useEffect(() => {
    const topOf = (id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return el.getBoundingClientRect().top + window.scrollY;
    };

    const handleScroll = () => {
      if (Date.now() < spySuppressedUntil.current) return;

      const marker = window.scrollY + 140;
      const atPageBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 8;

      const recordsTop = topOf('section-records');
      const journeyTop = topOf('section-journey');

      let region;
      if (recordsTop !== null && (atPageBottom || marker >= recordsTop)) {
        region = 'bottom';
      } else if (journeyTop !== null && marker >= journeyTop) {
        region = 'section-journey';
      } else {
        region = 'section-dashboard';
      }

      setActiveSection(prev => {
        if (region !== 'bottom') return region;
        return BOTTOM_SECTION_IDS.includes(prev) ? prev : 'section-records';
      });
    };

    let frame = null;
    const onScroll = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        handleScroll();
      });
    };

    handleScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const handleNavClick = (sectionId) => {
    spySuppressedUntil.current = Date.now() + 1200;
    setActiveSection(sectionId);
    if (onNavigate) {
      onNavigate(sectionId);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <div className="brand-logo">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.8 8.4h2.6l1.3-3.2 1.9 6 1.5-3.4 1 2.2h2.8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </div>
          <span className="brand-text">Health Journey</span>
        </div>

        <nav className="navbar-links" aria-label="Dashboard sections">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              type="button"
              className={`nav-link${activeSection === item.id ? ' active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              aria-current={activeSection === item.id ? 'location' : undefined}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="navbar-search">
          <label className="search-input-wrapper">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.4" stroke="#94A3B8" strokeWidth="1.5"></circle><line x1="9.4" y1="9.4" x2="12.6" y2="12.6" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"></line></svg>
            <input
              type="text"
              placeholder="Search records, medications, doctors…"
              aria-label="Search records, medications and doctors"
            />
            <span className="search-shortcut">⌘K</span>
          </label>
        </div>

        <div className="navbar-actions">
          <button className="notification-btn" type="button" aria-label="Notifications">
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
