import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaCalendarAlt, FaUsers, FaCut, FaSignOutAlt } from 'react-icons/fa';
import './AdminSidebar.css';

const AdminSidebar: React.FC = () => {
  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <img src="/cabeleleila-leila-vertical.png" alt="Logo" className="sidebar-logo-img" />
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/admin" className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}>
          <FaTachometerAlt /> Dashboard
        </NavLink>
        <NavLink to="/admin/agendamentos" className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}>
          <FaCalendarAlt /> Agendamentos
        </NavLink>
        <NavLink to="/admin/clientes" className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}>
          <FaUsers /> Clientes
        </NavLink>
        <NavLink to="/admin/servicos" className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}>
          <FaCut /> Serviços
        </NavLink>
      </nav>
      <button onClick={logout} className="sidebar-logout">
        <FaSignOutAlt /> Sair
      </button>
    </aside>
  );
};

export default AdminSidebar;