# Frontend – Cabeleleila Leila

Aplicação React + TypeScript + Vite para gerenciamento de agendamentos do salão.

## Tecnologias
- React 18
- TypeScript
- Vite
- React Router DOM
- Axios
- React Icons

## Estrutura de pastas
frontend/
├── public/ # Ícones, imagens estáticas
├── src/
│ ├── components/ # Todos os componentes React
│ │ ├── AdminDashboard.tsx
│ │ ├── AdminAgendamentos.tsx
│ │ ├── AdminClientes.tsx
│ │ ├── AdminServicos.tsx
│ │ ├── Agendamento.tsx
│ │ ├── Login.tsx
│ │ ├── Registrar.tsx
│ │ ├── MeusAgendamentos.tsx
│ │ ├── Navbar.tsx
│ │ ├── Footer.tsx
│ │ ├── AdminSidebar.tsx
│ │ └── PrivateRoute.tsx
│ ├── layouts/ # AdminLayout, ClientLayout
│ ├── services/ # api.ts (configuração do Axios)
│ ├── types/ # Interfaces TypeScript
│ ├── App.tsx
│ ├── main.tsx
│ └── index.css # Estilos globais e variáveis CSS
├── .env
├── package.json
└── vite.config.ts

text

## Instalação e execução

```bash
cd frontend
npm install
npm run dev
Acesse http://localhost:5173.

Funcionalidades do frontend
Cliente (não autenticado)
Cadastro de novos clientes (/registrar)

Login (/login)

Cliente autenticado
Agendamento (/agendamento): escolher data/hora, selecionar múltiplos serviços, receber sugestão de reagendamento.

Meus Agendamentos (/meus-agendamentos): histórico com filtro por período, possibilidade de editar ou cancelar (respeitando a regra dos 2 dias).

Administrador
Dashboard (/admin): indicadores semanais, gráficos de barras, insights automáticos, navegação por semana.

Agenda (/admin/agendamentos): visualização semanal (slider + seletor de data), clicar no agendamento abre modal com detalhes, permite confirmar, cancelar (com justificativa) e alterar status de cada serviço individualmente.

Clientes (/admin/clientes): listagem, edição e exclusão de clientes.

Serviços (/admin/servicos): CRUD completo de serviços (nome, descrição, preço, duração, imagem).

Estilização
Cores personalizadas (ameixa, rosa queimado, dourado, nude) definidas em index.css como variáveis CSS.

Componentes com a classe .card e .button para consistência.

Layout responsivo com media queries básicas.

Ícones react-icons para melhor experiência visual.

Integração com o backend
Base URL configurada em services/api.ts (http://localhost:3000/api).

Interceptor adiciona automaticamente o token JWT no header Authorization.

Rotas protegidas verificam autenticação e papel do usuário.

Principais variáveis de ambiente
env
VITE_API_URL=http://localhost:3000/api  
Decisões técnicas
TypeScript para segurança de tipos e melhor manutenção.

React Router para rotas aninhadas e proteção com PrivateRoute.

Axios com interceptor para gerenciar token.

CSS moderno (grid, flexbox, variáveis) para adaptação a telas de diferentes tamanhos.

O frontend utiliza **Vitest** + **React Testing Library**.

### Comandos
```bash
npm test               # modo interativo (watch)
npm run test:run       # execução única
npm run test:ui        # interface gráfica

## ⚠️ Limitações conhecidas

- **Área administrativa**: otimizada para uso em desktop (largura mínima recomendada: 1024px). Em dispositivos móveis, a visualização da agenda semanal e das tabelas de clientes/serviços pode exigir rolagem horizontal ou apresentar quebras de layout. Recomenda-se o uso em computadores.
- **Testes do frontend**: devido a conflitos de módulo (duplicação de `node_modules`), alguns testes não estão sendo executados. A funcionalidade da aplicação não é afetada.