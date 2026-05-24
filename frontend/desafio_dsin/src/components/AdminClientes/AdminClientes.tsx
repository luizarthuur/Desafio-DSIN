import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import type { Usuario } from '../../types';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const AdminClientes: React.FC = () => {
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', role: '' });

  const carregarClientes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/clientes');
      setClientes(res.data);
    } catch (error) {
      setMensagem({ texto: 'Erro ao carregar clientes', tipo: 'erro' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const handleEdit = (cliente: Usuario) => {
    setEditandoId(cliente.id);
    setFormData({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      role: cliente.role,
    });
  };

  const handleUpdate = async (id: number) => {
    try {
      await api.put(`/admin/clientes/${id}`, formData);
      setMensagem({ texto: 'Cliente atualizado com sucesso!', tipo: 'sucesso' });
      setEditandoId(null);
      carregarClientes();
      setTimeout(() => setMensagem(null), 3000);
    } catch (error) {
      setMensagem({ texto: 'Erro ao atualizar cliente', tipo: 'erro' });
    }
  };

  const handleDelete = async (id: number, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${nome}"? Esta ação não pode ser desfeita.`)) {
      try {
        await api.delete(`/admin/clientes/${id}`);
        setMensagem({ texto: 'Cliente excluído!', tipo: 'sucesso' });
        carregarClientes();
        setTimeout(() => setMensagem(null), 3000);
      } catch (error) {
        setMensagem({ texto: 'Erro ao excluir cliente', tipo: 'erro' });
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Carregando clientes...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 24 }}>👥 Gerenciar Clientes</h2>

      {mensagem && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            backgroundColor: mensagem.tipo === 'sucesso' ? '#e6f4ea' : '#fee',
            borderLeft: `4px solid ${mensagem.tipo === 'sucesso' ? 'green' : 'red'}`,
          }}
        >
          {mensagem.texto}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-rose-light)', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>ID</th>
              <th style={{ padding: 12 }}>Nome</th>
              <th style={{ padding: 12 }}>Email</th>
              <th style={{ padding: 12 }}>Telefone</th>
              <th style={{ padding: 12 }}>Role</th>
              <th style={{ padding: 12 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} style={{ borderBottom: '1px solid var(--color-rose-light)' }}>
                {editandoId === cliente.id ? (
                  <>
                    <td style={{ padding: 12 }}>{cliente.id}</td>
                    <td style={{ padding: 12 }}>
                      <input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
                    </td>
                    <td style={{ padding: 12 }}>
                      <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </td>
                    <td style={{ padding: 12 }}>
                      <input value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} />
                    </td>
                    <td style={{ padding: 12 }}>
                      <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                        <option value="cliente">Cliente</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: 12 }}>
                      <button onClick={() => handleUpdate(cliente.id)} style={{ marginRight: 8, background: '#28a745' }}>
                        <FaSave /> Salvar
                      </button>
                      <button onClick={() => setEditandoId(null)} style={{ background: '#6c757d' }}>
                        <FaTimes /> Cancelar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: 12 }}>{cliente.id}</td>
                    <td style={{ padding: 12 }}>{cliente.nome}</td>
                    <td style={{ padding: 12 }}>{cliente.email}</td>
                    <td style={{ padding: 12 }}>{cliente.telefone}</td>
                    <td style={{ padding: 12 }}>{cliente.role}</td>
                    <td style={{ padding: 12 }}>
                      <button onClick={() => handleEdit(cliente)} style={{ marginRight: 8 }}>
                        <FaEdit /> Editar
                      </button>
                      <button onClick={() => handleDelete(cliente.id, cliente.nome)} style={{ background: '#dc3545' }}>
                        <FaTrash /> Excluir
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminClientes;