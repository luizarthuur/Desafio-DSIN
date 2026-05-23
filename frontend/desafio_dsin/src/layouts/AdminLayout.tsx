import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/NavBar/Navbar';
import AdminSidebar from '../components/AdminSidebar/AdminSidebar';
import Footer from '../components/Footer/Footer';

const AdminLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="admin-container">
        <AdminSidebar />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
      <Footer />
    </>
  );
};

export default AdminLayout;