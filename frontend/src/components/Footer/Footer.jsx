import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <span>Health Journey · Your records stay on your device</span>
      {/* Responsible AI review P-01: the vitals and health score are seeded
          demo values, not readings from a device. Presenting them without
          qualification invites a false belief about personal health. */}
      <span className="footer-demo-note">Demo build · vitals and health score are sample values, not device readings</span>
      <span className="footer-links">
        <a href="#">Privacy</a>
        <a href="#">Data sources</a>
        <a href="#">Support</a>
      </span>
    </footer>
  );
}