import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';
import Login from './components/Login/Login';
import Registrar from './components/Registrar/Registrar';
import Agendamento from './components/Agendamento/Agendamento';
import MeusAgendamentos from './components/MeusAgendamentos/MeusAgendamentos';
import AdminDashboard from './components/Admindashboard/Admindashboard';
import AdminAgendamentos from './components/AdminAgendamentos/AdminAgendamentos';
import AdminClientes from './components/AdminClientes/AdminClientes';
import AdminServicos from './components/AdminServicos/AdminServicos';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ClientLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registrar" element={<Registrar />} />
          <Route path="/agendamento" element={<PrivateRoute><Agendamento /></PrivateRoute>} />
          <Route path="/meus-agendamentos" element={<PrivateRoute><MeusAgendamentos /></PrivateRoute>} />
        </Route>

        <Route path="/admin" element={<PrivateRoute roleRequired="admin"><AdminLayout /></PrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="agendamentos" element={<AdminAgendamentos />} />
          <Route path="clientes" element={<AdminClientes />} />
          <Route path="servicos" element={<AdminServicos />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="agendamentos" element={<AdminAgendamentos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;