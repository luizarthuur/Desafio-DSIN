import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Agendamento from './components/Agendamento';
import Historico from './components/Historico';
import Admindashboard from './components/Admindashboard';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/agendamento" element={<PrivateRoute><Agendamento /></PrivateRoute>} />
        <Route path="/historico" element={<PrivateRoute><Historico /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute roleRequired="admin"><Admindashboard /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;