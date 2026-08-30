import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <span>Health Journey · Your records stay on your device</span>
      <span className="footer-links">
        <a href="#">Privacy</a>
        <a href="#">Data sources</a>
        <a href="#">Support</a>
      </span>
    </footer>
  );
}