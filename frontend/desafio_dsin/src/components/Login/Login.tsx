import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/api';
import './login.css'

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
      setErro('Login ou senha incorretos, tente novamente!');
    }
  };

  return (
    <div className="card-login">
      <img src="../public/Cabeleleialeila-horizontal.png" alt="logo" className='logo' />
      <h2 style={{ textAlign: 'center', marginBottom: 10, marginTop: 10 }}>Login - Cabeleleila Leila</h2>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label style={{ textAlign: 'center', marginBottom: 10 }}>Email:</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label style={{ textAlign: 'center', marginBottom: 10 }}>Senha:</label>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
        </div>
        <div className='loginbuttons'>
        <button type="submit">Entrar</button>
        <a href="/registrar" className='buttoncadastrar'>Cadastre-se</a>
        </div>
      </form>
    </div>
  );
};

export default Login;