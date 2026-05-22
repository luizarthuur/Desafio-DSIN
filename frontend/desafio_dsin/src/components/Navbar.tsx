import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Usuario } from '../types';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null') as Usuario | null;

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', gap: 20, background: '#f0f0f0', padding: 10 }}>
      {usuario ? (
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
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
};

export default Navbar;