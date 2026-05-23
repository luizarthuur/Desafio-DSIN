import React from 'react';
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <p>© 2026 Cabeleleila Leila – Realçando sua beleza, elevando sua autoestima</p>
      <div className="social-icons">
        <a href="#" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
        <a href="#" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
        <a href="#" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
      </div>
    </footer>
  );
};

export default Footer;