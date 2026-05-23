import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Usuario } from '../../types';
import './Navbar.css'

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null') as Usuario | null;

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
<nav className="navbar">
<div className="logo"><img src="../public/cabeleleila-leila-vertical.png" alt="Logo" className='logo-navbar' /></div>      {usuario ? (
        <>
          <span>Olá, {usuario.nome} ({usuario.role})</span>
          {usuario.role === 'admin' ? (
            <Link to="/admin">Admin</Link>
          ) : (
            <>
              <Link to="/agendamento">Agendamento</Link>
              <Link to="/historico">Histórico</Link>
            </>
          )}
          <button onClick={logout}>Sair</button>
        </>
      ) : (
        <Link to="/login" className="navbar-loginbutton">Login</Link>
      )}
    </nav>
  );
};

export default Navbar;