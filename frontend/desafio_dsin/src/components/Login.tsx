import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(email, senha);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      if (res.data.usuario.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/agendamento');
      }
    } catch (err) {
      setErro('Credenciais inválidas');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto' }} className="card">
      <h2 style={{ textAlign: 'center' }}>Login - Cabeleleila Leila</h2>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Senha:</label>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
        </div>
        <button type="submit">Entrar</button>
        <p>Não tem conta? <a href="/registrar">Cadastre-se</a></p>
      </form>
    </div>
  );
};

export default Login;