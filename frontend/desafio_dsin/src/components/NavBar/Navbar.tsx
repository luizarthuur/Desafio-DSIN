import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import type { Usuario } from '../../types';
import './Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null') as Usuario | null;

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src="/cabeleleila-leila-vertical.png" alt="Logo Cabeleleila Leila" className="logo-navbar" />
      </div>
      {usuario ? (
        <div className="nav-user-area">
          <div className="user-greeting">
            <FaUserCircle className="user-icon" />
            <span>Bem-vindo, <strong>{usuario.nome}</strong> ({usuario.role})</span>
          </div>
          <div className="nav-links">
            {usuario.role === 'admin' ? (
              <>
                <Link to="/admin" className="nav-link">Dashboard</Link>
                <Link to="/admin/agendamentos" className="nav-link">Agendamentos</Link>
                <Link to="/admin/clientes" className="nav-link">Clientes</Link>
                <Link to="/admin/servicos" className="nav-link">Serviços</Link>
              </>
            ) : (
              <>
                <Link to="/agendamento" className="nav-link">Agendamento</Link>
                <Link to="/meus-agendamentos" className="nav-link">Meus Agendamentos</Link>
              </>
            )}
            <button onClick={logout} className="logout-button" title="Sair">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      ) : (
        <Link to="/login" className="navbar-loginbutton">Login</Link>
      )}
    </nav>
  );
};

export default Navbar;