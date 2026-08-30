import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <span>Health Journey · Your records are encrypted end-to-end</span>
      <span className="footer-links">
        <a href="#">Privacy</a>
        <a href="#">Data sources</a>
        <a href="#">Support</a>
      </span>
    </footer>
  );
}