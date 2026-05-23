import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import type { Servico } from '../../types';

const AdminServicos: React.FC = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao: 30,
    preco: 0,
    imagemUrl: '',
  });

  const carregarServicos = async () => {
    try {
      const res = await api.get('/admin/servicos');
      setServicos(res.data);
    } catch (error) {
      console.error('Erro ao carregar serviços', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarServicos();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este serviço?')) return;
    await api.delete(`/admin/servicos/${id}`);
    carregarServicos();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/servicos/${editingId}`, formData);
      } else {
        await api.post('/admin/servicos', formData);
      }
      setEditingId(null);
      setFormData({ nome: '', descricao: '', duracao: 30, preco: 0, imagemUrl: '' });
      carregarServicos();
    } catch (error) {
      alert('Erro ao salvar serviço');
    }
  };

  const handleEdit = (s: Servico) => {
    setEditingId(s.id);
    setFormData({
      nome: s.nome,
      descricao: s.descricao || '',
      duracao: s.duracao,
      preco: s.preco,
      imagemUrl: s.imagemUrl || '',
    });
  };

  if (loading) return <p>Carregando...</p>;

  // ... dentro do componente AdminServicos, após o estado e antes da listagem ...

return (
  <div style={{ padding: 20 }}>
    <h2 style={{marginBottom: 20}}>Gerenciar Serviços</h2>

    {/* Formulário */}
    <form onSubmit={handleSubmit} style={{
      background: 'var(--color-nude)',
      padding: 24,
      borderRadius: 20,
      marginBottom: 32,
      border: '1px solid var(--color-rose-light)'
    }}>
      <h3 style={{ marginBottom: 16 }}>{editingId ? 'Editar Serviço' : 'Novo Serviço'}</h3>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Nome do serviço *</label>
        <input
          type="text"
          value={formData.nome}
          onChange={e => setFormData({ ...formData, nome: e.target.value })}
          required
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Descrição</label>
        <textarea
          value={formData.descricao}
          onChange={e => setFormData({ ...formData, descricao: e.target.value })}
          rows={3}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Duração (minutos) *</label>
        <input
          type="number"
          min="1"
          value={formData.duracao}
          onChange={e => setFormData({ ...formData, duracao: +e.target.value })}
          required
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Preço (R$) *</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.preco}
          onChange={e => setFormData({ ...formData, preco: +e.target.value })}
          required
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>URL da imagem (opcional)</label>
        <input
          type="text"
          placeholder="https://exemplo.com/imagem.jpg"
          value={formData.imagemUrl}
          onChange={e => setFormData({ ...formData, imagemUrl: e.target.value })}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit">Salvar</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({ nome: '', descricao: '', duracao: 30, preco: 0, imagemUrl: '' });
            }}
            style={{ background: '#aaa' }}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>

    {/* Listagem de serviços */}
    <h3>Serviços cadastrados</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {servicos.map(s => (
        <div key={s.id} style={{
          border: '1px solid var(--color-rose-light)',
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'white'
        }}>
          <div>
            <strong style={{ fontSize: '1.1rem' }}>{s.nome}</strong>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>{s.descricao}</div>
            <div style={{ marginTop: 4 }}>
              <span>{s.duracao} min - </span> 
              <span>R$ {s.preco.toFixed(2)}</span>
            </div>
            {s.imagemUrl && <img src={s.imagemUrl} alt={s.nome} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => handleEdit(s)}>Editar</button>
            <button onClick={() => handleDelete(s.id)} style={{ background: '#dc3545' }}>Excluir</button>
          </div>
        </div>
      ))}
      {servicos.length === 0 && <p>Nenhum serviço cadastrado.</p>}
    </div>
  </div>
);
};

export default AdminServicos;