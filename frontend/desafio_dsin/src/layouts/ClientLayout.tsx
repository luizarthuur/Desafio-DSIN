import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/NavBar/Navbar';   // ajuste o caminho conforme sua estrutura
import Footer from '../components/Footer/Footer';

const ClientLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 80px - 100px)' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default ClientLayout;